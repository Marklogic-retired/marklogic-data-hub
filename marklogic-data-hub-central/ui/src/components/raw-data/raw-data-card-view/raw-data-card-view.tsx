import React, { CSSProperties, useContext, useState } from 'react';
import styles from './raw-data-card-view.module.scss';
import { Card, Icon, Popover, Row, Col } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthoritiesContext } from "../../../util/authorities";
import { MLTooltip } from '@marklogic/design-system';
import { getLastChars, formatCardUri } from '../../../util/conversionFunctions';
import sourceFormatOptions from '../../../config/formats.config';
import ReactHtmlParser from 'react-html-parser';
import { FileOutlined } from '@ant-design/icons';


const RawDataCardView = (props) => {
  const authorityService = useContext(AuthoritiesContext);

  const handleDetailViewNavigation = () => {
  }

  const displayDocumentMetadata = () => {
  }

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
    }
    return customStyles;
  }

  const displayUri = (uri) => {
    return formatCardUri(uri)
  }

  const displaySnippet = (item) => {
    if (['json', 'xml', 'text'].includes(item.format)) {
      let str = '';
      item.matches.forEach(item => {
        item['match-text'].forEach(element => {
          if (typeof element === 'object') {
            str = str.concat('<b>').concat(element.highlight).concat('</b>').concat('...')
          } else {
            str = str.concat(element)
          }
        });
      })
      return <p>{ReactHtmlParser(str)}</p>;
    } else if ('binary' === item.format) {
      return (
        <div className={styles.binaryCard} >
          <FileOutlined className={styles.binaryIcon} />
          <div className={styles.binaryText} data-testid={item.uri + '-noPreview'}> No preview available</div>
        </div>
      )
    }
  }

  return (
    <div id="raw-data-card" aria-label="raw-data-card" className={styles.rawDataCard}>
      <Row gutter={24} type="flex" >
        {props.data && props.data.length > 0 ? props.data.map((elem, index) => (
          <Col key={index}>
            <div>
              <Card
                className={styles.cardStyle}
                size="small"
              >
                <div className={styles.cardMetadataContainer}>
                  <span className={styles.uriContainer} data-testid={elem.uri + '-URI'}>URI: <span className={styles.uri}>
                    <MLTooltip title={elem.uri} placement="top">{displayUri(elem.uri)}</MLTooltip></span></span>
                  <span className={styles.cardIcons}>
                    <span className={styles.infoIcon} >
                    <MLTooltip title={"View info"} placement="top" 
                    ><span><Icon type="info-circle" theme="filled" data-testid={elem.uri + '-InfoIcon'} /></span>
                    </MLTooltip>
                    </span>
                    <span className={styles.sourceFormat}
                      style={sourceFormatStyle(elem.format)}
                      data-testid={elem.uri + '-sourceFormat'}
                    >{sourceFormatOptions[elem.format].label}</span>
                    <MLTooltip title={'Detail view'} placement="top"
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


}

export default RawDataCardView;
