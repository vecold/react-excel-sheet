import { getNumberEditor, getSelectEditor, Table } from '@zhenliang/sheet';
import { Button } from 'antd';
import { isNil } from 'lodash';
import { useCallback, useState } from 'react';
import { SwitchViewer } from '../core/viewer';
import { SheetTableType, SheetType } from '../type';
const RateValueInput = getNumberEditor({ addonAfter: '%', min: 0, max: 100 });
const ValueInput = getNumberEditor({ min: 0, max: 100000000 });
const RateViewer: SheetType.CellViewer = (props) => {
  const { value } = props;
  return <span>{(value as string) ? value + '%' : '-'}</span>;
};

const data = [
  {
    id: 2443,
    draftId: '101601',
    valuationType: 2,
    termDiscountRate: null,
    reversionDiscountRate: null,
    vacancyDiscountRate: null,
    discountRate: 8.5,
    exitCapRate: 4.5,
    gfaUnitPrice: 107350.31545913525,
    nlaUnitPrice: 90130.38038659678,
    totalValuation: 1622707368.4802885,
    isEnabled: true,
  },
  {
    id: 2444,
    draftId: '101601',
    valuationType: 5,
    termDiscountRate: 4.5,
    reversionDiscountRate: 5.5,
    vacancyDiscountRate: 5.5,
    discountRate: null,
    exitCapRate: null,
    gfaUnitPrice: 89327.04427210477,
    nlaUnitPrice: 89327.04427210477,
    totalValuation: 1429232708.3536763,
    isEnabled: false,
  },
];
const evaluateMethods = [
  { label: 'DCF', value: 2 },
  { label: 'T&R', value: 5 },
];

const EvaSelect = getSelectEditor(evaluateMethods);

export default () => {
  const [state] = useState(data);
  const columns: SheetTableType.ColumnProps[] = [
    {
      title: '默认使用',
      dataIndex: 'isEnabled',
      width: 66,
      // cellType: 'operate',
      readonly: (value, record) => !!record.valuationType,
      render: SwitchViewer,
      // component: (record: any, row: number, col: number) => (
      //   <Switch
      //     disabled={isNil(record.valuationType)}
      //     checked={record.isEnabled}
      //     onChange={handleSwitchChange(record, row)}
      //   />
      // ),
    },
    {
      title: '评估方法',
      dataIndex: 'valuationType',
      width: 134,
      readonly: (value, record, row) => !row,
      render: ((props) => (
        <span>
          {evaluateMethods.find((item) => item.value === props.value)?.label}
        </span>
      )) as SheetType.CellViewer,
      editor: getSelectEditor(evaluateMethods),
      // calcReadOnly: (record, rowIndex) => !rowIndex,
      // getSelectOptions: (record: any) => {
      //   if (record.valuationType === 2) {
      //     return evaluateMethods.slice(0, 1);
      //   }
      //   return evaluateMethods.slice(1);
      // },
    },
    {
      title: '租期内折现率',
      dataIndex: 'termDiscountRate',
      width: 134,
      editor: RateValueInput,
      render: RateViewer,
      readonly: (value, record, row) => !row || isNil(record.valuationType),
      // calcReadOnly: (record, rowIndex) => !rowIndex || isNil(record.valuationType),
    },
    {
      title: '租期外折现率',
      dataIndex: 'reversionDiscountRate',
      width: 134,
      render: RateViewer,
      editor: RateValueInput,
      readonly: (value, record, row) => !row || isNil(record.valuationType),
    },
    {
      title: '空置面积折现率',
      dataIndex: 'vacancyDiscountRate',
      width: 134,
      render: RateViewer,
      editor: RateValueInput,
      readonly: (value, record, row) => !row || isNil(record.valuationType),
    },
    {
      title: '折现率',
      dataIndex: 'discountRate',
      width: 134,
      render: RateViewer,
      editor: EvaSelect,

      readonly: (value, record, row) => !row || isNil(record.valuationType),
    },
    {
      title: '退出资本化率',
      dataIndex: 'exitCapRate',
      width: 134,
      render: RateViewer,
      editor: RateValueInput,
      readonly: (value, record, row) => !row || isNil(record.valuationType),
    },
    {
      title: '估值单价/GFA',
      dataIndex: 'gfaUnitPrice',
      width: 134,
      editor: ValueInput,
      readonly: true,
    },
    {
      title: '估值单价/NLA',
      dataIndex: 'nlaUnitPrice',
      width: 134,
      editor: ValueInput,
      readonly: true,
    },
    {
      title: '估值',
      dataIndex: 'totalValuation',
      width: 134,
      editor: ValueInput,
      readonly: true,
    },
    {
      title: '操作',
      width: 62,
      dataIndex: 'id',
      fixed: SheetType.CellAlign.right,
      editable: false,
      render: ((props) => {
        const { row, record } = props;
        if (row) {
          return (
            <div>
              <Button
                type="link"
                onClick={() => {
                  // handleDelete((record as { id: number }).id);
                  // const infos = [{ id: record.id, row, extra: record }];
                  // operateCb && operateCb(4, { row, infos });
                }}
                size="small"
              >
                删除
              </Button>
            </div>
          );
        }
        return <div className="value-viewer number-value-viewer" />;
      }) as SheetType.CellViewer,

      // component: (record: any, row: number, col: number, operateCb?: ExcelTableType.OperateCollector) => {
      //   if (row) {
      //     return (
      //       <div>
      //         <Button
      //           type="link"
      //           onClick={() => {
      //             handleDelete(record.id);
      //             const infos = [{ id: record.id, row, extra: record }];
      //             operateCb && operateCb(4, { row, infos });
      //           }}
      //           size="small"
      //         >
      //           删除
      //         </Button>
      //       </div>
      //     );
      //   }
      //   return <div className="value-viewer number-value-viewer" />;
      // },
    },
  ];

  const handleChange = useCallback(() => {}, [state]);

  return <Table columns={columns} dataSource={state} onChange={handleChange} />;
};
