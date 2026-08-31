import html2canvas from 'html2canvas';

const addSiteWatermark = async (sourceCanvas, text = "castlistr") => {
    // Create a new canvas to ensure watermark is on top
    const newCanvas = document.createElement('canvas');
    newCanvas.width = sourceCanvas.width;
    newCanvas.height = sourceCanvas.height;
    
    const ctx = newCanvas.getContext('2d');
    
    // Draw the original canvas content first
    ctx.drawImage(sourceCanvas, 0, 0);
    
    // Now draw the watermark on top
    const padding = 16;
    const fontSize = 20 * (newCanvas.width / 500);

    ctx.font = `${fontSize}px coolvetica`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    ctx.fillText(text, newCanvas.width - padding, newCanvas.height - padding);

    ctx.fillStyle = 'rgba(149, 55, 175, 1)';
    ctx.fillText(text, newCanvas.width - padding - 1, newCanvas.height - padding - 1);

    return newCanvas;
}

export function useScreenshot() {
    const capture = async (element, { format = 'png', filename = 'castlist', watermark = true} = {} ) => {
        if (!element) return

        let canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
        });

        if (watermark) {
            canvas = await addSiteWatermark(canvas);
        }

        const mimeType = 'image/png';
        const ext = 'png';

        const link = document.createElement('a');
        link.download = `${filename}.${ext}`;
        link.href = canvas.toDataURL(mimeType, 1);
        link.click();
    };

    return { capture };
}