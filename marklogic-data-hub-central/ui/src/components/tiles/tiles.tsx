import React from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { Tooltip, Menu, Dropdown } from 'antd';
import { ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faCog } from "@fortawesome/free-solid-svg-icons";
import styles from './tiles.module.scss';
import './tiles.scss';

interface Props {
    id: string;
    view: any;
    currentNode: any;
    controls: string[];
    options: any;
    onMenuClick: any
}

const Tiles: React.FC<Props> = (props) => {

    const options = props.options;
    const viewId = props.id;

    const showControl = (control) => {
        return props.controls.indexOf(control) !== -1;
    }

    const onChange = (event) => {
        console.log('onChange', event);
    }

    const onRelease = (event) => {
        console.log('onRelease', event);
    }

    // TODO Implement newTab feature
    const onClickNewTab = (event) => {
        console.log('onClickNewTab', event);
    }

    // TODO Implement maximize feature
    const onClickMaximize = (event) => {
        console.log('onClickMaximize', event);
    }

    // TODO Implement minimize feature
    const onClickMinimize = (event) => {
        console.log('onClickMinimize', event);
    }

    const menu = (
        <Menu onClick={props.onMenuClick}>
            <Menu.Item key="1">
                    Manage Queries
            </Menu.Item>
        </Menu>
    );

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
                        <div>
                            <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
                                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                    <Tooltip title={'Menu'} placement="top">
                                        <i className={styles.faCog} aria-label={'menu'}>
                                            <FontAwesomeIcon icon={faCog} />
                                        </i>
                                    </Tooltip>
                                </a>
                            </Dropdown>
                        </div>
                    ) : null}
                    {showControl('newTab') ? (
                        <Tooltip title={'Open in New Tab'} placement="bottom">
                            <i className={styles.fa} aria-label={'newTab'} onClick={onClickNewTab}>
                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                            </i>
                        </Tooltip>) : null}
                    {showControl('maximize') ? (
                        <Tooltip title={'Maximize'} placement="bottom">
                            <i className={styles.ant} aria-label={'maximize'} onClick={onClickMaximize}>
                                <ArrowsAltOutlined />
                            </i>
                        </Tooltip>) : null}
                    {showControl('minimize') ? (
                        <Tooltip title={'Minimize'} placement="bottom">
                            <i className={styles.ant} aria-label={'minimize'} onClick={onClickMinimize}>
                                <ShrinkOutlined />
                            </i>
                        </Tooltip>) : null}
                </div>
            </div>
        )
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
                        {props.view}
                    </MosaicWindow>
                )
            }}
            className={'mosaic-container mosaic-container-' + viewId}
            value={props.currentNode}
            onChange={onChange}
            onRelease={onRelease}
        />
    </>);
}

export default Tiles;
