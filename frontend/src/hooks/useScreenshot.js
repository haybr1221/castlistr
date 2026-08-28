import html2canvas from 'html2canvas';

const addSiteWatermark = async (canvas, text = "castlistr") => {
    // await document.fonts.load(`20px coolvetica`)
    const ctx = canvas.getContext('2d');
    const padding = 16
    const fontSize = 20 * (canvas.width / 500)

    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText(text, canvas.width - padding, canvas.height - padding);

    ctx.fillStyle = 'rgba(149, 55, 175, 1)';
    ctx.fillText(text, canvas.width - padding - 1, canvas.height - padding - 1);

    return canvas
}

export function useScreenshot() {
    const capture = async (element, { format = 'png', filename = 'castlist', watermark = true} = {} ) => {
        if (!element) return

        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
        });

        if (watermark) await addSiteWatermark(canvas)

        const mimeType = 'image/png';
        const ext = 'png';

        const link = document.createElement('a');
        link.download = `${filename}.${ext}`;
        link.href = canvas.toDataURL(mimeType, 1);
        link.click();
    };

    return { capture };
}