import { Menu, Select } from "antd"
import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import styles from './dropdownWithSearch.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';

const DropDownWithSearch = (props) => {

    const node: any = useRef();
    const [menuVisible, setMenuVisible] = useState(false);
    const [selList, setSelList] = useState(false);

    //handle callback from event listeners
    const handleOuterClick = useCallback(
        e => {
            if (node.current && !node.current.contains(e.target)) {
                setSelList(false);
                setMenuVisible(false);
                props.setDisplaySelectList(false);
                props.setDisplayMenu(false);
            }
        }, []
    );

    //CSS Styles for the select list
    const listStyle:CSSProperties = {
        width: '12vw',
    }

    const dropDownStyle: CSSProperties = {
        maxHeight: '40vh',
    }

    useEffect(() => {
        setSelList(props.displaySelectList);
        setMenuVisible(props.displayMenu);
    }, [props.displaySelectList, props.displayMenu]);

    //Handling click event outside the Dropdown Menu
    useEffect(() => {
        if (menuVisible && selList) {
            document.addEventListener('click', handleOuterClick);
        }

        return () => {
            document.removeEventListener('click', handleOuterClick)
        };
    });

    const optionsStyle = (index) =>{
        if(props.indentList) {
            return {lineHeight: '2vh', textIndent: props.indentList[index]+'px'};
        }
        else {
            return {lineHeight: '2vh'};
        }
    };
    /* props.srcData requires an array of tuple instead of a flat array to handle duplicate values */
    return (

        <div ref={node}>
            {menuVisible && <Menu>
                <Select
                    id="dropdownList"
                    open={selList}
                    showSearch
                    style={listStyle}
                    suffixIcon={<FontAwesomeIcon icon={faSearch} size="2x" className={styles.searchIcon}/>}
                    dropdownMenuStyle={dropDownStyle}
                    dropdownClassName={styles.dropDownStyle}
                    value={props.itemValue}
                    onChange={props.onItemSelect}
                >
                    {props.srcData.map((element, index) => <Select.Option style={optionsStyle(index)} key={element.key}>{element.value}</Select.Option>)}
                </Select>
            </Menu>}
        </div>
    );
}

export default DropDownWithSearch;
