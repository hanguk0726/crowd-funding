<script lang="ts">
    import {
        ItemType,
        type CampaignPost,
        ItemStatus,
        type PledgeComment,
    } from "./domain/FundingItemDomain";
    import { ethToGwei } from "./utils/getETHprice";
    import { v4 as uuidv4 } from "uuid";
    import { type FundingItem } from "./domain/FundingItemDomain";

    export let submit: (fundingItem: FundingItem) => Promise<void>;
    export let fundingItemType: ItemType;

    let isComment = fundingItemType === ItemType.PledgeComment;

    let error: string | null = null;

    let textEntry = "";
    let description = "";
    let fundingAmount = "";

    function endsWithDot(input: string): boolean {
        return /\.$/.test(input);
    }

    function handleChange(event) {
        let _inputValue = event.target.value;
        if (endsWithDot(_inputValue)) {
            fundingAmount = _inputValue;
            return;
        }
        if (!/^\d*(\.\d{1,2})?$/.test(_inputValue)) {
            alert("Please enter a number with up to two decimal places.");
            fundingAmount = "";
        } else {
            fundingAmount = _inputValue;
        }
    }

    async function _submit() {
        let now = new Date();
        let fundingItem;

        switch (fundingItemType) {
            case ItemType.CampaignPost: {
                fundingItem = {
                    amount: 0,
                    title: textEntry,
                    goal: ethToGwei(Number(fundingAmount)),
                    startAt: now,
                    endAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60), // 60 days
                    type: ItemType.CampaignPost,
                    available: false,
                    status: ItemStatus.Pending,
                    id: uuidv4(),
                    description,
                    contractCampaignId: -1, // update after mining
                    cancelTransactionHash: "",
                    claimTransactionHash: "",
                } as CampaignPost;
                break;
            }

            case ItemType.PledgeComment: {
                fundingItem = {
                    amount: ethToGwei(Number(fundingAmount)),
                    comment: textEntry,
                    createdAt: now,
                    id: uuidv4(),
                    type: ItemType.PledgeComment,
                    status: ItemStatus.Pending,
                    available: false,
                    cancelTransactionHash: "",
                } as PledgeComment;
                break;
            }
        }
        submit(fundingItem);
    }
</script>

{#if error}
    <p>{error}</p>
{:else}
    <main class="mx-auto">
        <div class="funding-item">
            <label for="textEntry"
                >{#if isComment}Comment{:else}Title{/if}</label
            >
            <input
                class="w-full border p-2 mb-4"
                bind:value={textEntry}
                id="textEntry"
            />
            <label for="fundingAmount"
                >{#if isComment}Funding Amount ETH{:else}Goal ETH{/if}</label
            >
            <input
                class="w-full border p-2 mb-4"
                bind:value={fundingAmount}
                on:input={handleChange}
                id="fundingAmount"
            />

            {#if !isComment}
                <label for="content">Description</label>
                <textarea
                    class="w-full border p-2 mb-4"
                    bind:value={description}
                    id="content"
                ></textarea>
            {/if}
            <button
                class="bg-blue-500 text-white py-2 px-4 rounded"
                on:click={_submit}>Submit</button
            >
        </div>
    </main>
{/if}
