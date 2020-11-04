import React, { CSSProperties, useContext, useEffect } from 'react';
import styles from './record-view.module.scss';
import { Card, Icon, Row, Col, Popover } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthoritiesContext } from "../../util/authorities";
import { formatCardUri } from '../../util/conversionFunctions';
import sourceFormatOptions from '../../config/formats.config';
import ReactHtmlParser from 'react-html-parser';
import { FileOutlined } from '@ant-design/icons';
import { OverflowTooltip } from '../overflow-tooltip/overflow-tooltip';
import { MLTooltip, MLPopover } from '@marklogic/design-system';
import { CardViewDateConverter } from '../../util/date-conversion';
import { Link } from 'react-router-dom';
import { SearchContext } from '../../util/search-context';

const RecordCardView = (props) => {
  const authorityService = useContext(AuthoritiesContext);
  const {
    searchOptions
} = useContext(SearchContext);

  const handleDetailViewNavigation = () => {
  };

  // Custom CSS for source Format
  const sourceFormatStyle = (sourceFmt) => {
    let customStyles: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '20px',
      width: '20px',
      lineHeight: '20px',
      backgroundColor: sourceFormatOptions[sourceFmt].color,
      fontSize: sourceFmt === 'json' ? '8px' : '8.5px',
      borderRadius: '50%',
      textAlign: 'center',
      color: '#ffffff',
      verticalAlign: 'middle',
      marginRight: '8px'
    };
    return customStyles;
  };

  const displayUri = (uri) => {
    return formatCardUri(uri);
  };

  const displaySnippet = (item) => {
    if (['json', 'xml', 'text'].includes(item.format)) {
      let str = '';
      item.matches.forEach(item => {
        item['match-text'].forEach(element => {
          if (typeof element === 'object') {
            str = str.concat('<b>').concat(element.highlight).concat('</b>').concat('...');
          } else {
            str = str.concat(element);
          }
        });
      });
      return <p>{ReactHtmlParser(str)}</p>;
    } else if ('binary' === item.format) {
      return (
        <div className={styles.binaryCard} >
          <FileOutlined className={styles.binaryIcon} />
          <div className={styles.binaryText} data-testid={item.uri + '-noPreview'}> No preview available</div>
        </div>
      );
    }
  };

  const displayRecordSources = (item) => {
    let sources = item.hubMetadata?.sources.map((record) => {
      return record.name;
    }).join(", ");
    return sources;
  };

  const emptyField = (
    <p className={styles.textDisabled}>none</p>
  );

  const displayRecordMetadata = (item) => {
    return (
      <div className={styles.popover} data-testid={item.uri + '-popover'}>
        <div className={styles.colKey}>
          <p>Source:</p>
          <p>Flow:</p>
          <p>Step:</p>
          <p>Created On:</p>
        </div>
        <div className={styles.colValue}>
          {item.hubMetadata?.sources?.length > 0 ? <span className={styles.valText} data-testid={item.uri + '-sources'}>
            <OverflowTooltip title={displayRecordSources(item)} placement={"bottom"} content={displayRecordSources(item).substring(0, 28)} width={"200px"} />
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedByFlow ? <span className={styles.valText} data-testid={item.uri + '-lastProcessedByFlow'}>
            <OverflowTooltip title={item.hubMetadata?.lastProcessedByFlow} placement={"bottom"} content={item.hubMetadata?.lastProcessedByFlow} width={"200px"} />
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedByStep ? <span className={styles.valText} data-testid={item.uri + '-lastProcessedByStep'}>
            <OverflowTooltip title={item.hubMetadata.lastProcessedByStep} placement={"bottom"} content={item.hubMetadata.lastProcessedByStep} width={"200px"} />
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedDateTime ? <span className={styles.valText} data-testid={item.uri + '-lastProcessedDateTime'}>
            {CardViewDateConverter(item.hubMetadata?.lastProcessedDateTime)}
          </span> : emptyField}
        </div>
      </div>
    );
  };

  const getLinkProperties = (elem) => {
    let sources = elem.hubMetadata && elem.hubMetadata.hasOwnProperty('sources') ? elem.hubMetadata['sources'] : [];
    
    let linkObject = {
      pathname: '/tiles/explore/detail', state: {
          selectedValue: 'instance',
          entity: searchOptions.entityTypeIds,
          pageNumber: searchOptions.pageNumber,
          start: searchOptions.start,
          searchFacets: searchOptions.selectedFacets,
          query: searchOptions.query,
          tableView: props.tableView,
          sortOrder: searchOptions.sortOrder,
          sources: sources,
          primaryKey: elem.primaryKey?.propertyPath === 'uri' ? '' : elem.primaryKey?.propertyValue,
          uri: elem.uri,
          entityInstance: elem.entityInstance ? elem.entityInstance : undefined,
          database: searchOptions.database,
          isEntityInstance: false,
          targetDatabase: searchOptions.database
      }
    }

    return linkObject;
  }

  return (
    <div id="record-data-card" aria-label="record-data-card" className={styles.recordDataCard}>
      <Row gutter={24} type="flex" >
        {props.data && props.data.length > 0 ? props.data.map((elem, index) => (
          <Col key={index}>
            <div >
              <Card
                className={styles.cardStyle}
                size="small"
              >
                <div className={styles.cardMetadataContainer}>
                  <span className={styles.uriContainer} data-testid={elem.uri + '-URI'}>URI: <span className={styles.uri}>
                    <MLTooltip title={elem.uri} placement="bottom">{displayUri(elem.uri)}</MLTooltip></span></span>
                  <span className={styles.cardIcons}>
                    <MLPopover getPopupContainer={trigger => trigger.parentElement} content={displayRecordMetadata(elem)} placement="bottomRight" trigger="click">
                      <span>
                        <MLTooltip title={"View info"} placement="bottom">
                          <span className={styles.infoIcon}><Icon type="info-circle" theme="filled" data-testid={elem.uri + '-InfoIcon'} /></span>
                        </MLTooltip>
                      </span>
                    </MLPopover>
                    <span className={styles.sourceFormat}
                      style={sourceFormatStyle(elem.format)} 
                      data-testid={elem.uri + '-sourceFormat'}
                    >{sourceFormatOptions[elem.format].label}</span>
                    {elem.format === 'binary' ? 
                      <span id={'instance'}
                        data-cy='instance'>
                        <MLTooltip title={'Detail view'} placement="bottom"
                        ><i role="detail-link icon" data-testid={elem.uri + '-detailViewIcon'}><FontAwesomeIcon icon={faExternalLinkAlt} className={styles.detailLinkIconDisabled} size="lg" /></i>
                        </MLTooltip>
                      </span>
                    :
                      <Link to={getLinkProperties(elem)} id={'instance'}
                        data-cy='instance'>
                        <MLTooltip title={'Detail view'} placement="bottom"
                        ><i role="detail-link icon" data-testid={elem.uri + '-detailViewIcon'}><FontAwesomeIcon icon={faExternalLinkAlt} className={styles.detailLinkIcon} size="lg" /></i>
                        </MLTooltip>
                      </Link>
                    }
                  </span>
                </div>
                <div className={styles.snippetContainer} data-testid={elem.uri + '-snippet'} >
                  {displaySnippet(elem)}
                </div>
              </Card>
            </div>
          </Col>)) : <span></span>}
      </Row>
    </div>
  );
};

export default RecordCardView;