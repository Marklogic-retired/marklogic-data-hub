import React, { useState, useEffect, useContext } from 'react';
import { Popover, Tree, Input, Divider } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faColumns } from '@fortawesome/free-solid-svg-icons'
import styles from './column-selector.module.scss';
import { treeConverter, getCheckedKeys, getSelectedTableProperties, setTreeVisibility, getParentKey } from '../../util/data-conversion';
import { MLButton } from '@marklogic/design-system';
import { SearchContext } from '../../util/search-context';


interface Props {
  entityPropertyDefinitions: any[];
  selectedPropertyDefinitions: any[];
  popoverVisibility: boolean;
  setPopoverVisibility: (state: boolean) => void;
};

const ColumnSelector: React.FC<Props> = (props) => {
  const { TreeNode } = Tree;
  const { Search } = Input;
  const {
    setSelectedTableProperties,
  } = useContext(SearchContext);

  let allProperties = treeConverter(props.entityPropertyDefinitions);
  let selectedPropertyKeys = getCheckedKeys(allProperties, props.selectedPropertyDefinitions);

  const [expandedKeys, setExpandedKeys] = useState<any[]>();
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState("");
  const [treeColumns, setTreeColumns] = useState<any[]>(allProperties);
  const [checkedKeys, setCheckedKeys] = useState<any[]>(selectedPropertyKeys);

  let primaryKey = treeColumns[0] && treeColumns[0].key && treeColumns[0].key;
  const dataList = new Array();

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
      dataList.push({ key: data[i].key, title: data[i].title });
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
            <span style={{ fontWeight: 'bold' }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
            <span>{item.title}</span>
          );

      if (item.children) {
        if (item.visible === false) {
          return (
            <TreeNode style={{ display: 'none' }} key={item.key} title={title} >
              {treeRenderer(item.children)}
            </TreeNode>
          );

        } else {
          return (
            <TreeNode key={item.key} title={title} >
              {treeRenderer(item.children)}
            </TreeNode>
          );
        }
      }
      if (item.visible === false) {
        return <TreeNode style={{ display: 'none' }} title={title} disabled={item.key === primaryKey} disableCheckbox={item.key === primaryKey} key={item.key} />;

      } else {
        return <TreeNode title={title} disabled={item.key === primaryKey} disableCheckbox={item.key === primaryKey} key={item.key} />;
      }
    });

  const onChange = e => {
    const { value } = e.target;
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
    props.setPopoverVisibility(false)
  };

  const onApply = () => {
    let selectedProperties = getSelectedTableProperties(allProperties, checkedKeys);
    setSelectedTableProperties(selectedProperties);
    props.setPopoverVisibility(false);
  };

  const content = (
    <div data-testid="column-selector-popover" className={styles.popover}>
      <header>
        <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onChange} />
      </header>
      <div className={styles.content}>
        <Tree
          data-testid="popover-tree"
          className="draggable-tree"
          draggable
          blockNode
          checkable
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
        <Divider className={styles.divider} />
        <div className={styles.footer}>
          <MLButton size="small" onClick={onClose} >Cancel</MLButton>
          <MLButton size="small" onClick={onApply} >Apply</MLButton>
        </div>
      </footer>
    </div>
  )

  return (
    <div className={styles.fixedPopup}>
      <Popover placement="leftTop" content={content} trigger="click" visible={props.popoverVisibility} className={styles.fixedPopup}>
          <FontAwesomeIcon onClick={() => props.setPopoverVisibility(true)} className={styles.columnIcon} icon={faColumns} size="lg" />
      </Popover>
    </div>
  )
}

export default ColumnSelector;


