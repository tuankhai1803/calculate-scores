import { useEffect, useState } from 'react';
import { Menu as MenuComp } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  {
    label: 'Case 1',
    key: 'case-1',
  },
  {
    label: 'Case 2',
    key: 'case-2',
  },
];

export const Menu = () => {
  const [current, setCurrent] = useState('case-1');
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (e) => {
    navigate(`/${e.key}`);
    setCurrent(e.key);
  };

  useEffect(() => {
    setCurrent(location.pathname === '/case-1' ? 'case-1' : 'case-2');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MenuComp onClick={onClick} selectedKeys={[current]} mode="vertical" items={items} />;
};
