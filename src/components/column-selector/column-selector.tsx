import React, { useState, useEffect } from 'react';
import { Popover, Tree, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faColumns } from '@fortawesome/free-solid-svg-icons'
import styles from './column-selector.module.scss';
import { updateHeader, reconstructHeader, deepCopy, getKeys, getChildKeys, getParentKey, setTreeVisibility } from '../../util/data-conversion';

interface Props {
  title: any[];
  tree: any[];
  headerRender: (columns: any) => void;
  updateTreeColumns: (columns: any) => void;
};

const ColumnSelector: React.FC<Props> = (props) => {
  const { TreeNode } = Tree;
  const { Search } = Input;
  const [expandedKeys, setExpandedKeys] = useState<any[]>();
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [checkedKeys, setCheckedKeys] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  let primaryKey = props.tree[0] && props.tree[0].key && props.tree[0].key;
  let allKeys = getKeys(props.tree)
  const dataList = new Array();
  let prevTree = props.tree;

  useEffect(() => {
    setCheckedKeys(getChildKeys(props.title))
  }, [props.title])

  const onExpand = expandedKeys => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = checkedKeys => {
    setCheckedKeys(checkedKeys);
    props.headerRender(reconstructHeader(props.tree, checkedKeys));
  };

  const generateList = data => {
    for (let i = 0; i < data.length; i++) {
      dataList.push({ key: data[i].key, title: data[i].title });
      if (data[i].children) {
        generateList(data[i].children);
      }
    }
  };

  const renderTreeNodes = data =>
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
              {renderTreeNodes(item.children)}
            </TreeNode>
          );

        } else {
          return (
            <TreeNode key={item.key} title={title} >
              {renderTreeNodes(item.children)}
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


  const onDrop = info => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    let data = props.tree;

    if (dragKey.length === dropKey.length) {
      if (dropPosition !== 0) {
        const loop = (data, key, callback) => {
          data.forEach((item, index, arr) => {
            if (item.key === key) {
              return callback(item, index, arr);
            }
            if (item.children) {
              return loop(item.children, key, callback);
            }
          });
        };

        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });

        let ar;
        let i;
        loop(data, dropKey, (item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }

      let col = new Array();
      for (let i of checkedKeys) {
        for (let j of allKeys) {
          if (i === j || j.startsWith(i + '-')) {
            col.push(j)
          }
        }
      }

      props.headerRender(reconstructHeader(deepCopy(data), col));
      props.updateTreeColumns(data)
    }
  };

  const onChange = e => {
    const { value } = e.target;
    let filteredTree = setTreeVisibility(deepCopy(prevTree), value)

    props.updateTreeColumns(filteredTree.ob)
    generateList(filteredTree.ob);

    const expandedKeys = dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, props.tree);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(expandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const content = (
    <div className={styles.popover}>
      <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onChange} />
      <Tree
        className="draggable-tree"
        draggable
        blockNode
        onDrop={onDrop}
        checkable
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        selectedKeys={selectedKeys}
      >
        {renderTreeNodes(props.tree)}
      </Tree>
    </div>
  )

  return (
    <div className={styles.fixedPopup}>
      <Popover placement="leftTop" content={content} trigger="click" className={styles.fixedPopup}>
        <FontAwesomeIcon className={styles.columnIcon} icon={faColumns} size="lg" />
      </Popover>
    </div>
  )
}

export default ColumnSelector;


