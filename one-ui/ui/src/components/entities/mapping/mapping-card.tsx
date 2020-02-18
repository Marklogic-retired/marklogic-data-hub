import React, { CSSProperties, useState } from 'react';
import styles from './mapping-card.module.scss';
import {Card, Icon, Tooltip, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../../config/formats.config';
import { convertDateFromISO } from '../../../util/conversionFunctions';
import CreateEditMappingDialog from './create-edit-mapping-dialog/create-edit-mapping-dialog';
import SourceToEntityMap from './source-entity-map/source-to-entity-map';

interface Props {
    data: any;
    entityName: any;
    deleteMappingArtifact: any;
    createMappingArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
  }

const MappingCard: React.FC<Props> = (props) => {
    const [newMap, setNewMap] = useState(false);
    const [title, setTitle] = useState('');
    const [mapData, setMapData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [mappingVisible, setMappingVisible] = useState(false);

    //const [openLoadDataSettings, setOpenLoadDataSettings] = useState(false);


    const OpenAddNewDialog = () => {
        setTitle('New Mapping');
        setNewMap(true);
    }

    const OpenEditStepDialog = (index) => {
        setTitle('Edit Mapping');
        setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        setNewMap(true);
    }

    const OpenMappingSettingsDialog = (index) => {
        // setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        // //openLoadDataSettings = true;
        // setOpenLoadDataSettings(true);
        console.log('Open settings')
    }

    //Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties = {
            float: 'right',
            backgroundColor: (sourceFmt.toUpperCase() === 'XML' ? sourceFormatOptions.xml.color : (sourceFmt.toUpperCase() === 'JSON' ? sourceFormatOptions.json.color : (sourceFmt.toUpperCase() === 'CSV' ? sourceFormatOptions.csv.color : sourceFormatOptions.default.color))),
            fontSize: '12px',
            borderRadius: '50%',
            textAlign: 'left',
            color: '#ffffff',
            padding: '5px'
        }
        return customStyles;
    }

    //Truncate a string (Step Name) to desired no. of characters
    const getInitialChars = (str, num, suffix) => {
        suffix = suffix ? suffix : '...';
        let result = str;
        if (typeof str === 'string' && str.length > num) {
            result = str.substr(0, num) + suffix;
        }
        return result;
    }

    const extractCollectionFromSrcQuery = (query) => {

        let srcCollection = query.substring(
            query.lastIndexOf("[") + 2, 
            query.lastIndexOf("]") - 1
        );
        return getInitialChars(srcCollection,30,'...');
    }

    const handleCardDelete = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
      }

      const onOk = (name) => {
        props.deleteMappingArtifact(name)
        setDialogVisible(false);
      }

      const onCancel = () => {
        setDialogVisible(false);
      }  

    const deleteConfirmation = <Modal
        visible={dialogVisible}
        okText='Yes'
        cancelText='No'
        onOk={() => onOk(loadArtifactName)}
        onCancel={() => onCancel()}
        width={350}
        maskClosable={false}
        >
        <span style={{fontSize: '16px'}}>Are you sure you want to delete this?</span>
        </Modal>;
    
    // const SourceToEntityMap = <Modal
    //     visible={mappingVisible}
    //     okText='Yes'
    //     cancelText='No'
    //     onOk={() => setMappingVisible(false)}
    //     onCancel={() => setMappingVisible(false)}
    //     width={600}
    //     maskClosable={false}
    //     >
    //     <span style={{fontSize: '16px'}}>This is just a sample dialog for mapping</span>
    //     </Modal>;
    
    const openSourceToEntityMapping = () => {
            setMappingVisible(true);
    }

    const cardContainer: CSSProperties = {
        cursor: 'pointer',width: '330px',margin:'-12px -12px', padding: '5px 5px'
    }

    return (
        <div className={styles.loaddataContainer}>
            <Row gutter={16} type="flex" >
                {props.canReadWrite ? <Col >
                    <Card
                        size="small"
                        className={styles.addNewCard}>
                        <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNewDialog}/></div>
                        <br />
                        <p className={styles.addNewContent}>Add New</p>
                    </Card>
                </Col> : ''}{props && props.data.length > 0 ? props.data.map((elem,index) => (
                    <Col key={index}><Card
                        actions={[
                            <span></span>,
                            <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" onClick={() => OpenMappingSettingsDialog(index)}/></Tooltip>,
                            <Tooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" onClick={() => OpenEditStepDialog(index)}/></Tooltip>,
                            props.canReadWrite ? <Tooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" onClick={() => handleCardDelete(elem.name)}/></i></Tooltip> : <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>,
                        ]}
                        className={styles.cardStyle}
                        size="small"
                    >
                        <div style={cardContainer} onClick={openSourceToEntityMapping}>
                        <div className={styles.formatFileContainer}>
                            <span className={styles.mapNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>
                            {/* <span style={sourceFormatStyle(elem.sourceFormat)}>{elem.sourceFormat.toUpperCase()}</span> */}
                            
                        </div><br />
                        {elem.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery,32,'...')}</div>}
                        <br /><br />
                        <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                        </div>
                    </Card></Col>
                )) : <span></span> }</Row>
                <CreateEditMappingDialog 
                newMap={newMap} 
                title={title} 
                setNewMap={setNewMap}
                targetEntity={props.entityName}
                createMappingArtifact={props.createMappingArtifact}
                deleteMappingArtifact={props.deleteMappingArtifact}  
                mapData={mapData}
                canReadWrite={props.canReadWrite}
                canReadOnly={props.canReadOnly}/>
                {deleteConfirmation}
                <SourceToEntityMap 
                mappingVisible={mappingVisible}
                setMappingVisible={setMappingVisible}/>
                
        </div>
    );

}

export default MappingCard;