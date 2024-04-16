import React from 'react';
import Table from '../core/table';

const columns: any = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: ({ value }: { value: string }) => <a>{value}</a>,
    width: 150,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 80,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address 1',
  },
  {
    title: 'Long Column',
    dataIndex: 'address',
    key: 'address 2',
  },
  {
    title: 'Long Column Long Column',
    dataIndex: 'address',
    key: 'address 3',
  },
  {
    title: 'Long Column',
    dataIndex: 'address',
    key: 'address 4',
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park, New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 2 Lake Park, London No. 2 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park, Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

const App: React.FC = () => (
  <Table draggable columns={columns} dataSource={data} onChange={() => {}} />
);

export default App;
