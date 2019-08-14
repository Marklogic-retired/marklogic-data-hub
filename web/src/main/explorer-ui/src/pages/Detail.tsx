import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styles from './Detail.module.scss';
import TableView from '../components/table-view/table-view';
import JsonView from '../components/json-view/json-view';
import ExampleJson from '../assets/example';
import { Typography, Icon, Menu, PageHeader } from 'antd';

interface Props extends RouteComponentProps<any> {}

const Detail: React.FC<Props> = ({ history }) => {

  const [selected, setSelected] = useState('instance');
  const { Text } = Typography;

  const handleClick = (event) => {
    setSelected(event.key);
  }

  return (
    <div>
      <div>
        <PageHeader onBack={() => history.push('/browse')} title="Back" />
      </div>
      <div className={styles.container}>
        <div className={styles.title}>
          <Text>Customer</Text>
          <Icon style={{ fontSize: '12px' }} type="right" />
          <Text type="secondary">id: </Text>
          <Text>{ExampleJson.envelope.instance.id}</Text>
        </div>
        <div className={styles.header}>
          <div className={styles.heading}>
            <Text type="secondary">Created: </Text>
            <Text>{ExampleJson.envelope.headers.createdOn}</Text>
            <Text type="secondary"> Sources: </Text>
            <Text>{ExampleJson.envelope.headers.sources[0].name}</Text>
            <Text type="secondary"> File Type: </Text>
            <Text>JSON</Text>
            <Text type="secondary"> User: </Text>
            <Text>{ExampleJson.envelope.headers.createdBy}</Text>
          </div>
          <div className={styles.menu}>
            <Menu onClick={(event) => handleClick(event)} mode="horizontal" selectedKeys={[selected]}>
              <Menu.Item key="instance">
                Instance
            </Menu.Item>
              <Menu.Item key="full">
                Full
            </Menu.Item>
            </Menu>
          </div>
        </div>
        {selected === 'instance' ? <TableView /> : <JsonView />}
      </div>
    </div>
  );
}

export default Detail;