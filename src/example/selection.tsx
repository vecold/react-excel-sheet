import { Table } from '@zhenliang/sheet';
import type { SheetTableType } from '@zhenliang/sheet/type';
import 'antd/dist/antd.css';
import React, { useCallback, useState } from 'react';

const columns: SheetTableType.ColumnProps[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: ({ value }) => <a>{value as string}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Disabled User',
    age: 99,
    address: 'Sidney No. 1 Lake Park',
  },
];

const App: React.FC = () => {
  const [dataSource, setData] = useState(data);

  const onChange = useCallback(
    (changes: SheetTableType.TableChange[]) => {
      const newData = [...dataSource];
      changes.forEach(({ row, key, value }) => {
        newData[row] = {
          ...newData[row],
          [key]: key === 'tags' ? (value as string).split(',') : value,
        };
      });
      setData(newData);
    },
    [dataSource],
  );
  const handleRowChange = useCallback(() => {}, []);

  return (
    <Table
      draggable
      columns={columns}
      rowKey="key"
      dataSource={dataSource}
      onChange={onChange}
      rowSelection={{ rowSelected: [], onChange: handleRowChange }}
    />
  );
};

export default App;
