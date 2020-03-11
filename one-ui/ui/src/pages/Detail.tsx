import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { UserContext } from '../util/user-context';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import DetailHeader from '../components/detail-header/detail-header';
import AsyncLoader from '../components/async-loader/async-loader';
import {Layout, Menu, PageHeader, Tooltip} from 'antd';
import XmlView from '../components/xml-view/xml-view';
import { xmlParser, xmlDecoder } from '../util/xml-parser';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThList, faCode} from "@fortawesome/free-solid-svg-icons";
import { useInterval } from '../hooks/use-interval';


interface Props extends RouteComponentProps<any> { }

const { Content } = Layout;

const Detail: React.FC<Props> = ({ history, location }) => {

  const { user, handleError, userNotAuthenticated } = useContext(UserContext);
  const uriSplit = location.pathname.replace('/detail/', '');
  const pkValue = uriSplit.split('/')[0] === '-' ? '' : decodeURIComponent(uriSplit.split('/')[0]);
  const uri = decodeURIComponent(uriSplit.split('/')[1]).replace(/ /g, "%2520");
  const docUri = uri.replace(/%25/g, "%");
  const [selected, setSelected] = useState();
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState();
  const [xml, setXml] = useState();
  let sessionCount = 0;

  const componentIsMounted = useRef(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const result = await axios(`/api/search?docUri=${uri}`);
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
          sessionCount = 0;
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

  useEffect(() => {
    location.state && location.state.hasOwnProperty('selectedValue') && location.state['selectedValue'] === 'source' ?
      setSelected('full') : setSelected('instance');
    if(location.state === undefined){
      location.state = {};
    }
  }, []);


  const handleClick = (event) => {
    setSelected(event.key);
  }

  useInterval(() => {
    if (sessionCount === user.maxSessionTime) {
      userNotAuthenticated();
    } else {
      sessionCount += 1;
    }
  }, 1000);

  return (
    <Layout>
      <Content className={styles.detailContent}>
        <div id='back-button' style={{ marginLeft: '-23px' }}>
          <PageHeader onBack={() => history.push('/browse')} title={<Link to={{ pathname: "/browse" }} data-cy="back-button">Back</Link>} />
        </div>
        <div className={styles.header}>
          <div className={styles.heading}>
            {data && <DetailHeader document={data} contentType={contentType} uri={docUri} primaryKey={pkValue} />}
          </div>
          <div id='menu' className={styles.menu}>
            <Menu id='subMenu' onClick={(event) => handleClick(event)} mode="horizontal" selectedKeys={[selected]}>
              <Menu.Item key="instance" id='instance' data-cy="instance-view">
              <FontAwesomeIcon  icon={faThList} size="lg" /><span className={styles.subMenu}>Instance</span>
             </Menu.Item>
              <Menu.Item key="full" id='full' data-cy="source-view">
                <FontAwesomeIcon  icon={faCode} size="lg" />
                <span className={styles.subMenu}>Source</span>
             </Menu.Item>
            </Menu>
          </div>
        </div>

        <div>
          {
            isLoading || user.error.type === 'ALERT' ? <div style={{ marginTop: '40px' }}>
              <AsyncLoader />
            </div>
              :
              contentType === 'json' ?
                selected === 'instance' ? (data && <TableView document={data} contentType={contentType} location={location.state ? location.state['id']: {}} />) : (data && <JsonView document={data} />)
                :
                selected === 'instance' ? (data && <TableView document={data} contentType={contentType} location={location.state ? location.state['id']: {}}/>) : (data && <XmlView document={xml} />)
          }
        </div>
      </Content>
    </Layout>
  );
}

export default withRouter(Detail);