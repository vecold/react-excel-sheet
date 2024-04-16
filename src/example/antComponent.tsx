import { Button, Modal } from 'antd';
import { cloneDeep, random, range } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  getCascaderEditor,
  getDateEditor,
  getNumberEditor,
  getSelectEditor,
} from '../core/editor';
import Table from '../core/table';
import { getSelectorViewer } from '../core/viewer';
import { BtnViewer } from '../core/viewer/btnViewer';
import { getCascaderViewer } from '../core/viewer/cascaderViewer';
import { EditViewer } from '../core/viewer/editViewer';
import { SwitchViewer } from '../core/viewer/switchViewer';
import { SheetTableType, SheetType } from '../type';

const Precision2MoneyEditor = getNumberEditor({
  max: 1000,
  min: 0,
  precision: 2,
  addonAfter: '元',
});
const Precision2Number = getNumberEditor({
  max: 1000,
  min: 0,
  precision: 2,
});

const SelectorOptions = [
  {
    value: '1',
    label: '111111',
  },
  {
    value: '2',
    label: '222222',
  },
  {
    value: '3',
    label: '333333',
  },
];

const getTypeViewer = (options: SheetType.Options[]) => {
  const TypeViewer: SheetType.CellViewer = (props) => {
    return options.find(
      (item) => item.label === props.value || item.value == props.value,
    )?.label;
  };
  return TypeViewer;
};

const cascaderOptions = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
];

const CascaderViewer = getCascaderViewer(cascaderOptions);

const CascaderSelector = getCascaderEditor(cascaderOptions);

const columns: SheetTableType.ColumnProps[] = [
  {
    title: 'Full Name',
    width: 100,
    dataIndex: 'open',
    key: 'open',
    fixed: 'left',
    render: SwitchViewer,
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    key: 'age',
    editor: Precision2Number,
    readonly: (value, record, row) => row === 1,
    // fixed: 'left',
  },
  {
    title: 'price',
    width: 100,
    dataIndex: 'price',
    key: 'price',
    editor: Precision2MoneyEditor,
    readonly: (value, record, row) => row === 1,
    // fixed: 'left',
  },
  {
    title: 'date',
    width: 150,
    dataIndex: 'date',
    key: 'date',
    editor: getDateEditor(),
    // fixed: 'left',
  },
  {
    title: 'select',
    width: 200,
    dataIndex: 'select',
    render: getSelectorViewer(SelectorOptions),
    editor: getSelectEditor(SelectorOptions, 'label'),
  },
  {
    title: 'Column 2',
    width: 200,
    titleConfig: {
      colSpan: 2,
    },
    dataIndex: 'address1',
    align: SheetType.CellAlign.center,
    key: '2',
    render: CascaderViewer,
    editor: CascaderSelector,
  },
  {
    title: 'Column 3',
    width: 200,
    titleConfig: {
      colSpan: 0,
    },
    dataIndex: 'address2',
    key: '3',
    editable: false,
    render: EditViewer,
  },
  { title: 'Column 4', width: 200, dataIndex: 'address3', key: '4' },
  { title: 'Column 5', width: 200, dataIndex: 'address4', key: '5' },
  { title: 'Column 6', width: 200, dataIndex: 'address5', key: '6' },
  { title: 'Column 7', width: 200, dataIndex: 'address6', key: '7' },
  { title: 'Column 8', width: 200, dataIndex: 'address7', key: '8' },
  {
    title: 'Action',
    align: SheetType.CellAlign.center,
    key: 'operation',
    fixed: 'right',
    width: 150,
    render: BtnViewer,
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    date: '2020-01-01',
    open: true,
    age: 1,
    address1: 'West Lake',
    address2: '打开对话框1',
    select: '111111',
    address: 'New York Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    open: false,
    date: '1990-01-01',
    address2: '打开对话框2',
    age: 2,
    select: '222222',
    address: 'London Park',
  },
];

const App: React.FC = () => {
  const [state, setState] = useState(data);
  const [options, setOptions] = useState(SelectorOptions);

  const sheetInstance = useRef<SheetType.SheetInstance | null>(null);
  const handleChange = useCallback(
    (
      changes: SheetTableType.TableChange[],
      extChange?: SheetTableType.TableChange[],
    ) => {
      // console.log(extChange);
      const newState: any = cloneDeep(state);
      changes.forEach((change) => {
        const { row, key, value } = change;
        newState[row][key] = value;
      });
      setState(newState);
    },
    [state],
  );
  const handleAdd = useCallback((count = 1) => {
    const newState: any = cloneDeep(state);
    sheetInstance.current?.pushToHistory({
      type: 'NewRow',
      changes: [],
      rowInfo: { newRow: newState.length },
    });
    setState([
      ...newState,
      ...range(0, count).map((a, i) => ({
        key: String(random()),
        name: 'new',
        open: false,
        date: '1990-01-01',
        address2: `打开对话框2${newState.length + 2 + i}`,
        age: newState[newState.length - 1].age + i + 1,
        select: '111111',
        address: 'London Park',
      }
      ))
    ]);

    setTimeout(() => {
      console.log('select', newState.length + count - 1)
      sheetInstance.current?.selectRow(newState.length + count - 1)
      console.log('zoomTO', newState.length + count - 1)
      sheetInstance.current?.zoomTo(newState.length + count - 1)
    }, 100)
  }, [state]);

  const handleOptionsAdd = useCallback(() => {
    setOptions([
      ...options,
      {
        label: String(`newSelect${random(false)}`),
        value: String(random(true)),
      },
    ]);
  }, [options]);

  const antColumns = useMemo(() => {
    const newColumns = [...columns];
    newColumns[4] = {
      ...columns[4],
      render: getTypeViewer(options),
      editor: getSelectEditor(
        options,
        'value',
        <Button id="antColumnAdd" type="link" onClick={handleOptionsAdd}>
          新增
        </Button>,
      ),
    };
    return newColumns;
  }, [options]);
  return (
    <Table
      freePaste
      draggable
      sheetInstance={sheetInstance}
      columns={antColumns}
      dataSource={state}
      scroll={{ x: '100%' }}
      onChange={handleChange}
      handleAdd={handleAdd}
      handleBatchAdd={handleAdd}
      eventHandler={{
        reverse: (value: unknown) => {
          // 处理 行列删除自定义事件
          const { type, rowInfo } = value as SheetType.OperateHistory;
          if (type === 'Custom') {
            // console.log('操作');
          } else if (type === 'NewRow') {
            const newState = [...state];
            newState.splice(rowInfo?.newRow as number, 1);
            setState(newState);
          }
        },
        'cell-edit': (value: unknown) => {
          const { row, value: cellValue } = value as {
            row: number;
            record: Record<string, unknown>;
            value: unknown;
          };
          Modal.confirm({
            title: `${row} - ${cellValue}编辑点什么`,
          });
        },
        'btn-click': (value: unknown) => {
          const { row, type } = value as {
            row?: number;
            type: 'copy' | 'delete';
          };
          Modal.confirm({
            title: `${row} - ${type}提示点什么`,
          });
        },
        'cell-switch': (value: unknown) => {
          const { row, value: cellValue } = value as {
            row: number;
            record: Record<string, unknown>;
            value: unknown;
          };
          const newState = [...state];
          newState[row] = {
            ...newState[row],
            open: !cellValue,
          };

          setState(newState);
        },
      }}
    />
  );
};

export default App;
