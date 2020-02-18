
import React, { useState, useEffect } from "react";
import { Modal, Table } from "antd";

const SourceToEntityMap = (props) => {

    const onOk = () => {
        props.setMappingVisible(false)
        console.log('Map Saved!')
    }

    const onCancel = () => {
        props.setMappingVisible(false)
        console.log('Map cancelled!')
    }

    const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          sorter: (a:any, b:any) => a.name.length - b.name.length,
        },
        {
          title: 'Value',
          dataIndex: 'value',
          key: 'value',
          sorter: (a:any, b:any) => a.value.length - b.value.length,
        }
    ];



return (<Modal
        visible={props.mappingVisible}
        // okText='Yes'
        // cancelText='No'
        onOk={() => onOk()}
        onCancel={() => onCancel()}
        width={1300}
        maskClosable={false}
        footer={null}
        >
        <span style={{fontSize: '16px'}}>This is just a sample dialog for mapping</span>
        <span>
        <Table
        //pagination={{showSizeChanger: true, pageSizeOptions:pageSizeOptions}}
        //className={styles.loadTable}
        size="small"
        columns={columns}
        dataSource={props.data}
        rowKey="name"
        />
        <Table
        //pagination={{showSizeChanger: true, pageSizeOptions:pageSizeOptions}}
        //className={styles.loadTable}
        size="small"
        columns={columns}
        dataSource={props.data}
        rowKey="name"
        />
        </span>
        </Modal>

);

}

export default SourceToEntityMap;