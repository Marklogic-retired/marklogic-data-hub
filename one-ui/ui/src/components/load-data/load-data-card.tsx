import React, { CSSProperties, useState } from 'react';
import styles from './load-data-card.module.scss';
import {Card, Icon, Tooltip, Popover, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../config/formats.config';
import NewDataLoadDialog from './new-data-load-dialog/new-data-load-dialog';
import { convertDateFromISO } from '../../util/conversionFunctions';
import LoadDataSettingsDialog from './load-data-settings/load-data-settings-dialog';
import { ContextMenu, ContextMenuTrigger, MenuItem, SubMenu } from "react-contextmenu";

interface Props {
    data: any;
    flows: any;
    deleteLoadDataArtifact: any;
    createLoadDataArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
    addStepToFlow: any;
    addStepToNew: any;
}

const MENU_TYPE = 'contextMenu';

const LoadDataCard: React.FC<Props> = (props) => {
    const [newDataLoad, setNewDataLoad] = useState(false);
    const [title, setTitle] = useState('');
    const [stepData, setStepData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [flowName, setFlowName] = useState('');

    const [openLoadDataSettings, setOpenLoadDataSettings] = useState(false);

    const OpenAddNewDialog = () => {
        setTitle('New Data Load');
        setNewDataLoad(true);
    }

    const OpenEditStepDialog = (index) => {
        setTitle('Edit Data Load');
        setStepData(prevState => ({ ...prevState, ...props.data[index]}));
        setNewDataLoad(true);
    }

    const OpenLoadDataSettingsDialog = (index) => {
        setStepData(prevState => ({ ...prevState, ...props.data[index]}));
        //openLoadDataSettings = true;
        setOpenLoadDataSettings(true);
        console.log('Open settings', openLoadDataSettings)
    }

    // Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties = {
            float: 'left',
            backgroundColor: (sourceFmt.toUpperCase() === 'XML' ? sourceFormatOptions.xml.color : (sourceFmt.toUpperCase() === 'JSON' ? sourceFormatOptions.json.color : (sourceFmt.toUpperCase() === 'CSV' ? sourceFormatOptions.csv.color : sourceFormatOptions.default.color))),
            fontSize: '12px',
            borderRadius: '50%',
            textAlign: 'left',
            color: '#ffffff',
            padding: '5px'
        }
        return customStyles;
    }

    // Truncate a string (Step Name) to desired no. of characters
    const getInitialChars = (str, num, suffix) => {
        suffix = suffix ? suffix : '...';
        let result = str;
        if (typeof str === 'string' && str.length > num) {
            result = str.substr(0, num) + suffix;
        }
        return result;
    }

    const handleCardDelete = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
    }

    const onDeleteOk = (name) => {
        props.deleteLoadDataArtifact(name)
        setDialogVisible(false);
    }

    const handleStepAdd = (event, data) => {
        console.log('handleStepAdd', data )
        setAddDialogVisible(true);
        setLoadArtifactName(data.loadDataArtifact.name);
        setFlowName(data.flowName);
    }

    const onAddOk = (lName, fName) => {
        props.addStepToFlow(lName, fName)
        setAddDialogVisible(false);
    }

    const onCancel = () => {
        setDialogVisible(false);
        setAddDialogVisible(false);
    }  

    const deleteConfirmation = (
        <Modal
            visible={dialogVisible}
            okText='Yes'
            cancelText='No'
            onOk={() => onDeleteOk(loadArtifactName)}
            onCancel={() => onCancel()}
            width={350}
            maskClosable={false}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>
                Are you sure you want to delete "{loadArtifactName}"?
            </div>
        </Modal>
    );   
        
    const addConfirmation = (
        <Modal
            visible={addDialogVisible}
            okText='Yes'
            cancelText='No'
            onOk={() => onAddOk(loadArtifactName, flowName)}
            onCancel={() => onCancel()}
            width={350}
            maskClosable={false}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>
                Are you sure you want to add "{loadArtifactName}" to flow "{flowName}"?
            </div>
        </Modal>
    );   
        
    // Pass Load Data name in attributes as workaround for unresolved typescript issue:
    // https://github.com/vkbansal/react-contextmenu/issues/270
    const collect = (menuProps) => {
        console.log('collect', menuProps.attributes);
        return { 
            loadDataArtifact: props.data.find(loadData => loadData.name === menuProps.attributes.className) 
        };
    }

    // const contextualMenu = (
    //     <ContextMenu id={MENU_TYPE}>
    //         <MenuItem onClick={props.addStepToNew}>Add a step to a new flow</MenuItem>
    //         <SubMenu title="Add a step to an existing flow">
    //             {props && props.flows.length > 0 ? props.flows.map((flow) => (
    //                 <MenuItem onClick={handleStepAdd} data={{ flowName: flow.name }}>{flow.name}</MenuItem>
    //             )) : null }
    //         </SubMenu>
    //     </ContextMenu>
    // );

    const createContextualMenus = (propsData) => {
        let menus: any = [];
        for (let index = 0; index < propsData.length; index++) {
            let elem = propsData[index];
            menus.push(<ContextMenu id={MENU_TYPE+index.toString()}>
                <MenuItem onClick={props.addStepToNew}>Add a step to a new flow</MenuItem>
                <SubMenu title="Add a step to an existing flow">
                    {props && props.flows.length > 0 ? props.flows.map((flow) => (
                        <MenuItem onClick={handleStepAdd} data={{ 
                            flowName: flow.name, 
                            loadDataName: elem.name,
                            index: index
                        }}>{flow.name}</MenuItem>
                    )) : null }
                </SubMenu>
            </ContextMenu>)
        }
        return menus
    }

    let contextTrigger;
    const toggleMenu = e => {
        if(contextTrigger) {
            contextTrigger.handleContextClick(e);
        }
        e.preventDefault();
    };

    const createCards = (propsData) => {
        let cards: any = [];
        for (let i = 0; i < propsData.length; i++) {
            let elem = propsData[i];
            console.log('making menu', MENU_TYPE+i.toString());
            cards.push(<Col key={i}>
                <ContextMenuTrigger 
                    id={MENU_TYPE+i.toString()}
                    attributes={{className: elem.name}}
                    collect={collect}
                    ref={c => contextTrigger = c}
                >
                    <Card
                        onContextMenu={toggleMenu}
                        actions={[
                            <span>{elem.filesNeedReuploaded ? (
                                <Popover
                                    content={"Files must be reuploaded"}
                                    trigger="click"
                                    placement="bottom"
                                ><i><FontAwesomeIcon icon={faExclamationCircle} className={styles.popover} size="lg" /></i></Popover>) : ''}</span>,
                            <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" onClick={() => OpenLoadDataSettingsDialog(i)}/></Tooltip>,
                            <Tooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" onClick={() => OpenEditStepDialog(i)}/></Tooltip>,
                            props.canReadWrite ? <Tooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" onClick={() => handleCardDelete(elem.name)}/></i></Tooltip> : <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>,
                        ]}
                        className={styles.cardStyle}
                        
                        size="small"
                    >
                        <div className={styles.formatFileContainer}>
                            <span style={sourceFormatStyle(elem.sourceFormat)}>{elem.sourceFormat.toUpperCase()}</span>
                            <span className={styles.files}>Files</span>
                        </div><br />
                        <div className={styles.fileCount}>{elem.fileCount}</div>
                        <span className={styles.stepNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>
                        <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                    </Card>
                </ContextMenuTrigger>
            </Col>)
        }
        return cards
    }

    return (
        <div id="load-data-card-view" className={styles.loaddataContainer}>
            <Row gutter={16} type="flex" >
                {props.canReadWrite ? <Col >
                    <Card
                        size="small"
                        className={styles.addNewCard}>
                        <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNewDialog}/></div>
                        <br />
                        <p className={styles.addNewContent}>Add New</p>
                    </Card>
                </Col> : ''}
                { props && props.data.length > 0 ? createCards(props.data) : <span></span> }
            </Row>
            <NewDataLoadDialog 
                newLoad={newDataLoad} 
                title={title} 
                setNewLoad={setNewDataLoad} 
                createLoadDataArtifact={props.createLoadDataArtifact} 
                stepData={stepData}
                canReadWrite={props.canReadWrite}
                canReadOnly={props.canReadOnly}
            />
            {deleteConfirmation}
            {addConfirmation}
            <LoadDataSettingsDialog 
                openLoadDataSettings={openLoadDataSettings} 
                setOpenLoadDataSettings={setOpenLoadDataSettings} 
                stepData={stepData}
            />
            {createContextualMenus(props.data)}
        </div>
    );

}

export default LoadDataCard;