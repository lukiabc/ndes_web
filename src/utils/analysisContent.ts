// 提取 html 内容
export const analysisContent = (htmlContent: string | null): string => {
    if (!htmlContent) return '暂无描述';

    // 创建一个临时 div 来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 找到第一个 <p> 标签
    const firstP = tempDiv.querySelector('p');
    if (firstP) {
        // 获取纯文本并去除首尾空白
        let text = firstP.textContent?.trim() || '';
        // 可选：截断到 80 个字符，避免太长
        if (text.length > 80) {
            text = text.substring(0, 80) + '...';
        }
        return text;
    }

    // 如果没有 <p>，尝试返回整个内容的纯文本（降级）
    const allText = tempDiv.textContent?.trim() || '暂无描述';
    return allText.length > 80 ? allText.substring(0, 80) + '...' : allText;
};

// 解析第一句话
export const analysisContentByFirstSentence = (
    htmlContent: string | null
): string => {
    if (!htmlContent) return '暂无描述';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    let text = tempDiv.textContent?.trim() || '';
    if (!text) return '暂无描述';

    const dotIndex = text.search(/[。\.]/);
    if (dotIndex !== -1) {
        return text.substring(0, dotIndex + 1);
    }

    // 没有句号则截断到80字
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
};
