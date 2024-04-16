import { Table } from '@zhenliang/sheet';
import type { SheetTableType } from '@zhenliang/sheet/type';
import { Space, Tag } from 'antd';
import 'antd/dist/antd.css';
import React, { useCallback, useState } from 'react';

const columns: SheetTableType.ColumnProps[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    editable: false,
    render: ({ value }) => <a>{value as string}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    editable: false,
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: ({ record: { tags } }: any) => (
      <>
        {(tags as string[])?.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    editable: false,
    render: ({ record }: any) => (
      <Space size="middle">
        <a>Invite {record.name as string}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
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
          [key]: key === 'tags' ? String(value as string)?.split(',') : value,
        };
      });
      setData(newData);
    },
    [dataSource],
  );

  return (
    <Table
      draggable
      columns={columns}
      dataSource={dataSource}
      onChange={onChange}
    />
  );
};

export default App;
