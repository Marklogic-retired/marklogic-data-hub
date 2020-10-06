import React, { useContext } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { Menu, Dropdown } from 'antd';
import { ArrowsAltOutlined, ShrinkOutlined, CloseOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faCog } from "@fortawesome/free-solid-svg-icons";
import styles from './tiles.module.scss';
import './tiles.scss';
import Run from '../../pages/Run';
import { MLTooltip, MLButton } from '@marklogic/design-system';
import { SearchContext } from "../../util/search-context";

interface Props {
    id: string;
    view: any;
    currentNode: any;
    options: any;
    onMenuClick: any;
    onTileClose: any;
    newStepToFlowOptions: any;
}

const Tiles: React.FC<Props> = (props) => {

    const options = props.options;
    const controls = props.options.controls;
    const viewId = props.id;
    const { savedQueries } = useContext(SearchContext);

    const showControl = (control) => {
        return controls.indexOf(control) !== -1;
    };

    const onChange = (event) => {
        console.log('onChange', event);
    };

    const onRelease = (event) => {
        console.log('onRelease', event);
    };

    // TODO Implement newTab feature
    const onClickNewTab = (event) => {
        console.log('onClickNewTab', event);
    };

    // TODO Implement maximize feature
    const onClickMaximize = (event) => {
        console.log('onClickMaximize', event);
    };

    // TODO Implement minimize feature
    const onClickMinimize = (event) => {
        console.log('onClickMinimize', event);
    };

    const onClickClose = () => {
        props.onTileClose();
    };

    const onMenuClick = () => {
        props.onMenuClick();
    };

    const renderHeader = function (props) {
        return (
            <div
                className={styles.paneHeader}
                style={{ backgroundColor: options['bgColor'], borderBottomColor: options['border'] }}
            >
                <div className={styles.title}>
                    {(options['iconType'] === 'custom') ? (<>
                        <span className={options['icon'] + 'Header'} aria-label={'icon-' + viewId} style={{ color: options['color'] }}></span>
                        <div className={styles.exploreText} aria-label={'title-' + viewId}>{options['title']}</div>
                    </>) : (<>
                        <i aria-label={'icon-' + viewId}>
                            <FontAwesomeIcon style={{ color: options['color'] }} icon={options['icon']} />
                        </i>
                        <div className={styles.text} aria-label={'title-' + viewId}>{options['title']}</div>
                    </>)}
                </div>
                <div className={styles.controls}>
                    {showControl('menu') ? (
                        savedQueries.length ? ( // only display if there are saved queries
                            <div>
                                <i className={styles.faCog} aria-label={'menu'} style={{ color: options['color'] }}>
                                    <MLButton id="manage-queries-button" onClick={onMenuClick} style={{height: '25px'}}>
                                        <FontAwesomeIcon icon={faCog} style={{color: '#394494', fontSize: '14px', paddingRight: '4px', paddingTop: '1px'}}/> Manage Queries
                                    </MLButton>
                                </i>
                            </div>
                        ) : null
                    ) : null}
                    {showControl('newTab') ? (
                        <i className={styles.fa} aria-label={'newTab'} style={{ color: options['controlColor'] }} onClick={onClickNewTab}>
                            <MLTooltip title={'Open in New Tab'} placement="top">
                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                            </MLTooltip>
                        </i>) : null}
                    {showControl('maximize') ? (
                        <i className={styles.ant} aria-label={'maximize'} style={{ color: options['controlColor'] }} onClick={onClickMaximize}>
                            <MLTooltip title={'Maximize'} placement="top">
                                <ArrowsAltOutlined />
                            </MLTooltip>
                        </i>) : null}
                    {showControl('minimize') ? (
                        <i className={styles.ant} aria-label={'minimize'} style={{ color: options['controlColor'] }} onClick={onClickMinimize}>
                            <MLTooltip title={'Minimize'} placement="top">
                                <ShrinkOutlined />
                            </MLTooltip>
                        </i>) : null}
                    {showControl('close') ? (
                        <i className={styles.close} aria-label={'close'} style={{ color: options['controlColor'] }} onClick={onClickClose}>
                            <MLTooltip title={'Close'} placement="top">
                                <CloseOutlined />
                            </MLTooltip>
                        </i>
                    ) : null}
                </div>
            </div>
        );
    };

    return (<>
        <Mosaic<string>
            renderTile={(id, path) => {
                return (
                    <MosaicWindow<string>
                        path={path}
                        title={options['title']}
                        renderToolbar={renderHeader}
                    >
                        {!props.newStepToFlowOptions?.addingStepToFlow ? props.view : <Run newStepToFlowOptions={props.newStepToFlowOptions}/>}
                    </MosaicWindow>
                );
            }}
            className={'mosaic-container mosaic-container-' + viewId}
            value={props.currentNode}
            onChange={onChange}
            onRelease={onRelease}
        />
    </>);
};

export default Tiles;
