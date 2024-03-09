<script lang="ts">
    import { goto } from "$app/navigation";
    import CreateFundingItem from "$lib/CreateFundingItem.svelte";
    import { type FundingItem } from "$lib/domain/FundingItemDomain.ts";
    import { launchCampaign } from "$lib/contract/Contract.js";
    import {
        ItemType,
        type CampaignPost,
    } from "$lib/domain/FundingItemDomain.js";
    import { insertPostData } from "$lib/repo/Repo.js";
    import { onMount } from "svelte";
    import { getWeb3Props } from "$lib/utils/Web3.js";
    import { gweiToEth } from "$lib/utils/getETHprice.js";

    export let data;
    let { supabase } = data;
    $: ({ supabase } = data);

    let web3Props = {
        success: false,
        data: null,
        error: "wallet not connected",
    } as Result<Web3Props>;

    $: web3Props;

    async function submit(fundingItem: FundingItem) {
        if (!web3Props.success) {
            console.log("no wallet connected");
            return;
        }

        if (fundingItem.type !== ItemType.CampaignPost) {
            alert("Only campaign posts can be created");
            return;
        }

        let post = fundingItem as CampaignPost;

        let resp = await launchCampaign(
            web3Props.data!.provider,
            gweiToEth(post.goal),
            post.endAt,
        );
        if (!resp.success) {
            alert(resp.error);
            return;
        }

        let txHash = resp.data!;
        post.transactionHash = txHash;
        post.creatorAddress = web3Props.data!.address;

        insertPostData(supabase, post).then((resp2) => {
            if (resp2.success) {
                goto("/");
            } else {
                alert(resp.error);
            }
        });
    }

    onMount(async () => {
        web3Props = await getWeb3Props();
    });
</script>

{#if web3Props.success}
    <CreateFundingItem {submit} fundingItemType={ItemType.CampaignPost} />
{:else}
    <div>
        <p>Please connect your wallet.</p>
    </div>
{/if}
