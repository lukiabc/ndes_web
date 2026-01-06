// 提取 html 内容
export const analysisContent = (htmlContent: string | null): string => {
    if (!htmlContent) return '暂无描述';

    // 创建一个临时 div 来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 找到第一个有实际文本内容的 <p>
    const pElements = tempDiv.querySelectorAll('p');
    for (const p of pElements) {
        const text = p.textContent?.trim();
        if (text) {
            return text.length > 80 ? text.substring(0, 80) + '...' : text;
        }
    }

    // 如果没有 <p> 有文本，则尝试整个内容
    const allText = tempDiv.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (allText) {
        return allText.length > 80 ? allText.substring(0, 80) + '...' : allText;
    }

    return '暂无描述';
};
