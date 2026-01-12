/**
 * 高亮文本中的关键词（用于 v-html）
 * @param text - 原始文本（应为纯文本，避免 XSS）
 * @param keyword - 要高亮的关键词
 * @param className - 可选：自定义 CSS 类名（推荐替代内联样式）
 * @returns 返回包含 <mark> 标签的 HTML 字符串
 */
export const highlightText = (
    text: string,
    keyword: string,
    className = 'highlight-keyword'
): string => {
    if (!keyword?.trim() || !text) {
        return text || '';
    }

    // 转义正则特殊字符
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');

    // 使用 class 替代内联样式，更易维护
    return text.replace(regex, `<mark class="${className}">$1</mark>`);
};
