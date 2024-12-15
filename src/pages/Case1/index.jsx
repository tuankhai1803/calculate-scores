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
    // Hàm random trong khoảng min và max, làm tròn đến 2 chữ số
    function randomInRange(min, max) {
      return parseFloat((Math.random() * (max - min) + min).toFixed(2));
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

      // Bước 1: Gán giá trị ngẫu nhiên vào mỗi cột trong phạm vi range của nó
      columnsConfig.forEach((col) => {
        const minValue = col.range[0]; // Giá trị tối thiểu của cột
        const maxValue = col.range[1]; // Giá trị tối đa của cột
        const randomValue = randomInRange(minValue, maxValue);
        row.push(randomValue);
        remainingScore -= randomValue; // Trừ đi giá trị ngẫu nhiên đã gán
      });

      // Bước 2: Phân phối phần điểm còn lại vào các cột sao cho không vượt quá giá trị max
      let i = 0;
      while (remainingScore > 0 && i < row.length) {
        const col = columnsConfig[i];
        const maxAssignable = Math.min(col.max, row[i] + remainingScore); // Không vượt quá maxAssignable
        const maxAddable = maxAssignable - row[i]; // Phần điểm có thể thêm vào cột này

        // Thêm phần điểm vào cột mà không vượt quá giới hạn
        const addValue = Math.min(remainingScore, maxAddable);
        row[i] = parseFloat((row[i] + addValue).toFixed(2)); // Làm tròn đến 2 chữ số
        remainingScore -= addValue;

        i++; // Chuyển sang cột tiếp theo
      }

      // Bước 3: Nếu còn điểm dư, phân phối đều cho các cột còn lại
      if (remainingScore > 0) {
        for (let j = 0; j < row.length && remainingScore > 0; j++) {
          const col = columnsConfig[j];
          const maxAssignable = Math.min(col.max, row[j] + remainingScore); // Không vượt quá maxAssignable
          const maxAddable = maxAssignable - row[j]; // Phần điểm có thể thêm vào cột này

          // Thêm phần điểm vào cột mà không vượt quá giới hạn
          const addValue = Math.min(remainingScore, maxAddable);
          row[j] = parseFloat((row[j] + addValue).toFixed(2)); // Làm tròn đến 2 chữ số
          remainingScore -= addValue;

          // Nếu phần điểm dư còn lại đã được phân phối hết, dừng lại
          if (remainingScore <= 0) {
            break;
          }
        }
      }

      // Đảm bảo tổng các giá trị trong hàng chính xác bằng totalScore
      const totalRowScore = row.reduce((sum, v) => sum + v, 0);
      if (Math.abs(totalRowScore - totalScore) > 0.01) {
        // Điều chỉnh thêm để đảm bảo tổng điểm chính xác
        const diff = totalScore - totalRowScore;
        // Kiểm tra sự chênh lệch và chỉ điều chỉnh nếu cần thiết
        if (row[0] + diff >= 0) {
          // Nếu điều chỉnh vào cột đầu tiên không gây âm
          row[0] = parseFloat((row[0] + diff).toFixed(2));
        }
      }

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
