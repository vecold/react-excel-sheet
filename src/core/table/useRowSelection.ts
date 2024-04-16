import { CheckViewer, SheetTableType, SheetType } from '@zhenliang/sheet';
import { useEffect, useRef, useState } from 'react';

export const useRowSelection = (
  dataSource: Record<string, unknown>[],
  rowSelection?: SheetTableType.TableRowSelection,
  hasChildren?: boolean,
) => {
  const [checkedRow, setCheckedRow] = useState<boolean[]>(
    Array(dataSource?.length ?? 0).fill(false),
  );
  const checkedRowRef = useRef<boolean[]>(checkedRow);
  useEffect(() => {
    if (hasChildren || !rowSelection) return;
    const currentEmpty = Array(dataSource.length)
      .fill(false)
      .map((checked, index) => (checkedRowRef.current[index] ? true : false));
    setCheckedRow(currentEmpty);
    checkedRowRef.current = currentEmpty;
  }, [dataSource.length, hasChildren, rowSelection]);
  return [checkedRow, setCheckedRow] as [boolean[], (value: boolean[]) => void];
};

export const formatSelectionData = (
  param: Pick<
    SheetTableType.TableProps,
    'dataSource' | 'columns' | 'rowKey' | 'rowSelection'
  > & { checked: boolean[] },
) => {
  const { dataSource, columns, checked, rowKey, rowSelection } = param;
  return dataSource.map((item: any, row: number) => {
    let rowId: string = item.id || item.key || String(row);
    if (rowKey) {
      if (rowKey instanceof Function) {
        rowId = rowKey(item, row);
      } else {
        rowId = item[rowKey];
      }
    }
    const rows = [];
    if (rowSelection) {
      rows.push({
        id: rowId,
        row,
        col: -1,
        readonly: true,
        align: 'center' as SheetType.CellAlign,
        value: checked[row] as unknown as string,
        valueViewer: CheckViewer,
        className: 'sheet-control',
      });
    }

    columns.forEach((colInfo: SheetTableType.ColumnProps, col: number) => {
      const value = item[colInfo.dataIndex || ''];
      rows.push({
        id: rowId,
        value,
        record: item,
        readonly: !(colInfo.readonly instanceof Function)
          ? (colInfo.readonly ?? false)
          : colInfo.readonly(value, item, row, col),
        align: colInfo.align,
        fixed: colInfo.fixed,
        editable: !(colInfo.editable instanceof Function)
          ? (colInfo.editable ?? true)
          : colInfo.editable(value, item, row),
        valueViewer: colInfo.render ? colInfo.render : undefined,
        dataEditor: colInfo.editor ? colInfo.editor : undefined,
        searchKey: colInfo.searchKey,
        className: !(colInfo.cellConfig?.className instanceof Function)
          ? colInfo.cellConfig?.className
          : colInfo.cellConfig?.className(value, item, row),
        row,
        col,
        dataIndex: colInfo.dataIndex,
        key: colInfo.key,
      });
    });
    return rows;
  });
};
