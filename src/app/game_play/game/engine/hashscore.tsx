export const hash = "oalAOBdo4G3QnglGDRcb";

const toHex = (bytes: any) => {
    return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const sha256Hex = async(str: string) => {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return toHex(digest);
}