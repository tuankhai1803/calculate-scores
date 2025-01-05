import { Button, Col, notification, Row, Select, Upload } from 'antd';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Nếu muốn tạo tên duy nhất
import { read, utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { TableComp } from '../Case1/TableComp';
import { UploadOutlined } from '@ant-design/icons';
import { columnsConfig, max as maxScore, min as minScore } from '../../constant';

const tableColumns = [
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.length - b.name.length,
  },
  { title: 'Tổng điểm', dataIndex: 'totalScore', key: 'totalScore', defaultSortOrder: 'ascend' },
  { title: 'TC2 (0.6 ~ 1.5)', dataIndex: 'TC2', key: 'TC2' },
  { title: 'TC3 (0.6 ~ 1.5)', dataIndex: 'TC3', key: 'TC3' },
  { title: 'TC4 (0.8 ~ 2)', dataIndex: 'TC4', key: 'TC4' },
  { title: 'TC5 (0.4 ~ 1)', dataIndex: 'TC5', key: 'TC5' },
  { title: 'TC6 (0.8 ~ 2)', dataIndex: 'TC6', key: 'TC6' },
  { title: 'TC7 (0.4 ~ 1)', dataIndex: 'TC7', key: 'TC7' },
  { title: 'TC8 (0.4 ~ 1)', dataIndex: 'TC8', key: 'TC8' },
  {
    title: 'Lỗi',
    dataIndex: 'error',
    key: 'error',
    render: (text) => <span style={{ fontWeight: 'bold', color: 'red', fontSize: 16 }}>{text}</span>,
    sorter: (a, b) => a.name.length - b.name.length,
  },
];

const Case2 = () => {
  const [data, setData] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const defautDataRef = useRef([]);

  const openNotificationWithIcon = (type, description) => {
    api[type]({
      message: 'Error',
      description: description || 'Không có data để xuất file',
    });
  };

  function generateColumns(totalScore) {
    // Hàm random trong khoảng min và max, làm tròn 2 số thập phân
    function randomInRange(min, max) {
      return +(Math.random() * (max - min) + min).toFixed(2);
    }

    let row = [];
    let remainingScore = totalScore;

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

    // Bước 4: Trả về kết quả
    return columnsConfig.reduce((acc, col, index) => {
      acc[col.key] = +row[index].toFixed(2);
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
      const { name, totalScore, key, isError, error, ...rest } = item; // Destructuring để loại bỏ trường
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

  const showErrorByTotalScore = (totalScore) => {
    if (totalScore > maxScore) return `Điểm > ${maxScore}`;
    else if (totalScore < minScore) return `Điểm < ${minScore}`;
  };

  const mappingTitle = (data) => {
    return (data || []).map((item) => {
      const totalScore = +(item['Tổng điểm'] || 0);
      const error = showErrorByTotalScore(totalScore);
      return {
        ...item,
        name: item['Tên'],
        totalScore,
        error: error ? error : '',
        isError: !!error,
      };
    });
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
          ...(showErrorByTotalScore(item.totalScore) ? 0 : generateColumns(item.totalScore)),
          key: uuidv4(),
        };
      });
      setData(data); // Dữ liệu từ file Excel
      defautDataRef.current = data;
    };
    reader.readAsBinaryString(file);
    return false; // Ngăn upload mặc định của antd
  };

  const handleChange = (value) => {
    if (value === 'successful') {
      const dataFormat = defautDataRef.current.filter((item) => !item.isError);
      setData(dataFormat);
      return;
    } else if (value === 'error') {
      const dataFormat = defautDataRef.current.filter((item) => item.isError);
      setData(dataFormat);
      return;
    }
    setData(defautDataRef.current);
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
          <Select onChange={handleChange} style={{ width: '100%' }} defaultValue="All">
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="successful">Successful</Select.Option>
            <Select.Option value="error">Error</Select.Option>
          </Select>
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
