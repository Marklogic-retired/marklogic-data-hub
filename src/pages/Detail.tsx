import React, { useState, useEffect, useContext, Component } from 'react';
import axios from 'axios';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { AuthContext } from '../util/auth-context';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import DocumentHeader from '../components/detail-header/detail-header';
import { Layout, Menu, PageHeader, Spin } from 'antd';

import XmlView from '../components/xml-view/xml-view';

interface Props extends RouteComponentProps<any> { }

const Detail: React.FC<Props> = ({ history, location }) => {

  const { Content } = Layout;
  const { userNotAuthenticated } = useContext(AuthContext);
  const [selected, setSelected] = useState('instance');
  const [data, setData] = useState();
  const [query, setQuery] = useState(location.state.uri);
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState();
  const [xml, setXml] = useState();

  let database = location.state.database;

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const result = await axios(
          `datahub/v2/search?docUri=${query}`,
        );

        const content = result.headers['content-type'];

        if (content.indexOf("application/json") !== -1) {
          setContentType('json');
          setData(JSON.parse(result.data.content));
        } else if (content.indexOf("application/xml") !== -1) {
          setContentType('xml');
          let decodedXml = decodeXml(result.data);
          setData(convertXmlToJson(decodedXml));
          setXml(decodeXml(decodedXml));
        }

        setIsLoading(false);

      } catch (error) {
        console.log('error', error.response);
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

  const convertXmlToJson = (xmlData) => {
    var parser = require('fast-xml-parser');
    var options = {
      attributeNamePrefix: "",
      attrNodeName: false, //default is 'false'
      textNodeName: "#text",
      ignoreAttributes: true,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: false,
      trimValues: true,
      cdataTagName: "__cdata", //default is 'false'
      cdataPositionChar: "\\c",
      localeRange: "", //To support non english character in tag/attribute values.
      parseTrueNumberOnly: false
    };

    if (parser.validate(xmlData) === true) {
      return parser.parse(xmlData, options).Document;
    }
  }

  const decodeXml = (xml) => {
    var he = require('he');
    return he.decode(xml);
  }

  return (
    <Layout>
      <Content style={{ background: '#fff', padding: '18px 36px' }}>
        <div id='back-button'>
          <PageHeader style={{ padding: '0px', marginBottom: '20px' }} onBack={() => history.push('/browse')} title={<Link to={{ pathname: "/browse" }}>Back</Link>} />
        </div>
        <div className={styles.header}>
          <div className={styles.heading}>
            {data && <DocumentHeader document={data} contentType={contentType} />}
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