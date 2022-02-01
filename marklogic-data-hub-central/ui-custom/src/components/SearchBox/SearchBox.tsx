import React, { useState, useContext, useEffect } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import FormControl from "react-bootstrap/FormControl";
import { SearchContext } from "../../store/SearchContext";
import { Search } from "react-bootstrap-icons";
import "./SearchBox.scss";

type Props = {
    config?: any;
    button?: string;
    buttonAlign?: string;
    width?: string;
};

/**
 * Component for showing search input box. Includes record type dropdown menu and optional submit button.
 * Submitted searches are executed by {@link SearchContext}.
 *
 * @component
 * @prop {object} config - Configuration object.
 * @prop {object[]} config.items - Array of menu item objects.
 * @prop {string} config.items.label - Menu item label.
 * @prop {string|string[]} config.items.value - Menu item value (as string or array of strings).
 * @prop {boolean} config.items.default - Set to true if menu item should be selected as the default. Optional.
 * @prop {string} button - Display an aligned submit button ("vertical" or "horizontal"). Optional.
 * @prop {string} width - Width of search box (as CSS width value). Default is "100%".
 * @example
 * // Configuration Object
 * const menuConfig = { 
 *     items: [
 *         {
 *             label: "All",
 *             value: ["ent1", "ent2"]
 *         },
 *         {
 *             label: "Default Item",
 *             value: "ent1",
 *             default: true
 *         },
 *         {
 *             label: "Another Item",
 *             value: "ent2"
 *         }
 *     ]
 * };
 * @example
 * // JSX
 * <SearchBox config={menuConfig} button="vertical" width="80%" />
 */
const SearchBox: React.FC<Props> = (props) => {

  const searchContext = useContext(SearchContext);

  const qtextInit: string = searchContext.qtext || "";
  let selectedInit: string = "";

  let items: any = [];
  if (props.config && props.config.items && props.config.items.length > 0) {
    items = props.config.items;
    let found = items.find(item => item.default === true);
    selectedInit = found ? found.label : items[0].label;
  }

  const [selected, setSelected] = useState<any>(selectedInit);
  const [qtext, setQtext] = useState<any>(qtextInit);

  useEffect(() => {
    setQtext(searchContext.qtext);
  }, [searchContext.qtext]);

  useEffect(() => {
    let found = items.find(item => item.value === searchContext.entityType);
    if (found && found.label) {
      setSelected(found.label);
    } else {
      setSelected(selectedInit);
    }
  }, [searchContext.entityType]);

  const handleSelect = (e) => {
    setSelected(e);
  };

  // Get entity value ("person") for a selected menu label ("Person")
  const getEntityVal = sel => {
    let found = items.find(item => item.label === sel);
    return found ? found.value : "";
  }

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      searchContext.handleSearch(qtext, getEntityVal(selected));
    }
  };

  const handleButton = (e) => {    
    searchContext.handleSearch(qtext, getEntityVal(selected));
  };

  const handleChange = (e) => {
    setQtext(e.target.value);
  };

  const searchBoxStyle = {
    width: props.width ? props.width : "100%"
  };

  let menuItems = items.map((item, i) => {
    return (
      <Dropdown.Item 
        key={"item-" + i} 
        eventKey={item.label}
        active={item.active}
      >{item.label}</Dropdown.Item>
    );
  });

  return (
    <div className="searchBox" style={searchBoxStyle}>
      <InputGroup>
        { items.length > 0 &&
        <DropdownButton
          variant="outline-secondary"
          title={selected}
          data-testid="searchBoxDropdown"
          id="searchBoxDropdown"
          onSelect={handleSelect}
        >
          {menuItems}
        </DropdownButton> }
        <FormControl
          data-testid="searchBox"
          className="shadow-none"
          value={qtext}
          onKeyDown={(e) => handleEnter(e) }
          onChange={handleChange}
        />
        { !props.button && 
          <Search color="#999" size={18} className="searchIcon" data-testid="searchIcon" />
        }
        { props.button && 
          <div className={props.button}>
            <button data-testid="submit" className="submit" onClick={handleButton}>Search</button>
          </div>
        }
      </InputGroup>
    </div>
  );

};

export default SearchBox;
