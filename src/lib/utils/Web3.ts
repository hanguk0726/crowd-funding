import { ethers } from "ethers";

export async function getWeb3Props(): Promise<Result<Web3Props>> {
    if (!window.ethereum) {
        alert("Please install MetaMask");
        return {
            success: false,
            data: null,
            error: "Please install MetaMask",
        }
    }
    let provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const chainId = Number((await provider.getNetwork()).chainId);
    if (chainId !== 11155111) {
        alert("Please switch to Sepolia network");
        return {
            success: false,
            data: null,
            error: "Please switch to Sepolia network",
        }
    }
    
    let ethAccounts = await window.ethereum
        .request({ method: "eth_accounts" });

    if (ethAccounts.length === 0) {
        alert("Please connect MetaMask");
        return {
            success: false,
            data: null,
            error: "Please connect MetaMask",
        }
    }

    let data = {
        provider,
        signer,
        address,
        chainId,
    } as Web3Props


    return {
        success: true,
        data,
        error: "",
    }
}