import React from 'react';
import styles from './view-entities.module.scss';
import { Statistic, Table } from 'antd';

const ViewEntities:React.FC<{}> = () => {

  const expandedRowRender = () => {
    const columns = [
      { title: 'Property', dataIndex: 'property', width: 200 },
      { title: 'Data Type', dataIndex: 'datatype', width: 200 },
      { title: 'Index Settings', dataIndex: 'indexSettings' }
    ];

    const data = [
      { property: 'id', datatype: 'int', indexSettings: 'Primary Key' },
      { property: 'first_name', datatype: 'string', indexSettings: 'Required' },
      { property: 'last_name', datatype: 'string', indexSettings: 'Required' },
      { property: 'email', datatype: 'string', indexSettings: 'None' },
    ];

    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const columns = [
    { 
      title: 'Entity Name', 
      dataIndex: 'name', 
      width: 200,
      sorter: (a, b) => { return a.name.localeCompare(b.name) }
    },
    { 
      title: 'Documents', 
      dataIndex: 'documents', 
      width: 200 ,
      sorter: (a, b) => { return a.documents - b.documents }
    },
    { 
      title: 'Last Harmonized', 
      dataIndex: 'created',
      sorter: (a, b) => { return a.created.localeCompare(b.created) }
    }
  ];

  const data = [
    { name: 'Customer', documents: 515, created: '2019-07-30T16:08:30' },
    { name: 'Order', documents: 3654, created: '2019-07-29T08:09:22' },
    { name: 'Shipment', documents: 3209, created: '2019-07-28T02:11:45' },
    { name: 'SupportCall', documents: 442, created: '2019-07-27T11:54:55' },
    { name: 'Exmployee', documents: 66, created: '2019-07-26T15:33:03' },
    { name: 'Location', documents: 18, created: '2019-07-25T19:36:09' },
    { name: 'Supplier', documents: 57, created: '2019-07-24T13:42:37' },
    { name: 'ProductGroup', documents: 31, created: '2019-07-23T13:32:31' },
    { name: 'Product', documents: 91, created: '2019-07-22T14:01:45' },
    { name: 'Promotion', documents: 25, created: '2019-07-21T16:07:52' }
  ];

  return (
    <div className={styles.viewContainer}>
      <div>
        <div className={styles.entitiesStat}>
          <Statistic title="Total Entities" value={13} />
        </div>
        <div className={styles.documentsStat}>
        <Statistic title="Total Documents" value={14563} />
        </div>
      </div>
      <Table
        className="components-table-demo-nested"
        columns={columns}
        expandedRowRender={expandedRowRender}
        dataSource={data}
      />
    </div>
  );

}

export default ViewEntities;