import React, { useState } from 'react';
import styles from './custom-card.module.scss';
import {Card, Icon, Row, Col } from 'antd';
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from '../../../util/conversionFunctions';
import AdvancedSettingsDialog from "../../advanced-settings/advanced-settings-dialog";
import {AdvCustomTooltips} from '../../../config/tooltips.config';
import ViewCustomDialog from "./view-custom-dialog/view-custom-dialog";
import { MLTooltip } from '@marklogic/design-system';


interface Props {
    data: any;
    canReadOnly: boolean,
    canReadWrite: boolean
}

const CustomCard: React.FC<Props> = (props) => {
    const activityType = 'custom';
    const [openCustomSettings, setOpenCustomSettings] = useState(false);
    const [customData, setCustomData] = useState({});
    const [viewCustom, setViewCustom] = useState(false);

    const OpenCustomDialog = (index) => {
        setViewCustom(true);
        setCustomData(prevState => ({ ...prevState, ...props.data[index]}));
    };

    const OpenCustomSettingsDialog = (index) => {
        setCustomData(prevState => ({ ...prevState, ...props.data[index]}));
        setOpenCustomSettings(true);
    };

    return (
        <div className={styles.customContainer}>
            <Row gutter={16} type="flex" >
                {props && props.data.length > 0 ? props.data.map((elem,index) => (

                <Col key={index}>
                    <Card
                        actions={[
                            <span></span>,
                            <span></span>,
                            <MLTooltip title={AdvCustomTooltips.settings} placement="bottom"><Icon type="setting" key="setting" role="settings-custom button" data-testid={elem.name+'-settings'} onClick={() => OpenCustomSettingsDialog(index)}/></MLTooltip>,
                            <MLTooltip title={AdvCustomTooltips.viewCustom} placement="bottom"><Icon type="edit" key="edit" role="edit-custom button" data-testid={elem.name+'-edit'} onClick={() => OpenCustomDialog(index)}/></MLTooltip>,

                        ]}
                        className={styles.cardStyle}
                        size="small"
                    >
                    <div className={styles.formatFileContainer}>
                        <span className={styles.customNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>
                    </div>
                    <br />
                    {elem.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery,32,'...')}</div>}
                    <br /><br />
                    <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                    </Card>
                </Col>
            )) : <span></span> }</Row>
            <ViewCustomDialog
                viewCustom={viewCustom}
                setViewCustom={setViewCustom}
                customData={customData}
                canReadWrite={props.canReadWrite}/>
            <AdvancedSettingsDialog
                tooltipsData={AdvCustomTooltips}
                openAdvancedSettings={openCustomSettings}
                setOpenAdvancedSettings={setOpenCustomSettings}
                stepData={customData}
                activityType={activityType}
                canWrite={props.canReadWrite}
            />
        </div>
    );
};

export default CustomCard;
