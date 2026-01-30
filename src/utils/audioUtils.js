const bitrates = {
    1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448], // Layer I
    2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],    // Layer II
    3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]     // Layer III
};

const sampleRates = {
    0: [44100, 48000, 32000], // MPEG 1
    1: [22050, 24000, 16000], // MPEG 2
    2: [11025, 12000, 8000]   // MPEG 2.5
};

export const findMp3Header = (arrayBuffer) => {
    const bytes = new Uint8Array(arrayBuffer);
    const limit = Math.min(bytes.length - 4, 8192); // Scan up to 8KB

    for (let i = 0; i < limit; i++) {
        // 1. Basic Sync Word Check (11 bits set to 1)
        // Byte 0: 0xFF
        // Byte 1: 111xxxxx (0xE0 mask)
        if (bytes[i] === 0xFF && (bytes[i + 1] & 0xE0) === 0xE0) {

            // 2. Parse Header Details
            const b1 = bytes[i + 1];
            const b2 = bytes[i + 2];

            // Version (bits 19,20 of 32-bit header -> bits 3,4 of byte 1)
            const versionBits = (b1 >> 3) & 0x03;
            if (versionBits === 1) continue; // Reserved

            // Layer (bits 17,18 -> bits 1,2 of byte 1)
            const layerBits = (b1 >> 1) & 0x03;
            if (layerBits === 0) continue; // Reserved

            // Bitrate Index (bits 12-15 -> bits 4-7 of byte 2)
            const bitrateIndex = (b2 >> 4) & 0x0F;
            if (bitrateIndex === 0 || bitrateIndex === 15) continue; // Free or Bad

            // Sample Rate Index (bits 10-11 -> bits 2-3 of byte 2)
            const sampleRateIndex = (b2 >> 2) & 0x03;
            if (sampleRateIndex === 3) continue; // Reserved

            // Padding Bit (bit 9 -> bit 1 of byte 2)
            const paddingBit = (b2 >> 1) & 0x01;

            // map versionBits to index for sampleRates table
            let srTableIndex;
            if (versionBits === 3) srTableIndex = 0; // V1
            else if (versionBits === 2) srTableIndex = 1; // V2
            else srTableIndex = 2; // V2.5

            // map layerBits to index for bitrates table
            // Layer I=3, II=2, III=1
            // Ref: https://www.mp3-tech.org/programmer/frame_header.html
            // Layer bits: 11=Layer I, 10=Layer II, 01=Layer III
            // Our map keys: 1=Layer I, 2=Layer II, 3=Layer III ? NO.
            // Let's rely on standard logic:
            // Layer I is 11(3). Layer II is 10(2). Layer III is 01(1).
            // We want key 1 for Layer I, 2 for Layer II, 3 for Layer III to match our table above?
            // Wait, standard tables usually go by Layer III, II, I. 
            // My table above has keys 1, 2, 3. Let's fix the table access logic.
            // Key 3 = Layer III (most common). Key 2 = Layer II. Key 1 = Layer I.
            // layerBits: 01=Layer III. So if we map 01->3, 10->2, 11->1
            let layerIdx;
            if (layerBits === 1) layerIdx = 3; // Layer III
            else if (layerBits === 2) layerIdx = 2; // Layer II
            else layerIdx = 1; // Layer I

            const bitrate = bitrates[layerIdx][bitrateIndex] * 1000;
            const sampleRate = sampleRates[srTableIndex][sampleRateIndex];

            // 3. Calculate Frame Length
            let frameLength;
            if (layerIdx === 1) { // Layer I
                frameLength = Math.floor((12 * bitrate / sampleRate) + paddingBit) * 4;
            } else { // Layer II & III
                // For MPEG 1 (versionBits=3), 144. For MPEG 2/2.5, 72.
                const slots = (versionBits === 3) ? 144 : 72;
                frameLength = Math.floor((slots * bitrate / sampleRate) + paddingBit);
            }

            // 4. Verify Next Header
            if (i + frameLength + 4 < bytes.length) {
                const nextHeaderIdx = i + frameLength;
                if (bytes[nextHeaderIdx] === 0xFF && (bytes[nextHeaderIdx + 1] & 0xE0) === 0xE0) {
                    return i; // Found and verified!
                }
            } else {
                // Determine confidence based on position in chunk.
                // If it's the very first byte (offset 0), we trust it more.
                // If we scanned deep into the chunk, maybe we should be skeptical, but 
                // preventing *any* upload is worse than a potential failure.
                // We'll trust it if we couldn't verify.
                return i;
            }
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
