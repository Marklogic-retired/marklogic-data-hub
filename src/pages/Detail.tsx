import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { AuthContext } from '../util/auth-context';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import DetailHeader from '../components/detail-header/detail-header';
import AsyncLoader from '../components/async-loader/async-loader';
import { Layout, Menu, PageHeader } from 'antd';
import XmlView from '../components/xml-view/xml-view';
import { xmlParser, xmlDecoder } from '../util/xml-parser';

interface Props extends RouteComponentProps<any> { }

const { Content } = Layout;

const Detail: React.FC<Props> = ({ history, location }) => {
  const { user, handleError } = useContext(AuthContext);
  const uriSplit = location.pathname.replace('/detail/', '');
  const pkValue = uriSplit.split('/')[0] === '-' ? '' : decodeURIComponent(uriSplit.split('/')[0]);
  const uri = decodeURIComponent(uriSplit.split('/')[1]).replace(/ /g,"%2520");
  const docUri = uri.replace(/%25/g,"%");
  const [selected, setSelected] = useState('instance');
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState();
  const [xml, setXml] = useState();

  const componentIsMounted = useRef(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const result = await axios(`/datahub/v2/search?docUri=${uri}`);
        if (!result.data) {
          history.push('/error');
        }

        if (componentIsMounted.current) {
          const content = result.headers['content-type'];

          // TODO handle exception if document type is json -> XML
          if (content.indexOf("application/json") !== -1) {
            setContentType('json');
            setData(result.data.content);
          } else if (content.indexOf("application/xml") !== -1) {
            setContentType('xml');
            let decodedXml = xmlDecoder(result.data);
            setData(xmlParser(decodedXml).Document);
            setXml(xmlDecoder(decodedXml));
          }

          setIsLoading(false);
        }

      } catch (error) {
        handleError(error);
      }
    };

    if (!user.error.type) {
      fetchData();
    }

    return () => {
      componentIsMounted.current = false;
    }

  }, []);

  const handleClick = (event) => {
    setSelected(event.key);
  }

  return (
    <Layout>
      <Content className= {styles.detailContent}>
        <div id='back-button' style= {{marginLeft: '-23px'}}>
          <PageHeader onBack={() => history.push('/browse')} title={<Link to={{ pathname: "/browse" }} data-cy="back-button">Back</Link>} />
        </div>
        <div className={styles.header}>
          <div className={styles.heading}>
            {data && <DetailHeader document={data} contentType={contentType} uri={docUri} primaryKey={pkValue} />}
          </div>
          <div id='menu' className={styles.menu}>
            <Menu onClick={(event) => handleClick(event)} mode="horizontal" selectedKeys={[selected]}>
              <Menu.Item key="instance" id='instance' data-cy="instance-view">
                Instance
             </Menu.Item>
              <Menu.Item key="full" id='full' data-cy="source-view">
                Source
             </Menu.Item>
            </Menu>
          </div>
        </div>
        <div>
          {
            isLoading || user.error.type === 'ALERT' ?  <div style={{marginTop : '40px'}}>
                  <AsyncLoader/>
                </div>
              :
              contentType === 'json' ?
                selected === 'instance' ? (data && <TableView document={data} contentType={contentType} />) : (data && <JsonView document={data} />)
                :
                selected === 'instance' ? (data && <TableView document={data} contentType={contentType} />) : (data && <XmlView document={xml} />)
          }
        </div>
      </Content>
    </Layout>
  );
}

export default withRouter(Detail);