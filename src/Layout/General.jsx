import { Layout } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { Outlet } from 'react-router-dom';
import { Menu } from './Menu';

const headerStyle = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: '#4096ff',
  // fontSize: 18,
  // fontWeight: 'bold',
};

const contentStyle = {
  minHeight: 120,
  lineHeight: '120px',
  padding: 16,
};

const siderStyle = {
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#fff',
  margin: '8px 0',
};

const footerStyle = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#4096ff',
};

const layoutStyle = {
  overflow: 'hidden',
  width: 'calc(100% - 8px)',
  maxWidth: 'calc(100% - 8px)',
  minHeight: '100vh',
};

const General = () => {
  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>Header</Header>
      <Layout>
        <Sider width="15%" style={siderStyle}>
          <Menu />
        </Sider>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
      <Footer style={footerStyle}>Footer</Footer>
    </Layout>
  );
};

export default General;
