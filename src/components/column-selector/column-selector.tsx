import React, { useState, useEffect } from 'react';
import { Popover, Tooltip, Menu, Dropdown, Icon, Checkbox, Tree, Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { faColumns } from '@fortawesome/free-solid-svg-icons'
import styles from './column-selector.module.scss';
import { toStringArray, reconstructHeader, deepCopy, getKeys } from '../../util/data-conversion';

interface Props {
  title: any[];
  tree: any[];
  headerRender: (columns: any) => void;
};

const ColumnSelector: React.FC<Props> = (props) => {
  const { TreeNode } = Tree;
  const [expandedKeys, setExpandedKeys] = useState<any[]>();
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [checkedKeys, setCheckedKeys] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any[]>([]);
  const [tree, setTree] = useState<any[]>(props.tree);
  let primaryKey = props.tree[0] && props.tree[0].key && props.tree[0].key;


  useEffect(() => {
    setTree(props.tree)
  }, [props.tree])

  useEffect(() => {
    setCheckedKeys([...[props.title.map(e => e.key)][0]])
    setCheckedKeys(getKeys(props.tree))
  }, [props.title])

  const onExpand = expandedKeys => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = checkedKeys => {
    setCheckedKeys(checkedKeys);
    props.headerRender(reconstructHeader(deepCopy(tree), checkedKeys));
  };

  const renderTreeNodes = data =>
    data && data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode disabled={item.key === primaryKey} disableCheckbox={item.key === primaryKey} key={item.key} {...item} />;
    });

  const onDrop = info => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    let data = tree;

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

    props.headerRender(reconstructHeader(deepCopy(data), checkedKeys));
    setTree(data)
  };

  const content = (
    <>
      <div className={styles.popover}>
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
          {renderTreeNodes(tree)}
        </Tree>
      </div>
    </>
  )

  return (
    <Popover placement="left" content={content} trigger="click">
      <FontAwesomeIcon icon={faColumns} size="lg" />
    </Popover>
  )
}

export default ColumnSelector;

