import React, {useState, useContext} from "react";
import {Row, Col, Modal, Form, FormLabel, Table} from "react-bootstrap";
import {Accordion} from "react-bootstrap";
import styles from "./query-export-modal.module.scss";
import {SearchContext} from "@util/search-context";
import {UserContext} from "@util/user-context";
import {exportQuery, exportSavedQuery} from "@api/queries";
import {HCInput, HCAlert, HCButton, HCModal} from "@components/common";

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
    setValue(parseInt(e.target.value));
  };

  return (
    <HCModal
      show={props.exportModalVisibility}
      size={"lg"}
      onHide={onClose}
    >
      <Modal.Header>
        <span className={"fs-5"}>{"Export"}</span>
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      </Modal.Header>
      <Modal.Body>
        <Form name="basic" data-testid="query-export-form" className={"container-fluid"} >
          {props.tableColumns && props.tableColumns.length > 0 && props.hasStructured &&

          <div>
            <HCAlert
              data-testid="export-warning"
              variant="warning"
              className={styles.dataWarning}
              showIcon
            >
              {"One or more structured properties are included in this query. The data for those properties will not be included in the export file. Click \"Show Preview\" below to see what will be exported."}
            </HCAlert>
            <br />
          </div>}

          <p className={styles.text}>Export to a CSV file containing the columns of data currently displayed.</p>

          <Row>
            <FormLabel column lg={2}>{"Rows:"}</FormLabel>
            <Col className={"d-flex"}>
              <span className={styles.radio}>
                <Form.Check
                  id={"rows-radio-all"}
                  name={"rows-radio"}
                  type={"radio"}
                  defaultChecked={true}
                  onChange={onChange}
                  label={"All"}
                  value={1}
                  aria-label={"All"}
                  className={styles.radio}
                />
                <Form.Check
                  id={"rows-radio-limited"}
                  name={"rows-radio"}
                  type={"radio"}
                  onChange={onChange}
                  label={"Limited set of the first rows returned"}
                  value={2}
                  aria-label={"Limited set of the first rows returned"}
                  className={styles.radio}
                />
              </span>
            </Col>
          </Row>
        </Form>
        <Form
          name="basic"
        >
          {value === 2 &&
            <Row>
              <FormLabel column lg={"auto"} className={"offset-4"}>{"Maximum rows:"}</FormLabel>
              <Col className={"d-flex"}>
                <HCInput dataTestid="max-rows-input" className={styles.text} type="number" min="1" onChange={e => setLimit(Number(e.target.value))} style={{width: 60}} />
              </Col>
            </Row>
          }
        </Form>
        {props.tableColumns && props.tableColumns.length > 0 && props.hasStructured &&
        <Accordion id="export-panel" className={"w-100"} flush>
          <Accordion.Item eventKey="1">
            <div className={"d-flex"}>
              <Accordion.Button>Show Preview</Accordion.Button>
            </div>
            <Accordion.Body>
              <br />
              {props.tableColumns && props.tableData &&
                <Table data-testid="export-preview-table" bordered>
                  <thead>
                    <tr>
                      {props.tableColumns.map(oHeader => <th key={oHeader.key}>{oHeader.title}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {props.tableData.map(oRow => {
                      return <tr key={oRow.key}>
                        {props.tableColumns.map(oColumn => <td key={`row${oRow.key}-col${oColumn.key}`}>{oRow[oColumn.dataIndex]}</td>)}
                      </tr>;
                    })}
                  </tbody>
                </Table>
              }
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>}
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" aria-label={"Cancel"} onClick={onClose}>
          Cancel
        </HCButton>
        <HCButton key="submit" variant="primary" aria-label={"Export"} onClick={onOk} disabled={limit <= 0}>
          Export
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );
};

export default QueryExportModal;
