<script lang="ts">
    import { onMount } from "svelte";
    import {
        ItemStatus,
        type CampaignPost,
        type PledgeComment,
        ItemType,
    } from "$lib/domain/FundingItemDomain";
    import { type FundingItem } from "$lib/domain/FundingItemDomain.ts";
    import FundingItemComp from "$lib/FundingItem.svelte";
    import {
        fetchPostData,
        fetchCommentsData,
        insertCommentData,
        updatePostStatus,
        deletePostData,
        deleteCommentData,
        updateCommentStatus,
    } from "$lib/repo/Repo.js";
    import CreateFundingItem from "$lib/CreateFundingItem.svelte";
    import {
        unpledge,
        cancel,
        claim,
        getEventData,
        pledge,
        pledgedAmount,
    } from "$lib/contract/Contract.js";
    import { gweiToEth, weiToGwei } from "$lib/utils/getETHprice.js";
    import { getWeb3Props } from "$lib/utils/Web3.js";

    export let data;

    let { supabase, slug } = data;
    $: ({ supabase, slug } = data);

    let web3Props = {
        success: false,
        data: null,
        error: "wallet not connected",
    } as Result<Web3Props>;

    $: web3Props;
    let currentWeb3PropsAddress = "";

    let post: CampaignPost | undefined;
    $: post;

    let comments: PledgeComment[] | undefined;
    $: comments;

    let error: string | null = null;

    let shouldBeClaimed = false;

    let isCreator = false;

    $: {
        if (isCreator && shouldBeClaimed) {
            _claim();
        }
    }
    onMount(async () => {
        web3Props = await getWeb3Props();
        currentWeb3PropsAddress = web3Props.data?.address || "";

        let postId = slug.toLowerCase();
        let resp = await fetchPostData(supabase, postId);
        if (resp.success) {
            post = resp.data!;

            fetchCommentsData(supabase, post!.id).then((resp) => {
                if (resp.success) {
                    comments = resp.data!;
                    comments = comments.sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                    );
                    updateComments();
                }
            });
            if (web3Props.success) {
                isCreator =
                    post.creatorAddress.toLowerCase() ===
                    web3Props.data!.address.toLowerCase();
            }
            updatePost();
        } else {
            error = "Post with id (" + postId + ") not found";
        }
    });

    // 스마트 계약에 보낸 요청들의 tx 여부를 확인하고 업데이트합니다. 또한 펀딩 금액 등의 데이터를 최신화합니다.
    async function updatePost() {
        if (!web3Props.success) {
            console.log("no wallet connected");
            return;
        }
        if (!post) {
            console.log("no post");
            return;
        }
        if (post.status === ItemStatus.Cancel) {
            let txReceipt =
                await web3Props.data!.provider.getTransactionReceipt(
                    post.cancelTransactionHash,
                );
            if (txReceipt?.status === 1) {
                deletePostData(supabase, post!.id).then((_) => {
                    alert("The post has been deleted.");
                    window.location.href = "/";
                });
                return;
            }
        }

        let postToUpdate = {
            ...post,
        } as CampaignPost;

        if (
            post.status === ItemStatus.Pending ||
            post.status === ItemStatus.Failed
        ) {
            let txReceipt =
                await web3Props.data!.provider.getTransactionReceipt(
                    post!.transactionHash,
                );

            if (txReceipt) {
                if (txReceipt.status === 1) {
                    let args = getEventData(txReceipt.logs, "Launch");
                    if (args !== null) {
                        postToUpdate.contractCampaignId = Number(args[0]);
                        postToUpdate.available = true;
                        postToUpdate.status = ItemStatus.Valid;
                    }
                } else {
                    postToUpdate.available = false;
                    postToUpdate.status = ItemStatus.Failed;
                }
            }
        } else {
            let getPledgedAmount = await pledgedAmount(
                web3Props.data!.provider,
                post!.contractCampaignId,
                web3Props.data!.address,
            );

            if (getPledgedAmount.success) {
                postToUpdate.amount = weiToGwei(BigInt(getPledgedAmount.data!));
                if (postToUpdate.amount >= post.goal) {
                    shouldBeClaimed = true;
                }
            }
        }

        updatePostStatus(supabase, postToUpdate).then((resp) => {
            if (!resp.success) {
                console.log(resp.error);
            }
        });
    }

    async function _claim() {
        if (post && web3Props.success) {
            if (post.status === ItemStatus.Claimed) {
                return;
            }
            let yes = confirm(
                "This campaign has reached its goal. You should claim it. Press OK to claim.",
            );
            if (yes) {
                let postToUpdate = {
                    ...post,
                } as CampaignPost;
                let claimTxHash = await claim(
                    web3Props.data!.provider,
                    post!.contractCampaignId,
                );
                if (claimTxHash.success) {
                    postToUpdate.status = ItemStatus.Claimed;
                    postToUpdate.claimTransactionHash = claimTxHash.data!;
                } else {
                    postToUpdate.status = ItemStatus.Failed;
                }
                updatePostStatus(supabase, postToUpdate);
            }
        }
    }
    async function handleCommentCancel(fundingItem: FundingItem) {
        if (!web3Props.success) {
            console.log("no wallet connected");
            return;
        }
        if (!confirm("Are you sure you want to delete this comment?")) {
            return;
        }
        let _alert = "";

        if (fundingItem.type !== ItemType.PledgeComment) {
            _alert = "Only comments can be deleted.";
        }

        if (fundingItem.contractCampaignId === -1) {
            _alert =
                "The campaign is in confirmation progress, please try again later.";
        }

        let resp = await unpledge(
            web3Props.data!.provider,
            fundingItem.contractCampaignId,
            gweiToEth(fundingItem.amount),
        );

        if (resp.success) {
            let commentToUpdate = {
                ...fundingItem,
            } as PledgeComment;
            commentToUpdate.status = ItemStatus.Cancel;
            commentToUpdate.available = false;
            commentToUpdate.cancelTransactionHash = resp.data!;

            updateCommentStatus(supabase, commentToUpdate).then((resp) => {
                if (resp.success) {
                    alert(
                        "Comment delete has requested. Please wait for confirmation.",
                    );
                } else {
                    alert(resp.error);
                }
            });
        } else {
            alert(resp.error);
        }
    }
    async function handlePostCancel(fundingItem: FundingItem) {
        if (!web3Props.success) {
            console.log("no wallet connected");
            return;
        }
        if (!confirm("Are you sure you want to delete this post?")) {
            return;
        }
        let _alert = "";

        if (fundingItem.type !== ItemType.CampaignPost) {
            _alert = "Only campaign posts can be deleted.";
        }

        if (fundingItem.contractCampaignId === -1) {
            _alert =
                "The campaign is in confirmation progress, please try again later.";
        }

        if (fundingItem.status === ItemStatus.Claimed) {
            _alert = "The campaign has already been claimed.";
        }

        if (fundingItem.amount > 0) {
            _alert = "The campaign has been pledged. cannot be deleted.";
        }

        if (_alert !== "") {
            alert(_alert);
            return;
        }
        let resp = await cancel(
            web3Props.data!.provider,
            fundingItem.contractCampaignId,
        );
        if (resp.success) {
            let postToUpdate = {
                ...post,
            } as CampaignPost;
            postToUpdate.available = false;
            postToUpdate.status = ItemStatus.Cancel;
            postToUpdate.cancelTransactionHash = resp.data!;

            updatePostStatus(supabase, postToUpdate).then((resp) => {
                if (resp.success) {
                    alert(
                        "Post delete has been requested. Please wait for confirmation.",
                    );
                } else {
                    alert(resp.error);
                }
            });
        } else {
            alert(resp.error);
        }
    }

    async function updateComments() {
        if (!web3Props.success) {
            console.log("no wallet connected");
            return;
        }
        for (const comment of comments || []) {
            if (comment.status === ItemStatus.Cancel) {
                let txHash = comment.cancelTransactionHash;
                let txReceipt =
                    await web3Props.data!.provider.getTransactionReceipt(
                        txHash,
                    );
                if (txReceipt?.status === 1) {
                    deleteCommentData(supabase, comment.id).then((resp) => {
                        if (!resp.success) {
                            console.log(resp.error);
                        }
                    });
                }
                continue;
            }
            let commentToUpdate = {
                ...comment,
            };
            if (comment.status === ItemStatus.Pending) {
                let txHash = comment.transactionHash;
                let txReceipt =
                    await web3Props.data!.provider.getTransactionReceipt(
                        txHash,
                    );
                if (txReceipt) {
                    if (txReceipt.status === 1) {
                        commentToUpdate.available = true;
                        commentToUpdate.status = ItemStatus.Valid;
                    } else {
                        commentToUpdate.available = false;
                        commentToUpdate.status = ItemStatus.Failed;
                    }
                }
            }
            updateCommentStatus(supabase, commentToUpdate).then((resp) => {
                if (!resp.success) {
                    console.log(resp.error);
                }
            });
        }
    }

    async function submit(fundingItem: FundingItem) {
        if (!web3Props.success) {
            console.log("no wallet connected");
            return;
        }
        if (fundingItem.type !== ItemType.PledgeComment) {
            alert("Only comments can be created");
            return;
        }

        if (post && post.status !== ItemStatus.Valid) {
            alert("The post is " + post.status);
            return;
        }

        if (shouldBeClaimed) {
            alert("The post has reached its goal");
            return;
        }

        let comment = fundingItem as PledgeComment;

        let resp = await pledge(
            web3Props.data!.provider,
            post!.contractCampaignId,
            gweiToEth(comment.amount),
        );

        if (!resp.success) {
            alert(resp.error);
            return;
        }

        let txHash = resp.data!;
        comment.transactionHash = txHash;
        comment.creatorAddress = web3Props.data!.address;
        comment.campaignPostId = post!.id;
        comment.campaignAddress = post!.creatorAddress;
        comment.contractCampaignId = post!.contractCampaignId;
        insertCommentData(supabase, comment).then((resp2) => {
            if (resp2.success) {
                location.reload();
            } else {
                alert(resp2.error);
            }
        });
    }
</script>

{#if !post || !post.available}
    <p class="text-center">The campaign is loading or mining...</p>
{/if}

{#if error}
    <div class="error" style="color: red; font-weight: bold;">{error}</div>
{:else if post && web3Props && post.available}
    <FundingItemComp
        fundingItem={post}
        postViewMode={true}
        handleCancel={handlePostCancel}
        {currentWeb3PropsAddress}
    />
    <div class="centered-element">
        <div class="vertical-line"></div>
    </div>

    {#if comments}
        {#each comments as comment}
            <FundingItemComp
                fundingItem={comment}
                handleCancel={handleCommentCancel}
                {currentWeb3PropsAddress}
            />
            <br />
        {/each}
    {/if}
    <br />
    <br />
    {#if web3Props && post.status === ItemStatus.Valid}
        <CreateFundingItem {submit} fundingItemType={ItemType.PledgeComment} />
    {/if}
{/if}
