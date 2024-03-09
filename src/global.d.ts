import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }

    interface Web3Props {
        provider: ethers.BrowserProvider;
        signer: ethers.JsonRpcSigner;
        address: string;
        chainId: number;
    }

    interface Result<T> {
        success: boolean;
        data: T?;
        error: string;
    }


}