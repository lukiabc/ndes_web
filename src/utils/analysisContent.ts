/**
 * 提取 HTML 字符串中一段纯文本描述
 * @param htmlContent - 包含 HTML 内容的字符串
 * @returns 提取的段落文本内容，若为空则返回 '暂无描述'
 */
export const analysisContent = (htmlContent: string | null): string => {
    if (!htmlContent) return '暂无描述';

    // 创建一个临时 div 来解析 HTML
    const tempDiv = document.createElement('div');
    // 将 HTML 字符串 赋值给临时 div 的 innerHTML
    tempDiv.innerHTML = htmlContent;

    // 找到第一个有实际文本内容的 <p>
    const pElements = tempDiv.querySelectorAll('p');

    // 遍历每一个 <p> 元素，找第一个包含非空白文本的段落
    for (const p of pElements) {
        // 获取当前 <p> 元素的文本内容并移除首尾空白
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
