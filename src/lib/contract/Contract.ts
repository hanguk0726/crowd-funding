import { ethers } from "ethers";
import abi from "$lib/data/abi.json";
import { PUBLIC_CONTRACT_ADDRESS_SEPOLIA } from '$env/static/public'
import type { PledgeComment } from "$lib/domain/FundingItemDomain";
import { ethToWei, getETHPrice } from "$lib/utils/getETHprice";

export async function launchCampaign(provider: ethers.BrowserProvider, goalETH: number, endAt: Date): Promise<Result<string | null>> {
    const contract = await getContract(provider);

    if (!contract.success) {
        return { success: false, data: null, error: contract.error };
    }

    try {
        let _endAt = dateToUnixTimestamp(endAt);
        let wei = ethToWei(goalETH);
        const result = await contract.data!.launch(BigInt(wei), _endAt);
        return { success: true, data: result.hash, error: "" };
    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }

}

export async function pledge(provider: ethers.BrowserProvider, contractCampaignId: number, amountETH: number): Promise<Result<string | null>> {
    const contract = await getContract(provider);

    if (!contract.success) {
        return { success: false, data: null, error: contract.error };
    }

    try {
        let wei = ethToWei(amountETH);
        const options = { value: BigInt(wei) }
        const result = await contract.data!.pledge(contractCampaignId, options);


        return { success: true, data: result.hash, error: "" };
    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }

}

function dateToUnixTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000);
}

export async function getContract(provider: ethers.BrowserProvider) {
    const contractAddress = PUBLIC_CONTRACT_ADDRESS_SEPOLIA;
    let contractABI: ethers.InterfaceAbi = abi;

    if (contractABI.length === 0) {
        alert("ABI is empty");
        return { success: false, data: null, error: "ABI is empty" };
    }

    try {
        let contractRunnner: ethers.ContractRunner = await provider.getSigner();

        const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            contractRunnner,
        );

        return { success: true, data: contract, error: "" };

    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }
}


export function getEventData(logs: readonly ethers.Log[], eventName: string): ethers.Result | null {
    let result: ethers.Result | null = null;
    for (const log of logs) {

        let iface = new ethers.Interface(abi);
        let _log = log.toJSON();
        let parsed = iface.parseLog({
            data: _log.data,
            topics: _log.topics,
        });
        if (parsed && parsed.name === eventName) {
            result = parsed.args;
            break;
        }
    }
    return result;
}


export async function pledgedAmount(provider: ethers.BrowserProvider, contractCampaignId: number, campaignAddress: string): Promise<Result<string>> {
    const contract = await getContract(provider);

    if (!contract.success) {
        return { success: false, data: null, error: contract.error };
    }

    try {
        // Mapping from campaign id => pledger => amount pledged
        // mapping(uint256 => mapping(address => uint256)) public pledgedAmount;

        const result = await contract.data!.pledgedAmount(contractCampaignId, campaignAddress);

        return { success: true, data: result, error: "" };

    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }
}

export async function campaigns(provider: ethers.BrowserProvider, contractCampaignId: number): Promise<Result<string>> {
    const contract = await getContract(provider);

    if (!contract.success) {
        return { success: false, data: null, error: contract.error };
    }

    try {

        const result = await contract.data!.campaigns(contractCampaignId);

        return { success: true, data: result, error: "" };

    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }
}



export async function unpledge(provider: ethers.BrowserProvider, contractCampaignId: number, amountETH: number): Promise<Result<string>> {
    const contract = await getContract(provider);

    if (!contract.success) {
        return { success: false, data: null, error: contract.error };
    }

    try {
        let wei = ethToWei(amountETH);
        const options = { value: BigInt(wei) }
        let result = await contract.data!.unpledge(contractCampaignId, options);

        return { success: true, data: result.hash, error: "" };

    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }
}

export async function cancel(provider: ethers.BrowserProvider, contractCampaignId: number): Promise<Result<string>> {
    const contract = await getContract(provider);

    if (!contract.success) {
        return { success: false, data: null, error: contract.error };
    }

    try {

        let result = await contract.data!.cancel(contractCampaignId);

        return { success: true, data: result.hash, error: "" };

    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }
}


export async function claim(provider: ethers.BrowserProvider, contractCampaignId: number): Promise<Result<string>> {
    const contract = await getContract(provider);

    if (!contract.success) {
        return { success: false, data: null, error: contract.error };
    }

    try {

        let result = await contract.data!.claim(contractCampaignId);

        return { success: true, data: result.hash, error: "" };

    } catch (error: any) {
        console.error("Error:", error);
        return { success: false, data: null, error: error.message };
    }
}