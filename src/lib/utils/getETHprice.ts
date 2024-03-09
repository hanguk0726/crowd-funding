import { ethers } from 'ethers';
export async function getETHPrice(): Promise<string> {

    const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia")
    const aggregatorV3InterfaceABI = [
        {
            inputs: [],
            name: "decimals",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "description",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
            name: "getRoundData",
            outputs: [
                { internalType: "uint80", name: "roundId", type: "uint80" },
                { internalType: "int256", name: "answer", type: "int256" },
                { internalType: "uint256", name: "startedAt", type: "uint256" },
                { internalType: "uint256", name: "updatedAt", type: "uint256" },
                { internalType: "uint80", name: "answeredInRound", type: "uint80" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "latestRoundData",
            outputs: [
                { internalType: "uint80", name: "roundId", type: "uint80" },
                { internalType: "int256", name: "answer", type: "int256" },
                { internalType: "uint256", name: "startedAt", type: "uint256" },
                { internalType: "uint256", name: "updatedAt", type: "uint256" },
                { internalType: "uint80", name: "answeredInRound", type: "uint80" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "version",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
    ]
    const addr = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, provider)
    let roundData = await priceFeed.latestRoundData();
    let answer = Number(roundData[1])
    let price = (answer / 10 ** 8).toFixed(2)
    return price
}

export function ethToWei(amount: number): number {
    // 1 ether = 10^18 wei
    const weiPerEther: bigint = 10n ** 18n;
    return Number(Math.round(amount * Number(weiPerEther)));
}

export function ethToGwei(amount: number): number {
    const weiPerGwei: bigint = 10n ** 9n;
    return Number(Math.round(amount * Number(weiPerGwei)));
}

export function gweiToEth(amount: number): number {
    const weiPerGwei: bigint = 10n ** 9n;
    const ethAmount = amount / Number(weiPerGwei); // gwei를 이더로 변환
    return parseFloat(ethAmount.toFixed(2)); // 소수점 2자리까지 표시
}

export function weiToGwei(wei: bigint): number {
    const weiPerGwei: bigint = 10n ** 9n;
    const gwei = wei / weiPerGwei;
    return Number(gwei);
}