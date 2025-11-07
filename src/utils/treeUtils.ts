// 数据扁平数组转换为树形结构
interface TreeNode {
    category_id: string | number;
    parent_id: string | number | null | undefined;
    [key: string]: any; // 允许其他任意字段
}

/**
 * 将扁平数组转换为树形结构
 * @param list 扁平数据数组
 * @param idKey ID 字段名，默认 'category_id'
 * @param parentKey 父级ID字段名 默认 'parent_id'
 * @param childrenKey 子节点字段名 默认 'children'
 * @returns 树形结构数组
 */

export function buildTree<T extends TreeNode>(
    list: T[],
    idKey: keyof T = 'category_id' as any,
    parentKey: keyof T = 'parent_id' as any,
    childrenKey: string = 'children'
): T[] {
    const map = new Map<any, T & { [k: string]: any }>();
    const roots: T[] = [];

    // 先将所有节点加入 map 初始化 children
    list.forEach((item) => {
        map.set(item[idKey], { ...item, [childrenKey]: [] });
    });

    //  遍历每个节点 挂载到父节点下
    list.forEach((item) => {
        const node = map.get(item[idKey]);
        const parentId = item[parentKey];

        // 如果没有父ID 或父节点不存在 则作为根节点
        if (parentId === null || parentId === undefined || !map.has(parentId)) {
            roots.push(node as T);
        } else {
            const parent = map.get(parentId);
            if (parent) {
                parent[childrenKey].push(node as T);
            }
        }
    });

    return roots;
}
