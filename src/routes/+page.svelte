<script lang="ts">
    import Profile from "$lib/Profile.svelte";
    import FundingBoard from "$lib/FundingBoard.svelte";
    import {
        fetchPostsData,
        updateUserData,
        fetchUserData,
    } from "$lib/repo/Repo.js";
    import { goto } from "$app/navigation";
    import permissionWalletConnect from "$lib/data/store.js";
    import type { CampaignPost } from "$lib/domain/FundingItemDomain";
    import { getWeb3Props } from "$lib/utils/Web3.js";
    import { onMount } from "svelte";

    export let data;
    let { supabase } = data;
    $: ({ supabase } = data);

    let web3Props = {
        success: false,
        data: null,
        error: "wallet not connected",
    } as Result<Web3Props>;

    $: isProfileModalOpen = false;

    const defaultUsername = "AnonymousUser";

    $: username = defaultUsername;

    let address: string;
    let posts: CampaignPost[];

    $: posts;

    $: {
        address = web3Props?.data?.address || "";
        fetchPostsData(supabase).then((resp) => {
            if (resp.success) {
                posts = resp.data!;
            }
        });
        if (web3Props.success) {
            fetchUserData(supabase, web3Props.data!.address).then((resp) => {
                if (resp.success) {
                    username = resp.data || defaultUsername;
                }
            });
        }
    }

    function goCreateCampaign() {
        if (web3Props.success) {
            goto("/post/create");
        } else {
            alert("Please connect your wallet");
        }
    }

    async function handleApply(username: string) {
        await updateUserData(supabase, username, web3Props.data!.address);
    }

    async function onClickConnectWallet() {
        permissionWalletConnect.set(true);
        try {
            web3Props = await getWeb3Props();
        } catch (error) {
            console.error(error);
        }
    }

    onMount(async () => {
        if (permissionWalletConnect) {
            try {
                web3Props = await getWeb3Props();
            } catch (error) {
                console.error(error);
            }
        }

        window.ethereum.on("accountsChanged", function (accounts) {
            getWeb3Props().then((resp) => {
                if (resp.success) {
                    web3Props = resp;
                }
            });
        });
    });
</script>

<div class="flex justify-end">
    <button
        on:click={goCreateCampaign}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2"
        >Create Campaign</button
    >

    {#if web3Props.success}
        <button
            class="btn mx-2"
            on:click={() => {
                isProfileModalOpen = true;
            }}
        >
            Profile
        </button>
    {:else}
        <button
            class="btn mx-2"
            on:click={async () => {
                onClickConnectWallet();
            }}
        >
            Connect Wallet
        </button>
    {/if}
</div>

<br />

<FundingBoard {posts} />

{#if isProfileModalOpen}
    <div
        class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75"
    >
        <div class="bg-white p-8 rounded-lg">
            <Profile {address} {username} {handleApply} />
            <button
                on:click={() => (isProfileModalOpen = false)}
                style="float:right;"
                class="font-bold">Close</button
            >
        </div>
    </div>
{/if}
