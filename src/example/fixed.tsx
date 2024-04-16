import React from 'react';
import Table from '../core/table';

const columns: any = [
  {
    title: 'Full Name',
    width: 100,
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    key: 'age',
    // fixed: 'left',
  },
  {
    title: 'Column 1',

    width: 200,
    dataIndex: 'address',
    key: '1',
  },
  { title: 'Column 2', width: 200, dataIndex: 'address', key: '2' },
  { title: 'Column 3', width: 200, dataIndex: 'address', key: '3' },
  { title: 'Column 4', width: 200, dataIndex: 'address', key: '4' },
  { title: 'Column 5', width: 200, dataIndex: 'address', key: '5' },
  { title: 'Column 6', width: 200, dataIndex: 'address', key: '6' },
  { title: 'Column 7', width: 200, dataIndex: 'address', key: '7' },
  { title: 'Column 8', width: 200, dataIndex: 'address', key: '8' },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 100,
    render: () => <a>action</a>,
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 40,
    address: 'London Park',
  },
];

const App: React.FC = () => (
  <Table
    draggable
    columns={columns}
    dataSource={data}
    scroll={{ x: '100%' }}
    onChange={() => {}}
  />
);

export default App;
