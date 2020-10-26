import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { RouteComponentProps, withRouter } from 'react-router-dom';
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
import { getUserPreferences, updateUserPreferences } from '../services/user-preferences';


interface Props extends RouteComponentProps<any> { }

const { Content } = Layout;

const Detail: React.FC<Props> = ({ history, location }) => {

  const { user, handleError } = useContext(UserContext);
  const [parentPagePreferences, setParentPagePreferences] = useState({});
  const getPreferences = () => {
    let currentPref = getUserPreferences(user.name);
    if (currentPref !== null) {
      return JSON.parse(currentPref);
    }
    return currentPref;
  }
  
  const detailPagePreferences = getPreferences(); //Fetching preferences first to be used later everywhere in the component
  const uri = location.state && location.state["uri"] ? location.state["uri"]: detailPagePreferences["uri"];
  const database = location.state && location.state["database"] ? location.state["database"]: detailPagePreferences["database"];
  const pkValue = location.state && location.state["primaryKey"] ? location.state["primaryKey"] : detailPagePreferences["primaryKey"];
  const entityInstance = location.state && location.state['entityInstance'] ? location.state['entityInstance'] : detailPagePreferences["entityInstance"];
  const [selected, setSelected] = useState();
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("");
  const [xml, setXml] = useState();
  const [isEntityInstance, setIsEntityInstance] = useState(false);
  const sources = location && location.state && location.state['sources'] ? location.state['sources'] : [];

  const componentIsMounted = useRef(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      // When Detail URI is undefined, redirect to Explore
      if (!uri) {
        history.push('/tiles/explore');
        return;
      }
      try {
        const result = await axios(`/api/entitySearch?docUri=${uri}&database=${database}`);
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

    updateDetailPagePreferences();

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
      setSelected(detailPagePreferences['selected'] ? detailPagePreferences['selected'] : 'instance');
      handleUserPreferences();
    }
  }, []);

  //Apply user preferences on each page render
  const handleUserPreferences = () => {
    let userPref: any = {
      zeroState: false,
      entity: detailPagePreferences.query['entityTypeIds'] ? detailPagePreferences.query['entityTypeIds'] : '',
      pageNumber: detailPagePreferences['pageNumber'] ? detailPagePreferences['pageNumber'] : 1,
      start: detailPagePreferences['start'] ? detailPagePreferences['start'] : 1,
      searchFacets: detailPagePreferences.query['selectedFacets'] ? detailPagePreferences.query['selectedFacets'] : {},
      query: detailPagePreferences.query['searchText'] ? detailPagePreferences.query['searchText'] : '',
      tableView: detailPagePreferences.hasOwnProperty('tableView') ? detailPagePreferences['tableView'] : true,
      sortOrder: detailPagePreferences['sortOrder'] ? detailPagePreferences['sortOrder'] : [],
      sources: detailPagePreferences['sources'] ? detailPagePreferences['sources'] : [],
      primaryKey: detailPagePreferences['primaryKey'] ? detailPagePreferences['primaryKey'] : '',
      uri: detailPagePreferences['uri'] ? detailPagePreferences['uri'] : ''
    }
    setParentPagePreferences({ ...userPref })
  }

  const updateDetailPagePreferences = () => {
    if (location.state && (location.state.hasOwnProperty("sources") || location.state.hasOwnProperty("uri") || location.state.hasOwnProperty("primaryKey") || location.state.hasOwnProperty("entityInstance"))) {
      let sources: any = [];
      let primaryKey: any = '';
      let uri: any = '';
      let entityInstance: any = {};
      if (location.state["sources"] && location.state["sources"].length) {
        sources = location.state["sources"];
      }
      if (location.state["primaryKey"]) {
        primaryKey = location.state["primaryKey"];
      }
      if (location.state["uri"] && location.state["uri"].length) {
        uri = location.state["uri"];
      }
      if (location.state["entityInstance"] && Object.keys(location.state["entityInstance"]).length) {
        entityInstance = location.state["entityInstance"];
      }
      let preferencesObject = {
        ...detailPagePreferences,
        sources: sources,
        primaryKey: primaryKey,
        uri: uri,
        selected: location.state['selectedValue'] && location.state['selectedValue'] === 'source' ? 'full' : 'instance',
        entityInstance: entityInstance
      }
      updateUserPreferences(user.name, preferencesObject);
    }
  }

  const setEntityInstanceFlag = (content) => {
    let instance = {};
    let info = {};
    if(content.envelope && content.envelope.instance) {
      instance = content.envelope.instance;
      info = instance["info"] ? instance["info"] : info;
    }
    setIsEntityInstance(info ? true : (Object.keys(instance).length > 1 ? false : true));
  }

  const handleClick = (event) => {
    setSelected(event.key);

    //Set the selected view property in user preferences.
    let preferencesObject = {
      ...detailPagePreferences,
      selected: event.key
    };
    updateUserPreferences(user.name, preferencesObject);
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
         sortOrder: location.state && location.state.hasOwnProperty('sortOrder') ? location.state['sortOrder'] : parentPagePreferences['sortOrder'],
         sources: location.state && location.state.hasOwnProperty('sources') ? location.state['sources'] : parentPagePreferences['sources']
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
            {data && <DetailHeader document={data} contentType={contentType} uri={uri} primaryKey={pkValue} sources={sources.length ? sources : parentPagePreferences['sources']} />}
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
                selected === 'instance' ? (entityInstance && <TableView document={isEntityInstance ? entityInstance : {}} contentType={contentType} location={location.state ? location.state['id']: {}} />) : (data && <JsonView document={data} />)
                :
                selected === 'instance' ? (entityInstance && <TableView document={isEntityInstance ? entityInstance : {}} contentType={contentType} location={location.state ? location.state['id']: {}}/>) : (data  && <XmlView document={xml} />)
          }
        </div>
      </Content>
    </Layout>
  );
}

export default withRouter(Detail);
