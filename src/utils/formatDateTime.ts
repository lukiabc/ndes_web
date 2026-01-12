/**
 * 格式化 ISO 日期时间字符串为 'YYYY-MM-DD HH:mm:ss' 格式
 * @param isoString - 符合 ISO 8601 格式的日期时间字符串（例如 '2023-10-15T14:30:00Z'）
 * @returns 格式化后的日期时间字符串（例如 '2023-10-15 14:30:00'）
 */
export function formatDateTime(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    // 确保是有效日期
    if (isNaN(date.getTime())) return '';
    return date.toISOString().replace('T', ' ').substring(0, 19);
}
