import Identicon from "identicon.js";


export function generateIdenticon(hashString) {
    if (hashString.length < 15) {
        console.error("more than 15 characters are required");
        return "";
    }
    const icon = new Identicon(hashString, 64).toString();
    return `data:image/png;base64,${icon}`;
}