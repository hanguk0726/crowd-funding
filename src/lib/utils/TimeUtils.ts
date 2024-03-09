export function updateTimeAgo(timestamp: Date) {
    const now = new Date();
    const diffInMilliseconds =
        new Date(now).getTime() - new Date(timestamp).getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    let timeAgo: string;
    if (diffInMinutes < 1) {
        timeAgo = "just now";
    } else if (diffInMinutes < 60) {
        timeAgo = `${diffInMinutes} minutes ago`;
    } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            timeAgo = `${diffInHours} hours ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            timeAgo = `${diffInDays} days ago`;
        }
    }

    return timeAgo
}