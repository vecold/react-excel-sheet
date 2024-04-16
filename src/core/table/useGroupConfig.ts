import type { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { flatten, isNil } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { groupConfigToGroupMap } from '../util';
import { GroupViewer } from '../viewer';
import { dataSourceToRowConfig } from './util';

export const useGroupConfig = (
  dataSource: Record<string, unknown>[],
  tableGroupConfig?: SheetTableType.TableGroupConfig,
  hasChildren?: boolean,
) => {
  const [groupConfig, setGroupConfig] = useState<SheetType.RowGroupConfig>();
  const groupConfigRef = useRef<SheetType.RowGroupConfig>();
  const childrenLength = useMemo(() => {
    if (!dataSource?.length) return 0;
    const data = dataSource as (Record<string, unknown> & {
      children: Array<unknown>;
    })[];
    const childrenCount = flatten(
      data
        .filter((item) => !!(item.children as Array<unknown>)?.length)
        .map((item) => item.children),
    ).length;
    return childrenCount;
  }, [dataSource]);
  useEffect(() => {
    if (!hasChildren) return;
    let computedRowGroup = dataSourceToRowConfig(
      dataSource,
      tableGroupConfig?.defaultOpen,
    );
    let rowConfig = computedRowGroup
    const { rowGroup } = tableGroupConfig || {}
    if (rowGroup) {
      const notEqual = rowGroup.groups.length !== computedRowGroup.groups.length
      const notSameGroup = notEqual || rowGroup.groups.some((group, index) => computedRowGroup.groups[index].groupStart !== group.groupStart
        || computedRowGroup.groups[index].groupEnd !== group.groupEnd)
      if (!notSameGroup) {
        rowConfig = rowGroup
      }
      else {
        tableGroupConfig?.onChange?.(computedRowGroup)
      }
    }
    if (groupConfigRef.current) {
      rowConfig.groups.forEach(
        (
          { groupName, groupStart: newGroupStart, groupEnd: newGroupEnd },
          index,
        ) => {
          const rowIndex =
            groupConfigRef.current?.groups.findIndex(
              (item) => item.groupName === groupName,
            ) ?? -1;
          if (rowIndex >= 0) {
            let hasNewLine = false;
            const currentOld = groupConfigRef.current?.groups[rowIndex];
            if (
              currentOld &&
              !isNil(currentOld.groupEnd) &&
              !isNil(currentOld.groupStart)
            ) {
              const oldLength = currentOld.groupEnd - currentOld.groupStart;
              const newLength = newGroupEnd - newGroupStart;
              hasNewLine = newLength > oldLength;
            } else {
              hasNewLine = true;
            }

            rowConfig.groupOpen[index] = hasNewLine
              ? true
              : (groupConfigRef.current?.groupOpen[rowIndex] as boolean);
          } else {
            // 新子行
            rowConfig.groupOpen[index] = true;
          }
        },
      );
    }

    setGroupConfig(rowConfig);
    groupConfigRef.current = rowConfig;
  }, [dataSource.length, childrenLength, hasChildren]);

  const handleGroupChange = useCallback(
    (value: SheetType.RowGroupConfig) => {
      setGroupConfig(value);
      tableGroupConfig?.onChange?.(value)
      groupConfigRef.current = value;
    },
    [setGroupConfig],
  );
  const memoConfig = useMemo(
    () => {
      const configMap = groupConfigToGroupMap({
        groups: groupConfig?.groups,
        groupOpen: groupConfig?.groupOpen,
      })
      return {
        ...groupConfig,
        configMap
      }
    },
    [groupConfig],
  );

  return [memoConfig, handleGroupChange] as [
    SheetType.RowGroupConfig & { configMap: SheetType.GroupMap },
    (value: SheetType.RowGroupConfig) => void,
  ];
};

export const formatGroupData = (
  param: Pick<SheetTableType.TableProps, 'dataSource' | 'columns' | 'rowKey'>,
) => {
  const { dataSource, columns, rowKey } = param;
  const data: SheetType.Cell[][] = [];

  let currentIndex = 0;
  dataSource.forEach((item: any, row: number) => {
    let groupList = [item];
    if (item.children) {
      groupList = [item, ...item.children];
    }
    groupList.forEach((itemRow: any) => {
      const dataRow: SheetType.Cell[] = [];
      let rowId: string = itemRow.id || itemRow.key || String(currentIndex);
      if (rowKey) {
        if (rowKey instanceof Function) {
          rowId = rowKey(itemRow, row);
        } else {
          rowId = itemRow[rowKey];
        }
      }

      dataRow.push({
        id: rowId,
        row: currentIndex,
        col: -1,
        editable: !(columns?.[0].editable instanceof Function)
          ? columns?.[0]?.editable
          : columns?.[0]?.editable('', itemRow, currentIndex),
        readonly: !(columns?.[0].readonly instanceof Function)
          ? columns?.[0]?.readonly
          : columns?.[0]?.readonly('', itemRow, currentIndex),
        align: 'center',
        fixed: 'unset',
        valueViewer: GroupViewer,
        className: 'sheet-control',
      } as any);

      columns.forEach((colInfo: SheetTableType.ColumnProps, col: number) => {
        const value = itemRow[colInfo.dataIndex || ''];
        dataRow.push({
          id: rowId,
          value,
          record: itemRow,
          readonly: !(colInfo.readonly instanceof Function)
            ? (colInfo.readonly ?? false)
            : colInfo.readonly(value, itemRow, currentIndex, col),
          align: colInfo.align,
          fixed: colInfo.fixed,
          editable: !(colInfo.editable instanceof Function)
            ? (colInfo.editable ?? true)
            : colInfo.editable(value, itemRow, currentIndex, col),
          valueViewer: colInfo.render ? colInfo.render : undefined,
          dataEditor: colInfo.editor ? colInfo.editor : undefined,
          searchKey: colInfo.searchKey,
          row: currentIndex,
          className: !(colInfo.cellConfig?.className instanceof Function)
            ? colInfo.cellConfig?.className
            : colInfo.cellConfig?.className(value, itemRow, currentIndex),
          dataIndex: colInfo.dataIndex,
          key: colInfo.key,
          col,
        } as any);
      });
      data.push(dataRow);

      currentIndex++;
    });
  });

  return data;
};
