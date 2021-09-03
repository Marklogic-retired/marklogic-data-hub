import React, {useState, useContext} from "react";
import {Modal, Form, Input, Radio, Table} from "antd";
import {Accordion} from "react-bootstrap";
import styles from "./query-export-modal.module.scss";
import {SearchContext} from "../../../util/search-context";
import {UserContext} from "../../../util/user-context";
import {exportQuery, exportSavedQuery} from "../../../api/queries";
import HCAlert from "../../common/hc-alert/hc-alert";

const QueryExportModal = (props) => {

  const [value, setValue] = useState<number>(1);
  const [limit, setLimit] = useState<number>(Number.MAX_SAFE_INTEGER);

  const {
    searchOptions
  } = useContext(SearchContext);
  const {
    handleError
  } = useContext(UserContext);

  const onClose = () => {
    setValue(1);
    props.setExportModalVisibility(false);
  };

  const onOk = async () => {
    if (props.recordID) {
      exportSavedQuery(props.recordID, limit, searchOptions.database);
    } else {
      let query = {
        savedQuery: {
          id: "",
          name: "",
          description: "",
          query: {
            searchText: searchOptions.query,
            entityTypeIds: searchOptions.entityTypeIds.length ? searchOptions.entityTypeIds : props.entities,
            selectedFacets: searchOptions.selectedFacets,
          },
          propertiesToDisplay: searchOptions.selectedTableProperties,
        }
      };

      try {
        await exportQuery(query, limit, searchOptions.database);
      } catch (error) {
        handleError(error);
      }
    }

    props.setExportModalVisibility(false);
    setValue(1);
    setLimit(Number.MAX_SAFE_INTEGER);
  };

  const onChange = e => {
    setValue(e.target.value);
  };

  const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
  };

  const layoutInput = {
    labelCol: {span: 11},
    wrapperCol: {span: 11},
  };

  return (
    <Modal
      title="Export"
      visible={props.exportModalVisibility}
      okText="Export"
      cancelText="Cancel"
      onOk={() => onOk()}
      okButtonProps={{disabled: limit <= 0}}
      onCancel={() => onClose()}
      width={800}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        {...layout}
        name="basic"
        data-testid="query-export-form"
      >
        {props.tableColumns && props.tableColumns.length > 0 && props.hasStructured &&

        <div>
          <HCAlert
            data-testid="export-warning"
            variant="warning"
            className={styles.dataWarning}
            showIcon
          >
            {"One or more structured properties are included in this query. The data for those properties will not be included in the export file. to see what will be exported."}
          </HCAlert>
          <br />
        </div>}

        <p className={styles.text}>Export to a CSV file containing the columns of data currently displayed.</p>

        <Form.Item
          colon={false}
          label="Rows:"
          labelAlign="left"
          className={styles.text}
        >
          <Radio.Group className={styles.radio} value={value} onChange={onChange}>
            <Radio value={1}> All</Radio>
            <br />
            <Radio value={2}> Limited set of the first rows returned</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
      <Form
        {...layoutInput}
        name="basic"
      >
        {value === 2 && <div style={{marginLeft: "10px", marginBottom: "-25px"}}>
          <Form.Item
            colon={false}
            label="Maximum rows:"
            className={styles.text}
          ><Input data-testid="max-rows-input" className={styles.text} type="number" min="1" onChange={e => setLimit(Number(e.target.value))} style={{width: 60}} />
          </Form.Item>
        </div>
        }
      </Form>

      {props.tableColumns && props.tableColumns.length > 0 && props.hasStructured &&
        <Accordion id="export-panel" className={"w-100"} flush>
          <Accordion.Item eventKey="1">
            <div className={"d-flex"}>
              <Accordion.Button>Show Preview</Accordion.Button>
            </div>
            <Accordion.Body>
              <HCAlert
                data-testid="export-data-warning"
                variant="warning"
                className={styles.dataWarning}
                showIcon
              >{"Preview may improperly render new lines in property values"}</HCAlert>
              <br />
              <Table data-testid="export-preview-table" className={styles.exportTable} dataSource={props.tableData} columns={props.tableColumns} pagination={false} size="small" scroll={{x: 500}} bordered />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>}
    </Modal>
  );
};

export default QueryExportModal;
