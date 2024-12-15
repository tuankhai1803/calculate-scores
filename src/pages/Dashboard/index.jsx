import { Button, Col, Form, notification, Row } from 'antd';
import { TableComp } from './TableComp';
import { Controller, useForm } from 'react-hook-form';
import { InputNumber } from '../../components';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Nếu muốn tạo tên duy nhất
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';

const DEFAULT_VALUE = {
  totalScore: '',
  count: '',
};

const Dashboard = () => {
  const { handleSubmit, control, reset } = useForm({
    defaultValuesL: DEFAULT_VALUE,
  });
  const [data, setData] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type) => {
    api[type]({
      message: 'Error',
      description: 'Không có data để xuất file',
    });
  };

  function generateColumns(totalScore, count) {
    // Cấu hình các cột và range của chúng
    const columnsConfig = [
      { key: 'TC2', max: 1.0, range: [0.4, 1] },
      { key: 'TC3', max: 1.0, range: [0.4, 1] },
      { key: 'TC4', max: 1.0, range: [0.4, 1] },
      { key: 'TC5', max: 1.0, range: [0.4, 1] },
      { key: 'TC6', max: 2.0, range: [0.8, 2] },
      { key: 'TC7', max: 1.0, range: [0.4, 1] },
      { key: 'TC8', max: 1.0, range: [0.4, 1] },
    ];

    // Hàm random trong khoảng min và max
    function randomInRange(min, max) {
      return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }

    // Hàm điều chỉnh tổng điểm
    function adjustColumns(values) {
      let currentSum = values.reduce((sum, v) => sum + v, 0);

      for (let i = 0; i < values.length; i++) {
        if (currentSum > totalScore) {
          const difference = currentSum - totalScore;
          const newValue = Math.max(values[i] - difference, columnsConfig[i].range[0]);
          currentSum -= values[i] - newValue;
          values[i] = newValue;
        }
      }

      return values;
    }

    // Danh sách tên ngẫu nhiên
    const randomNames = [
      'John',
      'Jane',
      'Alice',
      'Bob',
      'Charlie',
      'Daisy',
      'Eve',
      'Frank',
      'Grace',
      'Hannah',
      'Isaac',
      'Jack',
      'Kylie',
      'Leo',
      'Mona',
    ];

    // Sinh dữ liệu
    const data = [];
    for (let i = 0; i < count; i++) {
      let row = [];
      let remainingScore = totalScore;

      for (const col of columnsConfig) {
        const { range } = col;
        const maxAssignable = Math.min(col.max, remainingScore);

        const value = randomInRange(Math.max(range[0], 0), Math.min(range[1], maxAssignable));

        row.push(value);
        remainingScore -= value;
      }

      // Điều chỉnh tổng điểm
      row = adjustColumns(row);

      // Thêm hàng vào kết quả
      data.push({
        key: uuidv4(), // Dùng UUID làm key duy nhất
        name: randomNames[Math.floor(Math.random() * randomNames.length)],
        ...columnsConfig.reduce((acc, col, index) => {
          acc[col.key] = row[index];
          return acc;
        }, {}),
      });
    }

    return data;
  }

  const onSubmit = (values) => {
    const totalScore = values?.totalScore || 8;
    const count = values?.count || 10;

    const data = generateColumns(totalScore, count);
    setData(data);
  };

  const exportToExcel = (data, fileName) => {
    if (!data || data?.length <= 0) {
      openNotificationWithIcon('error');
      return;
    }
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();

    utils.book_append_sheet(workbook, worksheet, 'Data');
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const resetData = () => {
    setData([]);
    reset(DEFAULT_VALUE);
  };

  const baseFormItemProps = {
    control,
  };

  const tableProps = {
    data,
  };

  return (
    <Form onFinish={handleSubmit(onSubmit)}>
      {contextHolder}
      <Row gutter={8} align="bottom" style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Controller
            {...baseFormItemProps}
            name="totalScore"
            render={({ field }) => {
              return <InputNumber {...field} placeholder="Nhập ..." label="Tổng điểm" />;
            }}
          />
        </Col>
        <Col span={8}>
          <Controller
            {...baseFormItemProps}
            name="count"
            render={({ field }) => {
              return <InputNumber {...field} placeholder="Nhập ..." label="Số cột" />;
            }}
          />
        </Col>
        <Col span={3}>
          <Button style={{ width: '100%' }} type="primary" htmlType="submit">
            View
          </Button>
        </Col>
        <Col span={3}>
          <Button style={{ width: '100%' }} onClick={() => exportToExcel(data, 'Generated Data')}>
            Export
          </Button>
        </Col>
        <Col span={2}>
          <Button style={{ width: '100%' }} onClick={resetData}>
            Reset Data
          </Button>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={24}>
          <TableComp {...tableProps} />
        </Col>
      </Row>
    </Form>
  );
};

export default Dashboard;
