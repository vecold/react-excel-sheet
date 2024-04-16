import { Sheet, useSetState } from '@zhenliang/sheet';
import { GroupContext } from '@zhenliang/sheet/hooks/useGroupConfig';
import { WidthContext } from '@zhenliang/sheet/hooks/useWidthConfig';
import { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { ConfigProvider, Empty } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SheetEvent } from '../sheet/Event';
import { DraggableShell } from '../shell/draggableShell';
import { TableShell } from '../shell/tableShell';
import { GroupEvent, SelectionEvent } from './events';
import { formatGroupData, useGroupConfig } from './useGroupConfig';
import { formatSelectionData, useRowSelection } from './useRowSelection';
import { AddButton } from './addButton';

const Table: React.FC<SheetTableType.TableProps> = ({
  sheetInstance: sheetRef,
  columns,
  dataSource,
  rowKey,
  rowSelection,
  groupConfig,
  onChange,
  handleAdd,
  handleBatchAdd,
  draggable,
  eventHandler,
  ...args
}) => {
  const [data, setData] = useState<SheetType.Cell[][]>([[]]);
  const _sheetInstance = useRef<SheetType.SheetInstance | null>(null);
  const [widths, setWidth] = useSetState<Record<number | string, number>>({});
  const sheetInstance = sheetRef || _sheetInstance;

  const dataHasChildren = dataSource?.some(
    (item) => (item?.children as Array<any>)?.length > 0,
  );
  const configWithChildren = !!groupConfig && !!dataSource.length;
  const hasChildren = dataHasChildren || configWithChildren;
  const hasControl = hasChildren || !!rowSelection;

  const [checkedRow, setCheckedRow] = useRowSelection(
    dataSource,
    rowSelection,
    hasChildren,
  );
  const [rowGroupConfig, setGroupConfig] = useGroupConfig(
    dataSource,
    { defaultOpen: true, ...groupConfig },
    hasChildren,
  );

  useEffect(() => {
    if (!hasChildren) return;
    if (!dataSource || !columns) return;

    setData(
      formatGroupData({
        dataSource,
        columns,
        rowKey,
      }),
    );
  }, [dataSource, columns, hasChildren, rowKey]);

  useEffect(() => {
    if (hasChildren) return;
    if (!dataSource || !columns) return;

    setData(
      formatSelectionData({
        dataSource,
        columns,
        checked: checkedRow,
        rowKey,
        rowSelection,
      }),
    );
  }, [dataSource, columns, checkedRow, hasChildren, rowKey, rowSelection]);

  useEffect(() => {
    if (!dataSource || !columns) {
      setData([[]]);
    }
  }, [dataSource, columns]);

  const handleChanges = useCallback(
    (changes: SheetType.CellData[], extChange?: SheetType.CellData[]) => {
      onChange &&
        onChange(
          changes.map((item) => ({
            col: item.col,
            row: item.row,
            id: item.id,
            key: columns[hasControl ? item.col - 1 : item.col]
              .dataIndex as string,
            value: item.value,
          })),
          extChange?.map((item) => ({
            col: item.col,
            row: item.row,
            id: item.id,
            key: columns[hasControl ? item.col - 1 : item.col]
              .dataIndex as string,
            value: item.value,
          })),
        );
    },
    [columns, onChange, hasControl],
  );
  const handleReverse = useCallback(
    (value: unknown) => {
      const { type, extraInfo } = value as SheetType.OperateHistory;
      if (type === 'Custom') {
        const { groupConfig, extraType } = extraInfo as {
          extraType: string;
          groupConfig: SheetType.RowGroupConfig;
          data: SheetType.Cell[][];
        };
        if (extraType === 'group') {
          setGroupConfig(groupConfig);
        }
      }
    },
    [data, groupConfig],
  );
  const handleRowSelect = useCallback(
    (value: unknown) => {
      if (!sheetInstance.current) return;
      const currentRow = value as number;
      // sheetInstance.current?.selectRow(value as number);
      const newChecked = Array(checkedRow.length).fill(false);
      newChecked[currentRow] = !newChecked[currentRow];
      setCheckedRow(newChecked);
    },
    [sheetInstance, checkedRow],
  );

  const headSelection = !!rowSelection;
  const columnsTitle = useMemo(() => {
    return columns.filter(item => typeof item.title === 'string').map(item => item.title).join('_')
  }, [columns])
  const WrappedTableShell = useMemo(() => {
    if (draggable) {
      return DraggableShell({
        columns,
        className: 'baseTable',
        showGroup: hasChildren,
        showSelect: !!rowSelection,
        controlProps: {
          check: {
            checked: false,
          },
        },
      });
    }
    return TableShell({
      columns,
      className: 'baseTable',
      showGroup: hasChildren,
      showSelect: !!rowSelection,
      controlProps: {
        check: {
          checked: false,
        },
      },
    });
  }, [columns.length, columnsTitle, draggable, headSelection, hasChildren]);

  return (
    <ConfigProvider
      renderEmpty={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    >
      <WidthContext.Provider value={{ widths, onChange: setWidth }}>
        <GroupContext.Provider
          value={{ config: rowGroupConfig, onChange: setGroupConfig }}
        >
          <Sheet
            {...args}
            sheetInstance={sheetInstance}
            sheetRenderer={WrappedTableShell}
            data={data}
            onCellsChanged={handleChanges}
          >
            <SelectionEvent
              hasChildren={hasChildren}
              rowSelection={rowSelection}
              onChange={handleRowSelect}
            />
            <GroupEvent
              hasChildren={hasChildren}
              data={data}
              sheetInstance={sheetInstance.current}
              onGridChange={setData}
            />
            <SheetEvent key="_reverse" name="reverse" handler={handleReverse} />
            {Object.keys(eventHandler || {}).map((key) => (
              <SheetEvent key={key} name={key} handler={eventHandler?.[key]} />
            ))}
            <AddButton handleAdd={handleAdd} handleBatchAdd={handleBatchAdd} />
          </Sheet>
        </GroupContext.Provider>
      </WidthContext.Provider>
    </ConfigProvider>
  );
};

export default Table;
