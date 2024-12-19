import { Button, Col, Form, notification, Row } from 'antd';
import { TableComp } from './TableComp';
import { Controller, useForm } from 'react-hook-form';
import { InputNumber } from '../../components';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Nếu muốn tạo tên duy nhất
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { columnsConfig, max, min } from '../../constant';

const DEFAULT_VALUE = {
  totalScore: '',
  count: '',
};

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

const Case1 = () => {
  const { handleSubmit, control, reset } = useForm({
    defaultValuesL: DEFAULT_VALUE,
  });
  const [data, setData] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type, description) => {
    api[type]({
      message: 'Error',
      description: description || 'Không có data để xuất file',
    });
  };

  function generateColumns(totalScore, count) {
    // Hàm random trong khoảng min và max, làm tròn 2 số thập phân
    function randomInRange(min, max) {
      return +(Math.random() * (max - min) + min).toFixed(2);
    }

    const data = [];

    for (let i = 0; i < count; i++) {
      let row = []; // Reset `row` cho mỗi lần lặp
      let remainingScore = totalScore; // Reset `remainingScore`

      // Bước 1: Gán giá trị tối thiểu cho mỗi cột
      columnsConfig.forEach((col) => {
        row.push(col.range[0]);
        remainingScore -= col.range[0];
      });

      // Bước 2: Phân phối phần còn lại một cách ngẫu nhiên
      columnsConfig.forEach((col, idx) => {
        if (remainingScore <= 0) return; // Thoát nếu không còn phần dư

        const maxAddable = +(col.range[1] - row[idx]).toFixed(2); // Giá trị tối đa có thể thêm vào
        const randomValue = randomInRange(0, Math.min(maxAddable, remainingScore));

        row[idx] += randomValue;
        remainingScore -= randomValue;
      });

      // Bước 3: Điều chỉnh sai số còn lại vào cột cuối cùng
      if (remainingScore > 0) {
        for (let i = row.length - 1; i >= 0; i--) {
          const maxAddable = +(columnsConfig[i].range[1] - row[i]).toFixed(2);
          const adjustValue = Math.min(maxAddable, remainingScore);
          row[i] += adjustValue;
          remainingScore -= adjustValue;
          if (remainingScore <= 0) break;
        }
      }

      data.push({
        key: uuidv4(),
        name: randomNames[Math.floor(Math.random() * randomNames.length)],
        ...columnsConfig.reduce((acc, col, index) => {
          acc[col.key] = +row[index].toFixed(2);
          return acc;
        }, {}),
      });
    }

    // Bước 4: Trả về kết quả
    return data;
  }

  const onSubmit = (values) => {
    const totalScore = values?.totalScore || 8;
    const count = values?.count || 10;

    if (totalScore > max) {
      return openNotificationWithIcon('error', `Tổng điểm không được > ${max}`);
    } else if (totalScore < min) {
      return openNotificationWithIcon('error', `Tổng điểm không được < ${min}`);
    }

    const data = generateColumns(totalScore, count);
    setData(data);
  };

  const exportToExcel = (data, fileName) => {
    if (!data || data?.length <= 0) {
      openNotificationWithIcon('error');
      return;
    }

    const newData = data.map((item) => {
      // eslint-disable-next-line no-unused-vars
      const { key, ...rest } = item; // Destructuring để loại bỏ trường 'age'
      return rest;
    });

    const worksheet = utils.json_to_sheet(newData);
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

export default Case1;
