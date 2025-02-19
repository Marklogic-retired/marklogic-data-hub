import React, {useState, useEffect, useContext} from "react";
import "rc-tree/assets/index.less";
import Tree from "rc-tree";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faColumns} from "@fortawesome/free-solid-svg-icons";
import styles from "./column-selector.module.scss";
import {
  treeConverter,
  getCheckedKeys,
  getSelectedTableProperties,
  setTreeVisibility,
  getParentKey,
} from "@util/data-conversion";
import {SearchContext} from "@util/search-context";
import {HCSearch, HCButton, HCDivider, HCTooltip} from "@components/common";
import Popover from "react-bootstrap/Popover";
import {Overlay} from "react-bootstrap";

interface Props {
  entityPropertyDefinitions: any[];
  selectedPropertyDefinitions: any[];
  popoverVisibility: boolean;
  setPopoverVisibility: (state: boolean) => void;
  setColumnSelectorTouched: (state: boolean) => void;
  columns: any[];
  primaryKey: string;
}

const ColumnSelector: React.FC<Props> = props => {
  const {TreeNode} = Tree;
  const {setSelectedTableProperties} = useContext(SearchContext);
  const target = React.useRef(null);
  const container = React.useRef(null);

  let allProperties = treeConverter(props.entityPropertyDefinitions);
  let selectedPropertyKeys = getCheckedKeys(allProperties, props.selectedPropertyDefinitions);

  const [expandedKeys, setExpandedKeys] = useState<any[]>();
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState("");
  const [treeColumns, setTreeColumns] = useState<any[]>(allProperties);
  const [checkedKeys, setCheckedKeys] = useState<any[]>(selectedPropertyKeys);

  let primaryKey = treeColumns.find(prop => {
    return prop.title === props.primaryKey;
  });
  const dataList: any[] = [];

  useEffect(() => {
    allProperties = treeConverter(props.entityPropertyDefinitions);
    selectedPropertyKeys = getCheckedKeys(allProperties, props.selectedPropertyDefinitions);
    setTreeColumns(allProperties);
    setCheckedKeys(selectedPropertyKeys);
  }, [props.selectedPropertyDefinitions, props.entityPropertyDefinitions, props.popoverVisibility]);

  const onExpand = expandedKeys => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = checkedKeys => {
    setCheckedKeys(checkedKeys);
  };

  const generateList = data => {
    for (let i = 0; i < data.length; i++) {
      dataList.push({key: data[i].key, title: data[i].title});
      if (data[i].children) {
        generateList(data[i].children);
      }
    }
  };

  const treeRenderer = data =>
    data.map(item => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span style={{fontWeight: "bold"}}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );

      if (item.children) {
        if (item.visible === false) {
          return (
            <TreeNode style={{display: "none"}} key={item.key} title={title} aria-label="column-option">
              {treeRenderer(item.children)}
            </TreeNode>
          );
        } else {
          return (
            <TreeNode key={item.key} title={title} aria-label="column-option">
              {treeRenderer(item.children)}
            </TreeNode>
          );
        }
      }
      if (item.visible === false) {
        return <TreeNode style={{display: "none"}} title={title} key={item.key} aria-label="column-option" />;
      } else {
        if (item && primaryKey && item.key === primaryKey.key) {
          let pkTitle = (
            <HCTooltip
              text="The column identified as the unique identifier must always be displayed."
              id="column-identifier-tooltip"
              placement="top"
            >
              <div data-testid="pk-tooltip">{title}</div>
            </HCTooltip>
          );
          return (
            <TreeNode
              title={pkTitle}
              disabled={true}
              disableCheckbox={true}
              key={item.key}
              data-testid={`node-${item.title}`}
              aria-label="column-option"
            />
          );
        } else {
          return (
            <TreeNode title={title} key={item.key} data-testid={`node-${item.title}`} aria-label="column-option" />
          );
        }
      }
    });

  const onChange = e => {
    const {value} = e.target;
    let filteredTree = setTreeVisibility(allProperties, value).ob;
    setTreeColumns(filteredTree);
    generateList(filteredTree);

    const expandedKeys = dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, allProperties);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(expandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const onClose = () => {
    props.setPopoverVisibility(false);
  };

  const onApply = () => {
    let selectedProperties = getSelectedTableProperties(allProperties, checkedKeys);
    props.setColumnSelectorTouched(JSON.stringify(selectedProperties) !== JSON.stringify(props.columns));
    setSelectedTableProperties(selectedProperties);
    props.setPopoverVisibility(false);
  };

  const content = (
    <Popover id={`popover-column-selector`} className={styles.popoverColumnSelector}>
      <Popover.Body>
        <div data-testid="column-selector-popover" className={styles.popover}>
          <header>
            <HCSearch style={{marginBottom: 8}} placeholder="Search" onChange={onChange} />
          </header>
          <div className={styles.content}>
            <Tree
              data-testid="popover-tree"
              className="draggable-tree"
              draggable
              checkable
              showIcon={false}
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
            >
              {treeRenderer(treeColumns)}
            </Tree>
          </div>
          <footer>
            <HCDivider className={styles.divider} />
            <div className={styles.footer}>
              <HCButton size="sm" variant="outline-light" onClick={onClose} data-testid={"cancel-column-selector"}>
                Cancel
              </HCButton>
              <HCButton
                size="sm"
                onClick={onApply}
                disabled={!checkedKeys.length}
                data-testid={"apply-column-selector"}
              >
                Apply
              </HCButton>
            </div>
          </footer>
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <div ref={container}>
      <HCTooltip id="select-columns-tooltip" text="Select the columns to display." placement="top-end">
        <i ref={target}>
          <FontAwesomeIcon
            className={styles.columnIcon}
            icon={faColumns}
            size="lg"
            data-testid="column-selector-tooltip"
            tabIndex={0}
            onClick={() => props.setPopoverVisibility(true)}
            onKeyPress={e => {
              if (e.key === "Enter" || e.key === " ") {
                props.setPopoverVisibility(true);
              }
            }}
          />
        </i>
      </HCTooltip>
      <Overlay container={container} target={target.current} placement="left-start" show={props.popoverVisibility}>
        {content}
      </Overlay>
    </div>
  );
};

export default ColumnSelector;
