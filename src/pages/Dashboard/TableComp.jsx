import { Table } from 'antd';

const tableColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'TC2 (0.4 ~ 1)', dataIndex: 'TC2', key: 'TC2' },
  { title: 'TC3 (0.4 ~ 1)', dataIndex: 'TC3', key: 'TC3' },
  { title: 'TC4 (0.4 ~ 1)', dataIndex: 'TC4', key: 'TC4' },
  { title: 'TC5 (0.4 ~ 1)', dataIndex: 'TC5', key: 'TC5' },
  { title: 'TC6 (0.8 ~ 2)', dataIndex: 'TC6', key: 'TC6' },
  { title: 'TC7 (0.4 ~ 1)', dataIndex: 'TC7', key: 'TC7' },
  { title: 'TC8 (0.4 ~ 1)', dataIndex: 'TC8', key: 'TC8' },
];

export const TableComp = (props) => {
  // TC2 cao nhất là 1.0 điểm (range 0.4 ~ 1)
  // TC3 cao nhất là 1.0 điểm (range 0.4 ~ 1)
  // TC4 cao nhất là 1.0 điểm (range 0.4 ~ 1)
  // TC5 cao nhất là 1.0 điểm (range 0.4 ~ 1)
  // TC6 cao nhất là 2.0 điểm (range 0.8 ~ 2)
  // TC7 cao nhất là 1.0 điểm (range 0.4 ~ 1)
  // TC8 cao nhất là 1.0 điểm (range 0.4 ~ 1)

  // eslint-disable-next-line react/prop-types
  return <Table columns={tableColumns} dataSource={props?.data || []} />;
};
