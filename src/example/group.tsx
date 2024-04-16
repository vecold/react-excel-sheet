import { cloneDeep } from 'lodash';
import { useCallback, useState } from 'react';
import Table from '../core/table';
import { SheetTableType } from '../type';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  {
    title: 'Address',
    readonly: (value: unknown, record: any, index: number) => {
      // console.log(index);
      return index % 2 === 0;
    },
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Action',
    dataIndex: '',
    key: 'x',
    editable: false,
    render: () => <a>Delete</a>,
  },
];

const data = [
  {
    key: 1,
    id: 1,
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    children: [
      { id: 11, key: '1-1', parentId: 1 },
      { id: 12, key: '1-2', parentId: 1 },
    ],
  },
  {
    key: 2,
    id: 2,
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    children: [
      { id: 21, key: '2-1', parentId: 2 },
      { id: 22, key: '2-2', parentId: 2 },
    ],
  },
  {
    key: 3,
    id: 3,
    name: 'Not Expandable',
    age: 29,
    address: 'Jiangsu No. 1 Lake Park',
  },
  {
    key: 4,
    id: 4,
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    children: [
      { id: 41, key: '4-1', parentId: 4 },
      { id: 42, key: '4-2', parentId: 4 },
    ],
  },
];

const App: React.FC = () => {
  const [state, setState] = useState(data);

  const handleChange = useCallback(
    (
      changes: SheetTableType.TableChange[],
    ) => {
      // console.log(extChange);
      const newState: any[] = cloneDeep(state);
      const flatNewState = newState.reduce((left, right) => {
        return [...left, right, ...(right.children as any) || []]

      }, [])

      changes.forEach((change) => {
        const { key, value, id } = change;
        const changedItem = flatNewState.find((item: any) => item.id === id)
        const parentIndex = newState.findIndex(item => item.id === changedItem.parentId)
        const childIndex = newState[parentIndex].children.findIndex((item: any) => item.id === id)
        newState[parentIndex].children[childIndex][key] = value
        // newState[row][key] = value;
      });
      setState(newState);
    },
    [state],
  );
  return (
    <Table
      draggable
      scroll={{ x: '100%' }}
      columns={columns}
      showBackEdit
      backEditStyle={{
        marginLeft: '10px',
        bottom: '5px',
        right: '5px',
      }}
      // expandable={{
      //   expandedRowRender: (record) => (
      //     <p style={{ margin: 0 }}>{record.description}</p>
      //   ),
      //   rowExpandable: (record) => record.name !== 'Not Expandable',
      // }}
      dataSource={state}
      onChange={handleChange}
    />
  );
};

export default App;
