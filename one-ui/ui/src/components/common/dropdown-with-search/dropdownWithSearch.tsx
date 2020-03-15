import { Menu, Select } from "antd"
import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import styles from './dropdownWithSearch.module.scss';

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

    return (

        <div ref={node}>
            {menuVisible && <Menu>
                <Select
                    open={selList}
                    showArrow={false}
                    showSearch
                    style={listStyle}
                    //dropdownStyle={dropDownStyle}
                    dropdownMenuStyle={dropDownStyle}
                    dropdownClassName={styles.dropDownStyle}
                    value={props.itemValue}
                    onChange={props.onItemSelect}
                >
                    {props.srcData.map(num => <Select.Option className={styles.selectOptionsStyle} key={num}>{num}</Select.Option>)}
                </Select>
            </Menu>}
        </div>
    );
}

export default DropDownWithSearch;