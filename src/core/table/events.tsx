/* eslint-disable @typescript-eslint/no-unused-vars */
import { useGroup } from '@zhenliang/sheet/hooks/useGroupConfig';
import { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { FC } from 'react';
import { SheetEvent } from '../sheet/Event';

export const SelectionEvent: FC<{
  hasChildren: boolean;
  rowSelection?: SheetTableType.TableRowSelection;
  onChange: (value: unknown) => void;
}> = (props) => {
  const { hasChildren, rowSelection, onChange } = props;
  if (hasChildren || !rowSelection) return null;
  return (
    <>
      <SheetEvent key="row-select" name="row-select" handler={onChange} />
      <SheetEvent
        key="row-select-title"
        name="row-select-title"
        handler={onChange}
      />
      ,
    </>
  );
};

export const GroupEvent: FC<{
  hasChildren: boolean;
  data: SheetType.Cell[][];
  sheetInstance: SheetType.SheetInstance | null;
  onGridChange: (value: SheetType.Cell[][]) => void;
}> = (props) => {
  const { hasChildren, sheetInstance } = props;
  const {
    config: rowGroupConfig = {} as SheetType.RowGroupConfig,
    onChange: onGroupChange,
  } = useGroup();
  if (!hasChildren) return null;

  const { groups } = rowGroupConfig;
  return (
    <>
      <SheetEvent
        key="group-open"
        name="group-open"
        handler={(e: unknown) => {
          const { row } = e as { row: number };
          const index = groups?.findIndex((item) => item.groupStart === row);
          if (index >= 0) {
            const groupOpen = [...rowGroupConfig?.groupOpen];
            groupOpen[index] = !rowGroupConfig?.groupOpen[index];
            onGroupChange &&
              onGroupChange({
                ...rowGroupConfig,
                groupOpen: groupOpen,
              });

            sheetInstance?.pushToHistory({
              type: 'Custom' as SheetType.OperateType,
              changes: [],
              extraInfo: {
                extraType: 'group',
                groupConfig: rowGroupConfig,
              },
            });
          }
        }}
      />
      <SheetEvent
        key="group-open-title"
        name="group-open-title"
        handler={(value) => {
          if (!rowGroupConfig?.groupOpen.some(item => item !== value)) return
          onGroupChange &&
            onGroupChange({
              ...rowGroupConfig,
              groupOpen: Array(rowGroupConfig?.groupOpen.length).fill(value),
              defaultOpen: !groups.length ? (value as boolean) : undefined,
            });

          sheetInstance?.pushToHistory({
            type: 'Custom' as SheetType.OperateType,
            changes: [],
            extraInfo: {
              extraType: 'group',
              groupConfig: rowGroupConfig,
            },
          });
        }}
      />
    </>
  );
};
