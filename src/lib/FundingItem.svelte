<script lang="ts">
    import { onMount } from "svelte";
    import { updateTimeAgo } from "./utils/TimeUtils";
    import { gweiToEth } from "./utils/getETHprice";
    import { ItemType, type FundingItem } from "./domain/FundingItemDomain";

    export let fundingItem: any;
    export let handleClick: () => void = () => {};
    export let handleCancel: (fundingItem: FundingItem) => void = () => {};

    export let postViewMode = false;
    export let currentWeb3PropsAddress = "";

    let isCreator = false;
    let timeAgo: string;
    let isCampaignPost = true;

    onMount(() => {
        isCampaignPost = fundingItem.type === ItemType.CampaignPost;
        isCreator =
            fundingItem.creatorAddress.toLowerCase() ===
            currentWeb3PropsAddress.toLowerCase();
            
        let time;

        if (isCampaignPost) {
            time = fundingItem.startAt;
        } else {
            time = fundingItem.createdAt;
        }
        timeAgo = updateTimeAgo(time);
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="funding-item"
    class:funding-item-postview={postViewMode}
    on:click={handleClick}
>
    <div>
        {#if !fundingItem.available}
            <div style="text-align: right; font-weight: bold;">Pending...</div>
        {/if}
        {#if isCampaignPost}
            <div>{fundingItem.title}</div>
        {:else}
            <div>{fundingItem.comment}</div>
        {/if}
    </div>
    {#if isCampaignPost}
        <div class="amount">
            {gweiToEth(fundingItem.amount).toLocaleString()} / {gweiToEth(
                fundingItem.goal,
            ).toLocaleString()} ETH
        </div>
    {:else}
        <div class="amount">
            {gweiToEth(fundingItem.amount).toLocaleString()} ETH
        </div>
    {/if}
    <div class="funding-item-detail">
        <div class="details">{fundingItem.creatorUsername}</div>
        <div class="details" style="margin: 0 5px">|</div>
        <div class="details">{timeAgo}</div>
    </div>
    {#if isCampaignPost && postViewMode}
        <div class="funding-item-description">{fundingItem.description}</div>
    {/if}
    {#if isCreator && (postViewMode || !isCampaignPost)}
        <div class="details" style="text-align: right;">
            <button
                on:click={() => {
                    handleCancel(fundingItem);
                }}
                style="cursor: pointer;">cancel</button
            >
        </div>
    {/if}
</div>
