import { type PledgeComment, type CampaignPost, ItemType } from "$lib/domain/FundingItemDomain";
import type { SupabaseClient } from "@supabase/supabase-js";

async function fetchUserData(supabase: SupabaseClient, address: string): Promise<Result<string>> {
    const { data, error } = await supabase.from('user').select('username').filter('address', 'eq', address.toLowerCase());

    if (error) {
        console.error('Error fetching data:', error.message);
        return { success: false, data: null, error: error.message }
    }
    return { success: true, data: data[0].username, error: "" }
}

async function insertUserData(supabase: SupabaseClient, username: string, address: string): Promise<Result<void>> {
    const _address = address.toLowerCase();
    const { data, error } = await supabase
        .from('user')
        .insert([
            { username: username, address: _address },
        ])
    if (error) {
        console.error('Error inserting data:', error.message);
        return { success: false, data: null, error: error.message }
    }
    return { success: true, data: null, error: "" }
}
async function updateUserData(supabase: SupabaseClient, username: string, address: string): Promise<Result<void>> {
    const _address = address.toLowerCase();
    const { data, error } = await supabase
        .from('user')
        .update([
            { username: username },
        ]).eq('address', _address);
    if (error) {
        console.error('Error updating data:', error.message);
        return { success: false, data: null, error: error.message }
    }
    return { success: true, data: null, error: "" }
}

async function fetchPostData(supabase: SupabaseClient, postId: string): Promise<Result<CampaignPost>> {
    const { data, error } = await supabase.from('campaign_post').select(`*, user!inner(*)`).filter('id', 'eq', postId);

    if (error) {
        console.error('Error fetching data:', error.message);
        return { success: false, data: null, error: error.message }
    }

    if (data.length > 0) {
        const postData = data[0];
        let _data = {
            id: postData.id,
            amount: postData.amount,
            creatorAddress: postData.creator_address,
            startAt: postData.start_at,
            endAt: postData.end_at,
            description: postData.description,
            goal: postData.goal,
            title: postData.title,
            contractCampaignId: postData.contract_campaign_id,
            available: postData.available,
            transactionHash: postData.transaction_hash,
            status: postData.status,
            type: ItemType.CampaignPost,
            creatorUsername: postData.user.username,
            cancelTransactionHash: postData.cancel_transaction_hash,
            claimTransactionHash: postData.claim_transaction_hash
        } as CampaignPost;

        return { success: true, data: _data, error: "" };
    }

    return { success: false, data: null, error: "No data found" }
}

async function fetchPostsData(supabase: SupabaseClient): Promise<Result<CampaignPost[]>> {
    const { data, error } = await supabase.from('campaign_post').select(`*, user!inner(*)`);

    if (error) {
        console.error('Error fetching data:', error.message);
        return { success: false, data: null, error: error.message }
    }

    let _data = data.map(postData => ({
        id: postData.id,
        amount: postData.amount,
        creatorAddress: postData.creator_address,
        startAt: postData.start_at,
        endAt: postData.end_at,
        description: postData.description,
        goal: postData.goal,
        contractCampaignId: postData.contract_campaign_id,
        title: postData.title,
        available: postData.available,
        transactionHash: postData.transaction_hash,
        status: postData.status,
        type: ItemType.CampaignPost,
        creatorUsername: postData.user.username,
        cancelTransactionHash: postData.cancel_transaction_hash,
        claimTransactionHash: postData.claim_transaction_hash
    })) as CampaignPost[];

    return { success: true, data: _data, error: "" };
}




async function insertPostData(supabase: SupabaseClient, post: CampaignPost): Promise<Result<void>> {
    const { data, error } = await supabase
        .from('campaign_post')
        .insert([
            {
                id: post.id,
                start_at: post.startAt,
                end_at: post.endAt,
                amount: post.amount,
                contract_campaign_id: post.contractCampaignId,
                creator_address: post.creatorAddress.toLowerCase(),
                goal: post.goal,
                title: post.title,
                description: post.description,
                available: post.available,
                transaction_hash: post.transactionHash,
                status: post.status,
                cancel_transaction_hash: post.cancelTransactionHash,
                claim_transaction_hash: post.claimTransactionHash
            }
        ]);

    if (error) {
        console.error('Error inserting data:', error);
        return { success: false, data: null, error: error.message }
    }
    return { success: true, data: null, error: "" };
}

async function updatePostStatus(supabase: SupabaseClient, postToUpdate: CampaignPost): Promise<Result<void>> {
    const { data, error } = await supabase
        .from('campaign_post')
        .update([
            { available: postToUpdate.available, status: postToUpdate.status, contract_campaign_id: postToUpdate.contractCampaignId, amount: postToUpdate.amount, cancel_transaction_hash: postToUpdate.cancelTransactionHash },
        ]).eq('id', postToUpdate.id);

    if (error) {
        console.error('Error updating data:', error.message);
        return { success: false, data: null, error: error.message }
    }

    return { success: true, data: null, error: "" }
}

async function updateCommentStatus(supabase: SupabaseClient, commentToUpdate: PledgeComment): Promise<Result<void>> {
    const { data, error } = await supabase
        .from('pledge_comment')
        .update([
            { available: commentToUpdate.available, status: commentToUpdate.status, contract_campaign_id: commentToUpdate.contractCampaignId, cancel_transaction_hash: commentToUpdate.cancelTransactionHash },
        ])
        .eq('id', commentToUpdate.id);

    if (error) {
        console.error('Error updating data:', error.message);
        return { success: false, data: null, error: error.message }
    }

    return { success: true, data: null, error: "" }

}

async function fetchCommentsData(supabase: SupabaseClient, campaignId: string): Promise<Result<PledgeComment[]>> {
    const { data, error } = await supabase.from('pledge_comment').select(`*, user!inner(*)`)
        .filter('campaign_id', 'eq', campaignId);


    if (error) {
        console.error('Error fetching data:', error.message);
        return { success: false, data: [], error: error.message }
    }

    let _data = data.map(comment => ({
        id: comment.id,
        amount: comment.amount,
        creatorAddress: comment.creator_address,
        type: ItemType.PledgeComment,
        contractCampaignId: comment.contract_campaign_id,
        transactionHash: comment.transaction_hash,
        status: comment.status,
        available: comment.available,
        comment: comment.comment,
        createdAt: comment.created_at,
        campaignPostId: comment.campaign_id,
        campaignAddress: comment.campaign_address,
        creatorUsername: comment.user.username,
        cancelTransactionHash: comment.cancel_transaction_hash
    })) as PledgeComment[];

    return { success: true, data: _data, error: "" }
}


async function insertCommentData(supabase: SupabaseClient, comment: PledgeComment): Promise<Result<void>> {
    const { data, error } = await supabase
        .from('pledge_comment')
        .insert({
            id: comment.id,
            amount: comment.amount,
            creator_address: comment.creatorAddress.toLowerCase(),
            comment: comment.comment,
            created_at: comment.createdAt,
            campaign_id: comment.campaignPostId,
            campaign_address: comment.campaignAddress,
            transaction_hash: comment.transactionHash,
            available: comment.available,
            status: comment.status,
            cancel_transaction_hash: comment.cancelTransactionHash,
            contract_campaign_id: comment.contractCampaignId
        });

    if (error) {
        console.error('Error inserting data:', error.message);
        return { success: false, data: null, error: error.message }
    }
    return { success: true, data: null, error: "" }
}

async function deletePostData(supabase: SupabaseClient, id: string): Promise<Result<void>> {
    const { data, error } = await supabase
        .from('campaign_post')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting data:', error.message);
        return { success: false, data: null, error: error.message }
    }
    return { success: true, data: null, error: "" }
}

async function deleteCommentData(supabase: SupabaseClient, id: string): Promise<Result<void>> {
    const { data, error } = await supabase
        .from('pledge_comment')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting data:', error.message);
        return { success: false, data: null, error: error.message }
    }
    return { success: true, data: null, error: "" }
}


export {
    fetchUserData,
    insertUserData,
    fetchPostData,
    fetchCommentsData,
    updateUserData,
    insertPostData,
    fetchPostsData,
    insertCommentData,
    deletePostData,
    deleteCommentData,
    updatePostStatus,
    updateCommentStatus,
}