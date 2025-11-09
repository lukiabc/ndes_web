export function formatDateTime(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    // 确保是有效日期
    if (isNaN(date.getTime())) return '';
    return date.toISOString().replace('T', ' ').substring(0, 19);
}
