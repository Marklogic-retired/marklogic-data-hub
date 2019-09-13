import React, { useState, useEffect, useContext, Component } from 'react';
import axios from 'axios';
import { RouteComponentProps, Link } from 'react-router-dom';
import { AuthContext } from '../util/auth-context';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import DocumentHeader from '../components/detail-header/detail-header';
import { Layout, Menu, PageHeader, Spin } from 'antd';

import XmlView from '../components/xml-view/xml-view';

interface Props extends RouteComponentProps<any> { }

const Detail: React.FC<Props> = ({ history }) => {

  const { Content } = Layout;
  const { userNotAuthenticated } = useContext(AuthContext);
  const [selected, setSelected] = useState('instance');
  const [data, setData] = useState();
  const [query, setQuery] = useState(history.location.state.uri);
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState();

  let database = history.location.state.database;

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const result = await axios(
          `datahub/v2/search?docUri=${query}`,
        );

        setData(JSON.parse(result.data.content));
        const contentType = result.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          setContentType('json')
        } else if (contentType && contentType.indexOf("application/xml") !== -1) {
          setContentType('xml')
        }

        console.log('CONTENT IS ', contentType)

        setData(result.data);
        setIsLoading(false);
      } catch (error) {
        // console.log('error', error.response);
        if (error.response.status === 401) {
          userNotAuthenticated();
        }
      }
    };

    fetchData();
  }, []);

  const handleClick = (event) => {
    setSelected(event.key);
  }

  const getXmlObject = (xmlData) => {
    var parser = require('fast-xml-parser');
    var he = require('he');

    var options = {
      attributeNamePrefix : "@_",
      attrNodeName: "attr", //default is 'false'
      textNodeName : "#text",
      ignoreAttributes : true,
      ignoreNameSpace : false,
      allowBooleanAttributes : false,
      parseNodeValue : true,
      parseAttributeValue : false,
      trimValues: true,
      cdataTagName: "__cdata", //default is 'false'
      cdataPositionChar: "\\c",
      localeRange: "", //To support non english character in tag/attribute values.
      parseTrueNumberOnly: false,
      attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
      tagValueProcessor : a => he.decode(a) //default is a=>a
  };

    if( parser.validate(xmlData) === true) { 
    var jsonObj = parser.parse(xmlData,options);

    console.log(jsonObj);
    return jsonObj;
}
  }

  return (
    <Layout>
      <Content style={{ background: '#fff', padding: '18px 36px' }}>
        <div id='back-button'>
          <PageHeader style={{ padding: '0px', marginBottom: '20px' }} onBack={() => history.push('/browse')} title={<Link to={{ pathname: "/browse" }}>Back</Link>} />
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
            isLoading ? <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%' }} />
              :
              // selected === 'instance' ? (data && <TableView document={data} />) : (data && <JsonView document={data} />)
              // selected === 'instance' ? (data && <TableView document={data} />) : (data && <XmlView />)
              contentType === 'json' ?
                selected === 'instance' ? (data && <TableView document={data} />) : (data && <JsonView document={data} />)
                :
                selected === 'instance' ? (data && <TableView document={data} />) : (data && <XmlView document={data} />)
          }
        </div>
      </Content>
    </Layout>
  );
}

export default Detail as any;