import React, { CSSProperties, useContext } from 'react';
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

const RecordCardView = (props) => {
  const authorityService = useContext(AuthoritiesContext);

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
                    <MLTooltip title={'Detail view'} placement="bottom"
                    ><i role="detail-link icon" data-testid={elem.uri + '-detailViewIcon'}><FontAwesomeIcon icon={faExternalLinkAlt} className={elem.format === 'binary' ? styles.detailLinkIconDisabled : styles.detailLinkIcon} size="lg" /></i>
                    </MLTooltip>
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