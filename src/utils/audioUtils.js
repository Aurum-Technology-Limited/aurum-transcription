export const findMp3Header = (arrayBuffer) => {
    const bytes = new Uint8Array(arrayBuffer);
    // Scan up to 4KB or end of buffer
    const limit = Math.min(bytes.length - 1, 4096);

    for (let i = 0; i < limit; i++) {
        // Look for sync word: 11111111 111xxxxx
        if (bytes[i] === 0xFF && (bytes[i + 1] & 0xE0) === 0xE0) {
            // Basic validation to minimize false positives:
            // Layer index (bits 18,17) != 00 (reserved)
            // Bitrate index (bits 15,14,13,12) != 1111 (bad) & != 0000 (free) - usually
            // But simplest check is enough for re-syncing a stream cut
            return i;
        }
    }
    return -1;
};

export const alignChunkToFrame = async (blob) => {
    try {
        const buffer = await blob.slice(0, 4096).arrayBuffer();
        const offset = findMp3Header(buffer);

        if (offset > 0) {
            console.log(`Adjusting MP3 chunk start by ${offset} bytes.`);
            return blob.slice(offset);
        }
        return blob;
    } catch (e) {
        console.error('Error aligning chunk:', e);
        return blob;
    }
};
