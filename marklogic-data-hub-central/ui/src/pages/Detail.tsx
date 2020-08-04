import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { UserContext } from '../util/user-context';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import DetailHeader from '../components/detail-header/detail-header';
import AsyncLoader from '../components/async-loader/async-loader';
import {Layout, Menu, PageHeader} from 'antd';
import XmlView from '../components/xml-view/xml-view';
import { xmlParser, xmlDecoder } from '../util/xml-parser';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThList, faCode} from "@fortawesome/free-solid-svg-icons";
import { MLTooltip } from '@marklogic/design-system';
import { getUserPreferences } from '../services/user-preferences';


interface Props extends RouteComponentProps<any> { }

const { Content } = Layout;

const Detail: React.FC<Props> = ({ history, location }) => {

  const { user, handleError } = useContext(UserContext);
  const uriSplit = location.pathname.replace('/tiles/explore/detail/', '');
  const pkValue = uriSplit.split('/')[0] === '-' ? '' : decodeURIComponent(uriSplit.split('/')[0]);
  const uri = decodeURIComponent(uriSplit.split('/')[1]).replace(/ /g, "%2520");
  const docUri = uri.replace(/%25/g, "%");
  const [selected, setSelected] = useState();
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("");
  const [xml, setXml] = useState();
  const [isEntityInstance, setIsEntityInstance] = useState(false);
  const [parentPagePreferences, setParentPagePreferences] = useState({});

  const componentIsMounted = useRef(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const result = await axios(`/api/entitySearch?docUri=${uri}`);
        if (!result.data) {
          history.push('/error');
        }

        if (componentIsMounted.current) {
          const content = result.headers['content-type'];

          // TODO handle exception if document type is json -> XML
          if (content.indexOf("application/json") !== -1) {
            setContentType('json');
            setData(result.data.content);
            setEntityInstanceFlag(result.data.content);
          } else if (content.indexOf("application/xml") !== -1) {
            setContentType('xml');
            let decodedXml = xmlDecoder(result.data);
            let document = xmlParser(decodedXml).Document;
            setData(document);
            setXml(xmlDecoder(decodedXml));
            setEntityInstanceFlag(document.content);
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


  useEffect(() => {
    if(location.state && JSON.stringify(location.state) !== JSON.stringify({})) {
      location.state.hasOwnProperty('selectedValue') && location.state['selectedValue'] === 'source' ?
      setSelected('full') : setSelected('instance');
    } else {
      if(location.state === undefined){
        location.state = {};
      }
      setSelected('instance');
      handleUserPreferences();
    }
    
  }, []);

  //Apply user preferences on each page render
  const handleUserPreferences = () => {
    let currentPref = getUserPreferences(user.name);
      if (currentPref !== null) {
        let currPref = JSON.parse(currentPref);
        let userPref:any = {
          zeroState: false,
          entity: currPref.query['entityTypeIds'] ? currPref.query['entityTypeIds'] : '',
          pageNumber: currPref['pageNumber'] ? currPref['pageNumber'] : 1,
          start: currPref['start'] ? currPref['start'] : 1,
          searchFacets: currPref.query['selectedFacets'] ? currPref.query['selectedFacets'] : {},
          query: currPref.query['searchText'] ? currPref.query['searchText']: '',
          tableView: currPref.hasOwnProperty('tableView') ? currPref['tableView'] : true,
          sortOrder: currPref['sortOrder'] ? currPref['sortOrder'] : []
         }
         setParentPagePreferences({...userPref})
      }
  }

  const setEntityInstanceFlag = (content) => {
    let instance = content.envelope.instance;
    setIsEntityInstance(instance.info ? true : (Object.keys(instance).length > 1 ? false : true));
  }

  const handleClick = (event) => {
    setSelected(event.key);
  }

  const selectedSearchOptions = {
      pathname: "/tiles/explore",
      state: {
         zeroState: false,
         entity: location.state && location.state.hasOwnProperty('entity') ? location.state['entity'] : parentPagePreferences['entity'],
         pageNumber: location.state && location.state.hasOwnProperty('pageNumber') ? location.state['pageNumber'] : parentPagePreferences['pageNumber'],
         start: location.state && location.state.hasOwnProperty('start')? location.state['start'] : parentPagePreferences['start'],
         searchFacets: location.state && location.state.hasOwnProperty('searchFacets') ? location.state['searchFacets'] : parentPagePreferences['searchFacets'],
         query: location.state && location.state.hasOwnProperty('query')? location.state['query'] : parentPagePreferences['query'],
         tableView: location.state && location.state.hasOwnProperty('tableView') ? location.state['tableView'] : parentPagePreferences['tableView'],
         sortOrder: location.state && location.state.hasOwnProperty('sortOrder') ? location.state['sortOrder'] : parentPagePreferences['sortOrder']
        }
   }

  return (
    <Layout>
      <Content className={styles.detailContent}>
        <div id='back-button' style={{ marginLeft: '-23px' }}  onClick={() => history.push(selectedSearchOptions)}>
         <PageHeader
              title={<span className={styles.title}>Back</span>}
              data-cy="back-button"
              onBack={() => history.push(selectedSearchOptions)}
          />
        </div>
        <div className={styles.header}>
          <div className={styles.heading}>
            {data && <DetailHeader document={data} contentType={contentType} uri={docUri} primaryKey={pkValue} />}
          </div>
          <div id='menu' className={styles.menu}>
            <Menu id='subMenu' onClick={(event) => handleClick(event)} mode="horizontal" selectedKeys={[selected]}>
              <Menu.Item key="instance" id='instance' data-cy="instance-view">
                <MLTooltip title={'Show the processed data'}>
                  <FontAwesomeIcon  icon={faThList} size="lg" />
                  <span className={styles.subMenu}>Instance</span>
                </MLTooltip>
              </Menu.Item>
              <Menu.Item key="full" id='full' data-cy="source-view">
                <MLTooltip title={'Show the complete ' + contentType.toUpperCase()} >
                  <FontAwesomeIcon  icon={faCode} size="lg" />
                  <span className={styles.subMenu}>{contentType.toUpperCase()}</span>
                </MLTooltip>
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
                selected === 'instance' ? (data && <TableView document={isEntityInstance ? data : {}} contentType={contentType} location={location.state ? location.state['id']: {}} />) : (data && <JsonView document={data} />)
                :
                selected === 'instance' ? (data && <TableView document={isEntityInstance ? data : {}} contentType={contentType} location={location.state ? location.state['id']: {}}/>) : (data  && <XmlView document={xml} />)
          }
        </div>
      </Content>
    </Layout>
  );
}

export default withRouter(Detail);
