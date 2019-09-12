import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { RouteComponentProps } from 'react-router-dom';
import { AuthContext } from '../util/auth-context';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import DocumentHeader from '../components/detail-header/detail-header';
import { Layout, Menu, PageHeader, Spin } from 'antd';

interface Props extends RouteComponentProps<any> { }

const Detail: React.FC<Props> = ({ history }) => {

  const { Content } = Layout;
  const { userNotAuthenticated } = useContext(AuthContext);
  const [selected, setSelected] = useState('instance');
  const [data, setData] = useState();
  const [query, setQuery] = useState(history.location.state.uri);
  const [isLoading, setIsLoading] = useState(false);

  let database = history.location.state.database;

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const result = await axios(
        `datahub/v2/search?docUri=${query}`,
      );
      
      setData(JSON.parse(result.data.content));
      setIsLoading(false);
    };

    fetchData();
  }, []);

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
          {data && <DocumentHeader document={data} />}
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
        {
          isLoading ? <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} />
          : 
          selected === 'instance' ? (data && <TableView document={data} />) : (data && <JsonView document={data} />)
        }        </div>
      </Content>
    </Layout>
  );
}

export default Detail as any;