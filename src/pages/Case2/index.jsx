import { Button, Col, notification, Row, Upload } from 'antd';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Nếu muốn tạo tên duy nhất
import { read, utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { TableComp } from '../Case1/TableComp';
import { UploadOutlined } from '@ant-design/icons';
import { columnsConfig } from '../../constant';

const tableColumns = [
  { title: 'Tên', dataIndex: 'name', key: 'name' },
  { title: 'Tổng điểm', dataIndex: 'totalScore', key: 'totalScore' },
  { title: 'TC2 (0.4 ~ 1)', dataIndex: 'TC2', key: 'TC2' },
  { title: 'TC3 (0.4 ~ 1)', dataIndex: 'TC3', key: 'TC3' },
  { title: 'TC4 (0.4 ~ 1)', dataIndex: 'TC4', key: 'TC4' },
  { title: 'TC5 (0.4 ~ 1)', dataIndex: 'TC5', key: 'TC5' },
  { title: 'TC6 (0.8 ~ 2)', dataIndex: 'TC6', key: 'TC6' },
  { title: 'TC7 (0.4 ~ 1)', dataIndex: 'TC7', key: 'TC7' },
  { title: 'TC8 (0.4 ~ 1)', dataIndex: 'TC8', key: 'TC8' },
];

const Case2 = () => {
  const [data, setData] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type, description) => {
    api[type]({
      message: 'Error',
      description: description || 'Không có data để xuất file',
    });
  };

  const distributeExcess = (row, maxValues, totalScore) => {
    const total = row.reduce((sum, item) => sum + item, 0);
    let excess = total - totalScore;

    // Nếu không có dư thừa, return row ngay
    if (excess <= 0) return row;

    // Tạo một mảng các chỉ số row và hiệu (max - row)
    const indices = row.map((value, index) => ({
      index,
      remainingCapacity: maxValues[index] - value,
    }));

    // Lặp để phân bổ số dư
    while (excess > 0) {
      // Sắp xếp các index theo remainingCapacity giảm dần
      indices.sort((a, b) => b.remainingCapacity - a.remainingCapacity);

      let distributed = false;

      for (let i = 0; i < indices.length; i++) {
        const { index, remainingCapacity } = indices[i];

        if (remainingCapacity > 0) {
          // Tính phần dư chia đều cho các row còn khả năng chứa
          const share = Math.min(remainingCapacity, Math.ceil(excess / indices.length));

          row[index] += share; // Cộng phần chia vào row
          excess -= share; // Giảm số dư
          indices[i].remainingCapacity -= share; // Cập nhật remainingCapacity
          distributed = true;
        }
      }

      // Nếu không thể phân bổ thêm, thoát vòng lặp
      if (!distributed) break;
    }

    return row;
  };

  function generateColumns(totalScore) {
    // Hàm random trong khoảng min và max, làm tròn đến 2 chữ số
    function randomInRange(min, max) {
      return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }

    let row = [];
    let remainingScore = totalScore;
    let numbers = [0, 1, 2, 3, 4, 5, 6];

    // Bước 1: Gán giá trị ngẫu nhiên vào mỗi cột trong phạm vi range của nó
    columnsConfig.forEach((col) => {
      const minValue = col.range[0]; // Giá trị tối thiểu của cột
      const maxValue = col.range[1]; // Giá trị tối đa của cột
      const randomValue = randomInRange(minValue, maxValue);
      row.push(randomValue);
      remainingScore -= randomValue;
    });

    while (numbers.length !== 0 && remainingScore > 0) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      const idx = numbers[randomIndex];
      numbers.splice(randomIndex, 1);
      const diff = columnsConfig[idx].max - row[idx];
      const resultScore = remainingScore - diff;
      row[idx] =
        resultScore > 0
          ? columnsConfig[idx].max
          : row.reduce((total, value, index) => (index === idx ? value + resultScore : total + value)) > totalScore
            ? row[idx] -
              (
                row.reduce((total, value, index) => (index === idx ? value + resultScore : total + value)) - totalScore
              ).toFixed(2)
            : row[idx] + resultScore;
      remainingScore = resultScore;
    }

    return columnsConfig.reduce((acc, col, index) => {
      acc[col.key] = row[index];
      return acc;
    }, {});
  }

  const exportToExcel = (data, fileName) => {
    if (!data || data?.length <= 0) {
      openNotificationWithIcon('error');
      return;
    }

    const newData = data.map((item) => {
      // eslint-disable-next-line no-unused-vars
      const { name, totalScore, key, ...rest } = item; // Destructuring để loại bỏ trường 'age'
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
  };

  const mappingTitle = (data) => {
    return (data || []).map((item) => ({ ...item, name: item['Tên'], totalScore: item['Tổng điểm'] }));
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet);
      const data = mappingTitle(jsonData).map((item) => {
        return {
          ...item,
          ...generateColumns(item.totalScore),
          key: uuidv4(),
        };
      });
      setData(data); // Dữ liệu từ file Excel
    };
    reader.readAsBinaryString(file);
    return false; // Ngăn upload mặc định của antd
  };

  const tableProps = {
    data,
    tableColumns,
  };

  return (
    <>
      {contextHolder}
      <Row gutter={8} align="top">
        <Col span={3}>
          <Upload beforeUpload={handleImport} showUploadList={false}>
            <Button icon={<UploadOutlined />}>Import Excel</Button>
          </Upload>
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
    </>
  );
};

export default Case2;
