import { Menu, Select } from "antd"
import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import styles from './dropdownWithSearch.module.scss';
import arrayIcon from '../../../assets/icon_array.png';
import {MLTooltip} from '@marklogic/design-system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';

const DropDownWithSearch = (props) => {

    const node: any = useRef();
    const [selList, setSelList] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [eventValid, setEventValid] = useState(false);

    //handle callback from event listeners
    const handleOuterClick = useCallback(
        e => {
            if (node.current && !node.current.contains(e.target)) {
                props.setDisplaySelectList(prev => false);
                props.setDisplayMenu(prev => false);
                setEventValid(prev => false);
            }
        }, []
    );

    //CSS Styles for the select list
    const listStyle:CSSProperties = {
        width: '12em',
    }

    const dropDownStyle: CSSProperties = {
        maxHeight: '40vh',
    }

    useEffect(() => {
        setSelList(prev => props.setDisplaySelectList);
        setMenuVisible(prev => props.setDisplayMenu);
        if(props.setDisplaySelectList){
            setEventValid(prev => true);
        }
    },[props.setDisplaySelectList,props.setDisplayMenu])

    //Handling click event outside the Dropdown Menu
    useEffect(() => {
        if (eventValid) {
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
               {menuVisible && <Select
                    id="dropdownList"
                    open={selList}
                    showSearch
                    style={listStyle}
                    getPopupContainer={triggerNode => triggerNode.parentNode ? triggerNode.parentNode : node.current}
                    suffixIcon={<FontAwesomeIcon icon={faSearch} size="2x" className={styles.searchIcon}/>}
                    dropdownMenuStyle={dropDownStyle}
                    dropdownClassName={styles.dropDownStyle}
                    value={null}
                    onChange={props.onItemSelect}
                >
                    {props.srcData.map((element, index) => <Select.Option style={optionsStyle(index)} key={element.key}>{element.value} {<MLTooltip title = "Multiple"><img data-testid = {element.value + '-optionIcon'} src= {element.struct ? arrayIcon : '' }/></MLTooltip>}</Select.Option>)}
               </Select>  }
        </div>
    );
}

export default DropDownWithSearch;
