export const dataSourceToRowConfig = (
  dataSource: Record<string, unknown>[],
  defaultOpen = false,
) => {
  const groups: {
    groupStart: number;
    groupEnd: number;
    groupName: string;
  }[] = [];
  const groupOpen: boolean[] = [];
  if (!dataSource?.length)
    return {
      groups,
      groupOpen,
    };
  let currentIndex = 0;
  dataSource.forEach((item, index) => {
    const { children } = item as { children: Array<any> };

    if (children?.length > 0) {
      groups.push({
        groupStart: currentIndex,
        groupEnd: currentIndex + children.length,
        // 默认 key 或者 id 是行数据的唯一标识
        groupName: `${item.key || item.id || index}group`,
      });
      currentIndex += children.length;
      groupOpen.push(defaultOpen);
    }
    currentIndex++;
  });

  return {
    groups,
    groupOpen,
  };
};
