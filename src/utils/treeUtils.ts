// 数据扁平数组转换为树形结构
interface TreeNode {
    category_id: string | number;
    parent_id: string | number | null | undefined;
    [key: string]: any;
}

/**
 * 将扁平数组转换为树形结构
 * @template T - 泛型，表示节点类型，必须满足 TreeNode 约束
 * @param list - 扁平数据数组
 * @param idKey - 节点唯一标识字段名，默认为 'category_id'
 * @param parentKey - 父节点 ID 字段名，默认为 'parent_id'
 * @param childrenKey - 子节点数组字段名，默认为 'children'
 * @returns 树形结构的根节点数组（可能有多个根）
 */
export function buildTree<T extends TreeNode>(
    list: T[],
    idKey: keyof T = 'category_id' as any,
    parentKey: keyof T = 'parent_id' as any,
    childrenKey: string = 'children'
): T[] {
    //通过 id 快速查找节点  Map<id, 节点对象（已添加 children 字段）>
    const map = new Map<any, T & { [k: string]: any }>();
    const roots: T[] = []; // 根节点

    // 遍历原始列表 将每个节点拷贝一份并初始化 children 为空数组 存入 map
    list.forEach((item) => {
        map.set(item[idKey], { ...item, [childrenKey]: [] });
    });

    //  遍历每个节点 挂载到父节点下
    list.forEach((item) => {
        // 从 map 中取出当前节点
        const node = map.get(item[idKey]);
        // 获取当前节点的父 id
        const parentId = item[parentKey];

        // 如果没有父ID 或父节点不存在 则作为根节点
        if (parentId === null || parentId === undefined || !map.has(parentId)) {
            roots.push(node as T);
        } else {
            // 否则 找到父节点 将当前节点加入其 children 数组
            const parent = map.get(parentId);
            if (parent) {
                parent[childrenKey].push(node as T);
            }
        }
    });

    return roots;
}
