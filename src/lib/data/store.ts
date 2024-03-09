import { browser } from '$app/environment';
import { getWeb3Props } from '$lib/utils/Web3';
import { writable } from 'svelte/store';

const defaultValue = false;
const initialValue = browser ? (window.localStorage.getItem('permissionWalletConnect') === "true") : defaultValue;

const permissionWalletConnect = writable<boolean>(initialValue);

permissionWalletConnect.subscribe((value) => {
    if (browser) {
        let _value = value ? "true" : "false";
        window.localStorage.setItem('permissionWalletConnect', _value);
    }
});

export default permissionWalletConnect;