const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || path.join(__dirname, '..', 'public', 'logo-icon.png');
const outputIcoPath = path.join(__dirname, '..', 'public', 'icon.ico');
const outputFaviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');

if (!fs.existsSync(inputPath)) {
    console.error('Input PNG file not found:', inputPath);
    console.log('Please place your logo as public/logo-icon.png');
    process.exit(1);
}

// ICO file format: header + directory entries + image data
async function createIco(inputFile, outputFile, sizes) {
    const images = [];
    
    for (const size of sizes) {
        const pngBuffer = await sharp(inputFile)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();
        images.push({ size, buffer: pngBuffer });
    }
    
    // ICO Header: 6 bytes
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);         // Reserved
    header.writeUInt16LE(1, 2);         // Type: 1 = ICO
    header.writeUInt16LE(images.length, 4); // Number of images
    
    // Calculate offsets
    const dirEntrySize = 16;
    let dataOffset = 6 + (dirEntrySize * images.length);
    
    const dirEntries = [];
    for (const img of images) {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);  // Width (0 = 256)
        entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);  // Height (0 = 256)
        entry.writeUInt8(0, 2);           // Color palette
        entry.writeUInt8(0, 3);           // Reserved
        entry.writeUInt16LE(1, 4);        // Color planes
        entry.writeUInt16LE(32, 6);       // Bits per pixel
        entry.writeUInt32LE(img.buffer.length, 8);  // Image size
        entry.writeUInt32LE(dataOffset, 12);        // Image offset
        dirEntries.push(entry);
        dataOffset += img.buffer.length;
    }
    
    const icoBuffer = Buffer.concat([
        header,
        ...dirEntries,
        ...images.map(img => img.buffer)
    ]);
    
    fs.writeFileSync(outputFile, icoBuffer);
    return icoBuffer.length;
}

async function main() {
    try {
        // Create icon.ico with multiple sizes for best quality
        const size = await createIco(inputPath, outputIcoPath, [256, 128, 64, 48, 32, 16]);
        console.log(`✅ Icon created: ${outputIcoPath} (${size} bytes)`);
        
        // Create favicon.ico with smaller sizes
        const favSize = await createIco(inputPath, outputFaviconPath, [48, 32, 16]);
        console.log(`✅ Favicon created: ${outputFaviconPath} (${favSize} bytes)`);
    } catch (err) {
        console.error('Error creating icons:', err);
        process.exit(1);
    }
}

main();
