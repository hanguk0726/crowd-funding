<script lang="ts">
    import type { CampaignPost } from "./domain/FundingItemDomain";
    import FundingItem from "./FundingItem.svelte";
    import { goto } from "$app/navigation";

    export let posts: CampaignPost[];

    function handleClick(id: string) {
        goto("/post/view/" + id);
    }
</script>

<div class="funding-item-wrapper">
    {#if posts === undefined}
        <!-- empty -->
    {:else}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#each posts as post (post.id)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <FundingItem
                fundingItem={post}
                handleClick={() => handleClick(post.id)}
            />
            <br />
        {/each}
    {/if}
</div>
