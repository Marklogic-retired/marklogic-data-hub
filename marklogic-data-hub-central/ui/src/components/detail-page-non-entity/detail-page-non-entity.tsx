import React, { useState, useContext, useEffect } from 'react';
import { Layout, PageHeader, Menu, Icon } from 'antd';
import styles from './detail-page-non-entity.module.scss';
import { useHistory, useLocation } from 'react-router-dom';
import { MLTooltip, MLTable } from '@marklogic/design-system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faAngleDoubleLeft, faCode } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../util/user-context';
import AsyncLoader from '../async-loader/async-loader';
import TableView from '../table-view/table-view';
import JsonView from '../json-view/json-view';
import XmlView from '../xml-view/xml-view';
import { updateUserPreferences } from '../../services/user-preferences';

const DetailPageNonEntity = (props) => {
    const history: any = useHistory();
    const location: any = useLocation();
    const { user } = useContext(UserContext);
    const { Content, Sider } = Layout;
    const [selected, setSelected] = useState("");
    const [metadataCollapse, setMetadataCollapse] = useState(false);

    useEffect(() => {

        if(!props.isEntityInstance) {
          if(location.state && JSON.stringify(location.state) !== JSON.stringify({})) {
            location.state.hasOwnProperty('selectedValue') && location.state['selectedValue'] === 'instance' ?
            setSelected('instance') : setSelected('record');
          } else {
            if(location.state === undefined){
              location.state = {};
            }
            setSelected(props.detailPagePreferences['selected'] ? props.detailPagePreferences['selected'] : 'instance');
          }
        }
      }, []);

    const sourcesColumns = [
        {
            title: 'Source Name',
            dataIndex: 'sourceName',
            width: '50%',
            sorter: (a: any, b: any) => a.sourceName?.localeCompare(b.sourceName),
            render: text => text === 'none' ? <span className={styles.noneValue}>{text}</span> : <span className={styles.validValue}>{text}</span>
        },
        {
            title: 'Source Type',
            dataIndex: 'sourceType',
            width: '50%',
            sorter: (a: any, b: any) => a.sourceType?.localeCompare(b.sourceType),
            render: text => text === 'none' ? <span className={styles.noneValue}>{text}</span> : <span className={styles.validValue}>{text}</span>
        }
    ];

    const historyColumns = [
        {
          title: 'Time Stamp',
          dataIndex: 'timeStamp',
          width: '25%',
          sorter: (a: any, b: any) => a.timeStamp?.localeCompare(b.timeStamp),
          render: text => text === 'none' ? <span className={styles.noneValue}>{text}</span> : <span>{text}</span>
        },
        {
          title: 'Flow',
          dataIndex: 'flow',
          width: '25%',
          sorter: (a: any, b: any) => a.flow?.localeCompare(b.flow),
          render: text => text === 'none' ? <span className={styles.noneValue}>{text}</span> : <span>{text}</span>
        },
        {
          title: 'Step',
          dataIndex: 'step',
          width: '25%',
          sorter: (a: any, b: any) => a.step?.localeCompare(b.step),
          render: text => text === 'none' ? <span className={styles.noneValue}>{text}</span> : <span>{text}</span>
        },
        {
          title: 'User',
          dataIndex: 'user',
          width: '25%',
          sorter: (a: any, b: any) => a.user?.localeCompare(b.user),
          render: text => text === 'none' ? <span className={styles.noneValue}>{text}</span> : <span>{text}</span>
        }
      ]

    const handleMenuSelect = (event) => {
        setSelected(event.key);

        //Set the selected view property in user preferences.
        let preferencesObject = {
          ...props.detailPagePreferences,
          selected: event.key
        };
        updateUserPreferences(user.name, preferencesObject);
    }

    const onCollapse = () => {
        setMetadataCollapse(!metadataCollapse);
    };

    const contentElements = props.isLoading || user.error.type === 'ALERT' ? <div style={{ marginTop: '40px' }}>
        <AsyncLoader />
    </div>
        :
        props.contentType && props.contentType === 'json' ?
        selected === 'instance' ? (<TableView document={props.isEntityInstance ? props.entityInstance : props.data} contentType={props.contentType} location={location.state ? location.state['id'] : {}} isEntityInstance={props.isEntityInstance} />) : (props.data && <JsonView document={props.data} />)
        : props.contentType === 'xml' ?
          selected === 'instance' ? (<TableView document={props.isEntityInstance ? props.entityInstance : props.data} contentType={props.contentType} location={location.state ? location.state['id'] : {}} isEntityInstance={props.isEntityInstance} />) : (props.data && <XmlView document={props.xml} />)
        : <pre data-testid="text-container" className={styles.textContainer}>{props.data}</pre>

    const viewSelector = <div id='menu' className={styles.menu}>
        <Menu id='subMenu' onClick={(event) => handleMenuSelect(event)} mode="horizontal" selectedKeys={[selected]}>
            <Menu.Item key="instance" id='instance' data-testid="instance-view">
                <MLTooltip title={'Show the processed data'}>
                    <Icon type="file-search" className={styles.fileSearchIcon} />
                    <span className={styles.subMenu}>Instance</span>
                </MLTooltip>
            </Menu.Item>
            <Menu.Item key="record" id='record' data-testid="record-view">
                <MLTooltip title={'Show the complete record'} >
                    <FontAwesomeIcon icon={faCode} size="lg" />
                    <span className={styles.subMenu}>Record</span>
                </MLTooltip>
            </Menu.Item>
        </Menu>
    </div>

    const textViewSelector = <div id='menu' className={styles.menuText}>
    <Menu id='subMenu' mode="horizontal" selectedKeys={['record']}>
      <Menu.Item key="record" id='record' data-cy="source-view">
        <MLTooltip title={'Show the complete record'} >
          <FontAwesomeIcon icon={faCode} size="lg" />
          <span className={styles.subMenu}>Record</span>
        </MLTooltip>
      </Menu.Item>
    </Menu>
  </div>

  const nonEntityMenu = () => {
    if (props.contentType === 'json' || props.contentType === 'xml') {
      return viewSelector;
    } else if (props.contentType === 'text') {
      return textViewSelector;
    }
  }


    return (
        <div id='detailPageNonEntityContainer' className={styles.container}>
            <Layout>
                <Content className={styles.detailContentNonEntityInstance}>
                    <div className={styles.detailContentNonEntityHeader}>
                        <span id='back-button' className={styles.backButtonHeader} onClick={() => history.push(props.selectedSearchOptions)} >
                            <PageHeader
                                title={<span className={styles.title}>Back to results</span>}
                                data-tesid="back-button"
                                onBack={() => history.push(props.selectedSearchOptions)}
                            />
                        </span>
                        <span className={styles.metadataCollapseIconContainer}>
                            {metadataCollapse ? <span className={styles.metadataCollapseIcon}><span className={styles.collapseIconsAlignment} onClick={onCollapse} ><span><FontAwesomeIcon aria-label="collapsed" icon={faAngleDoubleLeft} size="lg" className={styles.collapseExpandIcons} data-testid="metadataIcon-collapsed"/></span>{' Metadata'}</span></span> :
                                <span className={styles.metadataCollapseIcon}><span className={styles.collapseIconsAlignment} onClick={onCollapse} ><span><FontAwesomeIcon aria-label="expanded" icon={faAngleDoubleRight} size="lg" className={styles.collapseExpandIcons} data-testid="metadataIcon-expanded"/></span>{' Metadata'}</span></span>}
                        </span>
                    </div>
                    <div>{nonEntityMenu()}</div>
                    <div className={styles.documentContainer}>
                        <div className={styles.contentElements}>{contentElements}</div>
                    </div>
                </Content>

                <Sider
                    trigger={null}
                    collapsedWidth={0}
                    collapsible
                    collapsed={metadataCollapse}
                    width={'45vw'}
                    data-testid="sider-nonEntityDetailPage"
                    className={styles.siderParent}
                >

                    <div className={styles.siderContainerNonEntity}>
                        <div>URI: <span className={styles.uri} data-testid="non-entity-document-uri">{props.uri}</span></div>
                        <div className={styles.sourcesMetadataTableContainer}>
                            <div className={styles.metadataTableLabel} data-testid="non-entity-sources-label">Sources</div>
                            <MLTable
                                bordered
                                className={styles.sourcesMetadataTable}
                                rowKey="key"
                                dataSource={props.sourcesTableData}
                                columns={sourcesColumns}
                                pagination={false}
                                data-testid="sources-table"
                            />
                        </div>
                        <div className={styles.historyMetadataTableContainer}>
                            <div className={styles.metadataTableLabel} data-testid="non-entity-history-label">History</div>
                            <MLTable
                                bordered
                                className={styles.historyMetadataTable}
                                rowKey="key"
                                dataSource={props.historyData}
                                columns={historyColumns}
                                pagination={false}
                                data-testid="history-table"
                            />
                        </div>
                    </div>

                </Sider>
            </Layout>
        </div>
    );
};

export default DetailPageNonEntity;