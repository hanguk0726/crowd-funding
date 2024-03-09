export interface FundingItem {
    amount: number; // Gwei
    creatorAddress: string;
    type: string;
    available: boolean;
    status: string;
    id: string;
    contractCampaignId: number;
    transactionHash: string;
    creatorUsername: string | undefined; //readonly (join query)
    cancelTransactionHash: string;
}

export interface CampaignPost extends FundingItem {
    goal: number;
    title: string;
    startAt: Date;
    endAt: Date;
    description: string;
    claimTransactionHash: string;
}

export interface PledgeComment extends FundingItem {
    comment: string;
    createdAt: Date;
    campaignPostId: string;
    campaignAddress: string;
}

export enum ItemType { //FundingItem.type
    CampaignPost = "CampaignPost",
    PledgeComment = "PledgeComment",
}

export enum ItemStatus { //FundingItem.status
    Pending = "Pending",
    Valid = "Valid",
    Cancel = "Cancel",
    Expired = "Expired",
    Claimed = "Claimed",
    Failed = "Failed",
}

