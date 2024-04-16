/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type { SheetType } from '@zhenliang/sheet/type';
import { message } from 'antd';
import { cloneDeep, get, isNil, range } from 'lodash';

export function findParentTd(el: HTMLElement): HTMLElement | null {
  if (!el) return null;
  if (el.tagName === 'TD') return el;
  return findParentTd(el.parentElement as HTMLElement);
}
export function extractDataRowAndCol(el: HTMLElement) {
  const row = Number(el.getAttribute('data-row'));
  const col = Number(el.getAttribute('data-col'));
  return {
    row,
    col,
  };
}
export function getRowColConfig(
  start?: SheetType.CellPosition,
  end?: SheetType.CellPosition,
) {
  const startRow = Math.min(start?.row ?? -1, end?.row ?? -1);
  const endRow = Math.max(start?.row ?? -1, end?.row ?? -1);
  const startCol = Math.min(start?.col ?? -1, end?.col ?? -1);
  const endCol = Math.max(start?.col ?? -1, end?.col ?? -1);
  return {
    startRow,
    endRow,
    startCol,
    endCol,
  };
}

export function flatRowColIndex(
  start?: SheetType.CellPosition,
  end?: SheetType.CellPosition,
) {
  const { startRow, endRow, startCol, endCol } = getRowColConfig(start, end);
  if ([startRow, endRow, startCol, endCol].some((a) => a === -1)) {
    return [];
  }
  const cellList: SheetType.CellPosition[] = [];

  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      cellList.push({ row: i, col: j });
    }
  }
  return cellList;
}

export function flatRowCol(
  start?: SheetType.CellPosition,
  end?: SheetType.CellPosition,
) {
  const rowColIndex = flatRowColIndex(start, end);
  return rowColIndex.map(({ row, col }) => `${row}-${col}`);
}

export function isInputKey(keyCode: number) {
  const numbersPressed = keyCode >= 48 && keyCode <= 57;
  const lettersPressed = keyCode >= 65 && keyCode <= 90;
  const latin1Supplement = keyCode >= 160 && keyCode <= 255;
  const numPadKeysPressed = keyCode >= 96 && keyCode <= 105;
  const equationKeysPressed =
    [
      187 /* equal */, 189 /* substract */, 190 /* period */, 107 /* add */,
      109 /* decimal point */, 110,
    ].indexOf(keyCode) > -1;

  return (
    numPadKeysPressed ||
    numbersPressed ||
    lettersPressed ||
    latin1Supplement ||
    equationKeysPressed
  );
}

export function classNames(...args: (string | null | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

export function stringToClipboardData(str: string, count: number) {
  // navigator.clipboard.writeText(str);
  navigator.clipboard.writeText(str).then(
    () => {
      // console.log('复制成功');
      message.success(`已复制${count}个单元格`);
    },
    () => {
      // console.error('复制失败');
      message.info(`复制失败`);
    },
  );
}

export const defaultParsePaste = (str: string) =>
  str.trimEnd().split(/\r\n|\n|\r/).map((row) => row.split('\t'));
export function clipboardDataToString() {
  return new Promise<string[][]>((resolve) => {
    navigator.clipboard.readText().then((res) => {
      resolve(defaultParsePaste(res) as string[][]);
    });
  });
}

export function formatDataToCell({
  start,
  editing,
  end,
  data,
  pasteData,
  groupConfig,
  freePaste = false,
}: Partial<SheetType.UpdateStateType> & {
  pasteData: string[][];
  freePaste: boolean;
}) {
  if (editing || !data) return;
  const cells = flatRowColIndex(start, end);
  if (!cells.length) return;
  const rowCount = cells[cells.length - 1].row - cells[0].row + 1;
  if (!cells.length) return;
  const isMultiCells = cells.length > 1;
  const isSinglePaste = pasteData.length === 1 && pasteData[0].length === 1;

  // todo 超出行的处理
  // const isExRow = (cells[cells.length - 1].row as number) > (data?.length || 0);

  const groupMap = groupConfigToGroupMap(groupConfig);
  const actualRowCount = range(start?.row ?? 0, (end?.row ?? 0) + 1).reduce(
    (left, index) => {
      if (
        groupMap.get(index) &&
        !groupMap.get(index)?.isStart &&
        !groupMap.get(index)?.isOpen
      ) {
        return left;
      }
      return left + 1;
    },
    0,
  );

  const changes: SheetType.CellData[] = [];
  if (isMultiCells && isSinglePaste) {
    // 选中多个单元格，粘贴单个数据
    cells.forEach(({ row, col }) => {
      if (data[row][col].readonly) return;
      if (
        groupMap.get(row) &&
        !groupMap.get(row)?.isStart &&
        !groupMap.get(row)?.isOpen
      ) {
        return;
      }

      changes.push({
        row,
        col,
        value: pasteData[0][0].trimStart().trimEnd(),
      } as any);
    });
    return { changes };
  }

  if (!isMultiCells) {
    // 选中单个单元格
    const { row, col } = cells[0];
    const extChanges: SheetType.CellData[] = [];
    let hasStartAndNotOpen = false;
    pasteData.forEach((rowData, i) => {
      rowData.forEach((cell, j) => {
        if (row + i >= data.length) {
          extChanges.push({
            row: row + i,
            col: col + j,
            value: pasteData[i][j]?.trimStart().trimEnd(),
          } as any);
        } else {
          if (data?.[row + i]?.[col + j]?.readonly) return;

          if (
            groupMap.get(row + i) &&
            !groupMap.get(row + i)?.isStart &&
            !groupMap.get(row + i)?.isOpen
          ) {
            hasStartAndNotOpen = true;
          }
          changes.push({
            row: row + i,
            col: col + j,
            value: pasteData[i][j]?.trimStart().trimEnd(),
          } as any);
        }
      });
    });
    if (hasStartAndNotOpen) {
      message.error('有折叠单元格，不可粘贴');
      return { changes: [], extChanges: [] };
    }

    return {
      changes,
      extChanges: freePaste ? extChanges : undefined,
    };
  } else {
    // 选中多个单元格，粘贴多个数据
    if (
      actualRowCount !== pasteData.length ||
      (cells.length / rowCount) * actualRowCount !==
      pasteData.length * pasteData[0].length
    ) {
      message.warning('选中单元格数量与粘贴数据不匹配');
      // 单元格数量不对
      return;
    }

    const { col: baseCol } = cells[0];
    let lastRow = cells[0].row;
    let pasteCount = 0;
    cells.forEach(({ row, col }) => {
      if (data[row][col]?.readonly) return;
      if (
        groupMap.get(row) &&
        !groupMap.get(row)?.isStart &&
        !groupMap.get(row)?.isOpen
      ) {
        return;
      }
      if (row !== lastRow) {
        pasteCount++;
        lastRow = row;
      }
      changes.push({
        row: row,
        col: col,
        value: pasteData?.[pasteCount]?.[col - baseCol]?.trimStart().trimEnd(),
      } as any);
    });
    return { changes };
  }
}

export const defaultValueRenderer = (cell: SheetType.Cell) => cell.value;

export function renderValue(cell: SheetType.Cell) {
  const value = defaultValueRenderer(cell);
  return value === null || typeof value === 'undefined' ? '' : value;
}

export const optionsToValuesFromLabelOrValue = (
  options: SheetType.OptionsType[],
  val: string,
) => {
  const labelRes = optionsTransferToValue(options, val as string);
  const valueRes = optionsTransferToValue(options, val as string, 'value');
  return labelRes?.length ? labelRes : valueRes;
};
export const optionsTransferToValue = (
  options: SheetType.OptionsType[],
  val: string,
  key: string = 'label',
) => {
  let values: string[] = [];

  for (let i = 0; i < options.length; i++) {
    const { value, children } = options[i];
    if (children) {
      values = optionsTransferToValue(children, val, key);
      if (values.length) {
        values = [value as string, ...values];
        break;
      }
    } else if (get(options[i], key) === val) {
      values.push(value as string);
      break;
    } else {
      values = [];
    }
  }
  return values;
};

export const valuesTransferToLabel = (
  options?: SheetType.OptionsType[],
  value?: string,
): string | null => {
  if (!options?.length || !value) return null;
  const leaveNode = options?.find(
    (item) => !item.children?.length && value === item.value,
  );
  const childrenNode = options
    ?.filter((item) => item.children?.length)
    .map((item) => item.children) as SheetType.OptionsType[][];
  if (leaveNode) {
    return leaveNode.label;
  }
  if (childrenNode) {
    for (const children of childrenNode) {
      const label = valuesTransferToLabel(children, value);
      if (label) {
        return label;
      }
    }
  }
  return null;
};

export const groupConfigToGroupMap = (
  rowGroupConfig?: Partial<SheetType.RowGroupConfig>,
) => {
  const groupMap = new Map<
    number,
    SheetType.RowGroup & { isStart: boolean; isOpen: boolean }
  >();
  if (!rowGroupConfig || !rowGroupConfig.groups?.length) return groupMap;
  const { groups } = rowGroupConfig;
  groups?.forEach((group, index) => {
    const { groupStart, groupEnd } = group;
    for (let i = groupStart; i <= groupEnd; i++) {
      groupMap.set(i, {
        ...group,
        isStart: i === groupStart,
        isOpen: !!rowGroupConfig?.groupOpen?.[index],
      });
    }
  });
  return groupMap;
};

export const changeGroupConfig = (
  rowGroupConfig: SheetType.RowGroupConfig,
  changeInfo: { add?: number; remove?: number },
) => {
  const groupMap = groupConfigToGroupMap(rowGroupConfig);
  if (!groupMap.size) return rowGroupConfig;
  const newGroups = cloneDeep(rowGroupConfig.groups);
  // 顺序是先增后减
  const { add, remove } = changeInfo;
  if (!isNil(add)) {
    for (let i = 0; i < newGroups.length; i++) {
      const { groupStart, groupEnd } = newGroups[i];
      if (groupStart >= add) {
        newGroups[i].groupStart++;
        newGroups[i].groupEnd++;
      } else if (groupStart < add && groupEnd >= add) {
        newGroups[i].groupEnd++;
      }
    }
  }
  if (!isNil(remove)) {
    for (let i = 0; i < newGroups.length; i++) {
      const { groupStart, groupEnd } = newGroups[i];
      if (groupStart > remove) {
        newGroups[i].groupStart--;
        newGroups[i].groupEnd--;
      } else if (groupStart <= remove && groupEnd > remove) {
        newGroups[i].groupEnd--;
      }
    }
  }
  return {
    ...rowGroupConfig,
    groups: newGroups,
  };
};

export const rowToActualRow = (
  row: number,
  groupConfig?: SheetType.RowGroupConfig,
  max = 100000, // 业务从10000 上限增长到数万
) => {
  const groupMap = groupConfigToGroupMap(groupConfig);
  if (!groupMap.size || row < 0) return row;

  let openCount = 0;
  for (let i = 0; i < max; i++) {
    if (
      groupMap.has(i) &&
      !groupMap.get(i)?.isOpen &&
      !groupMap.get(i)?.isStart
    ) {
      continue;
    } else {
      if (i >= row) {
        break;
      }
      openCount++;
    }
  }
  return openCount;
};

export const rowToCountRow = (
  row: number,
  groupConfig: SheetType.RowGroupConfig,
  max: number,
): number => {
  const groupMap = groupConfigToGroupMap(groupConfig);
  if (!groupMap.size || row < 0) return row;

  // 加法的做法
  let maxCount = 0;
  let maxIndex = max;

  for (let i = 0; i < max; i++) {
    if (
      groupMap.has(i) &&
      !groupMap.get(i)?.isOpen &&
      !groupMap.get(i)?.isStart
    ) {
      continue;
    } else {
      maxCount++;
    }
  }
  if (row >= maxCount) {
    return maxIndex;
  }
  maxIndex = 0;
  let openCount = 0;
  for (let i = 0; i < max; i++) {
    if (
      groupMap.has(i) &&
      !groupMap.get(i)?.isOpen &&
      !groupMap.get(i)?.isStart
    ) {
      continue;
    } else {
      openCount++;
      if (openCount >= row) {
        maxIndex = i;
        break;
      }
    }
  }
  return maxIndex;
};

export const getRowHeight = (container: HTMLSpanElement) => {
  const h =
    (container.getElementsByTagName('td')[0]?.parentNode as HTMLTableRowElement)
      ?.clientHeight || 30;

  return h;
};

export const getNextVisibleRow = (
  row: number,
  maxRow: number,
  groupMap?: Map<
    number,
    SheetType.RowGroup & { isStart: boolean; isOpen: boolean }
  >,
  up: number = 1,
): number | null => {
  if (!groupMap?.size) {
    return row;
  }
  if (row > maxRow) {
    return null;
  }
  if (
    groupMap.get(row) &&
    !groupMap.get(row)?.isOpen &&
    !groupMap.get(row)?.isStart
  ) {
    return getNextVisibleRow(row + up, maxRow, groupMap);
  }
  return row;
};

export const calcMenuPosition = ({
  tableElement,
  menuElement,
  x,
  y,
}: {
  tableElement: SheetType.refAssertion | null;
  menuElement?: Element | null;
  x: number;
  y: number;
}) => {
  let top = y;
  let left = x;
  const { right: menuRight, bottom: menuBottom } =
    menuElement?.getBoundingClientRect() ?? ({} as Record<string, number>);
  // 这里不考虑 左边和上边 因为 屏幕连一个 menu都发不下的情况应该特殊处理
  const { bottom: tableBottom, right: tableRight } =
    tableElement?.getBoundingClientRect() ?? ({} as Record<string, number>);
  const { clientHeight, clientWidth } = document.body;
  const edgeRight = Math.min(tableRight, clientWidth);
  const edgeBottom = Math.min(tableBottom, clientHeight);
  if (menuRight > edgeRight) {
    left = left - (menuRight - edgeRight);
  }
  if (menuBottom > edgeBottom) {
    top = top - (menuBottom - edgeBottom);
  }
  return { top, left };
};

export const stripRowIndex = (data: SheetType.Cell[][]): { startIndex: number, endIndex: number } => {
  if (!data.length || !data[0].length) return {startIndex:0,endIndex:0}

  const rowData = data[0]
  let startIndex = 0, endIndex = rowData.length - 1;

  if (rowData[0].fixed && !rowData[0].editable) {
    startIndex = 1
  }
  if (rowData[rowData.length - 1].fixed && !rowData[0].editable) {
    endIndex = rowData.length - 2
  }
  return {
    startIndex, endIndex
  }
}
