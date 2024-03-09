<script lang="ts">
    import { generateIdenticon } from "$lib/utils/Identicon.js";

    export let address: string;
    export let username: string;
    export let handleApply: (p1: string) => Promise<void>;

    $: username;
    $: _username = username;

    let profilePictureSrc = generateIdenticon(address).toString();

    function handleUsernameChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        _username = inputElement.value;
    }

    $: isChanged = username !== _username;

    function _handleApply() {
        try {
            handleApply(_username);
            username = _username; //통신 성공시
        } catch (error) {
            console.error(error);
        }
    }
</script>

<div class="profile-section">
    <div class="profile-wrapper">
        <div
            class="profile-picture"
            style="background-image: url({profilePictureSrc})"
        />
    </div>
    <div class="profile-info">
        <input
            type="text"
            title="Username"
            id="username"
            bind:value={_username}
            on:input={handleUsernameChange}
            style="border: 1px solid #ccc; border-radius: 2px;"
        />
        <br />
        <p>{address}</p>
        <br />

        <button
            on:click={_handleApply}
            class="apply-button"
            disabled={!isChanged}
        >
            Apply
        </button>
    </div>
</div>

<style>
    .profile-wrapper {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: #f0f0f0;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .profile-section {
        min-width: 500px;
        max-width: 600px;
        height: 200px;
        display: flex;
        justify-content: space-between;
        align-items: top;
        margin-bottom: 1rem;
    }

    .profile-picture {
        width: 80%;
        height: 80%;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        margin-left: 1rem;
    }

    .apply-button {
        background-color: #3498db;
        color: #fff;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .apply-button:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }
</style>
