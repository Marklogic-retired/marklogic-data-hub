import React, { CSSProperties, useContext, useState, useEffect } from 'react';
import styles from './raw-data-card-view.module.scss';
import { Card, Icon, Popover, Row, Col } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthoritiesContext } from "../../../util/authorities";
import { MLTooltip } from '@marklogic/design-system';
import { getLastChars } from '../../../util/conversionFunctions';
import sourceFormatOptions from '../../../config/formats.config';


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
        return getLastChars(uri, 20, '...');
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
                                    <span className={styles.uriContainer} data-testid={elem.uri + '-URI'}>URI: <span className={styles.uri}>{displayUri(elem.uri)}</span></span>
                                    <span className={styles.cardIcons}>
                                        <span><Icon type="info-circle" className={styles.infoIcon} theme="filled" data-testid={elem.uri + '-InfoIcon'} /></span>
                                        <span className={styles.sourceFormat}
                                            style={sourceFormatStyle(elem.format)}
                                            data-testid={elem.uri + '-sourceFormat'}
                                        >{sourceFormatOptions[elem.format].label}</span>
                                        <MLTooltip title={'Show the raw source data'} placement="top"
                                        ><i role="detail-link icon" data-testid={elem.uri + '-detailViewIcon'}><FontAwesomeIcon icon={faExternalLinkAlt} className={styles.detailLinkIcon} size="lg" /></i>
                                        </MLTooltip>
                                    </span>
                                </div>
                            </Card>
                        </div>
                    </Col>)) : <span></span>}
            </Row>
        </div>
    );

}

export default RawDataCardView;
