import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import DocumentHeader from '../components/detail-header/detail-header';
import Document from '../assets/example';
import { Layout, Menu, PageHeader } from 'antd';

interface Props extends RouteComponentProps<any> { }

const Detail: React.FC<Props> = ({ history }) => {

  const { Content } = Layout;
  const [selected, setSelected] = useState('instance');

  const handleClick = (event) => {
    setSelected(event.key);
  }

  return (
    <Layout>
      <Content style={{ background: '#fff', padding: '18px 36px' }}>
        <div id='back-button'>
          <PageHeader style={{ padding: '0px', marginBottom: '20px' }} onBack={() => history.push('/browse')} title="Back" />
        </div>
        <div className={styles.header}>
          <div className={styles.heading}>
            <DocumentHeader document={Document} />
          </div>
          <div id='menu' className={styles.menu}>
            <Menu onClick={(event) => handleClick(event)} mode="horizontal" selectedKeys={[selected]}>
              <Menu.Item key="instance" id='instance'>
                Instance
             </Menu.Item>
              <Menu.Item key="full" id='full'>
                Source
             </Menu.Item>
            </Menu>
          </div>
        </div>
        <div>
          {selected === 'instance' ? <TableView document={Document} /> : <JsonView document={Document} />}
        </div>
      </Content>
    </Layout>
  );
}

export default Detail as any;