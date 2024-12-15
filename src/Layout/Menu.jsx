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
    const redirectPage = location.pathname === '/case-2' ? 'case-2' : 'case-1';
    setCurrent(redirectPage);
    navigate(redirectPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <MenuComp onClick={onClick} selectedKeys={[current]} mode="vertical" items={items} />;
};
