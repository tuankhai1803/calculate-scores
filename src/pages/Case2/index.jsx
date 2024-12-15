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

  function generateColumns(totalScore) {
    // Hàm random trong khoảng min và max, làm tròn đến 2 chữ số
    function randomInRange(min, max) {
      return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }

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

    // Trả về kết quả dưới dạng object
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
      <Row gutter={8} align="bottom">
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
