import React, {useState, useContext, useEffect} from "react";
import {Modal, Form, Input, Radio, Button} from "antd";
import {SearchContext} from "../../../../util/search-context";
import styles from "../save-query-modal/save-query-modal.module.scss";
import axios from "axios";
import {UserContext} from "../../../../util/user-context";
import {QueryOptions} from "../../../../types/query-types";


interface Props {
    setSaveChangesModalVisibility: () => void;
    savedQueryList: any[];
    getSaveQueryWithId: (key: {}) => void;
    greyFacets: any[];
    toggleApply: (clicked: boolean) => void;
    toggleApplyClicked: (clicked: boolean) => void;
    setSaveNewIconVisibility: (clicked: boolean) => void;
    currentQuery: any,
    currentQueryName: string;
    setCurrentQueryDescription: (description: string) => void;
    setCurrentQueryName: (name: string) => void;
    nextQueryName: string;
    setCurrentQueryOnEntityChange: () => void;
    isSaveQueryChanged: () => boolean;
    entityQueryUpdate: boolean;
    toggleEntityQueryUpdate: () => void;
    resetYesClicked: boolean
    setColumnSelectorTouched: (state: boolean) => void;
}

const SaveChangesModal: React.FC<Props> = (props) => {

  const {
    clearAllGreyFacets,
    greyedOptions,
    setAllSearchFacets,
    searchOptions,
    applySaveQuery,
    setAllGreyedOptions
  } = useContext(SearchContext);

  const {
    handleError
  } = useContext(UserContext);


  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [radioOptionClicked, setRadioOptionClicked] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [previousQueryName, setPreviousQueryName] = useState("");

  const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
  };

  const onCancel = () => {
    props.setSaveChangesModalVisibility();
  };

  // TO EXTRACT NAME AND DESCRIPTION FROM CURRENT QUERY
  useEffect(() => {
    if (props.currentQuery && JSON.stringify(props.currentQuery) !== JSON.stringify({}) && props.currentQuery.hasOwnProperty("savedQuery") && props.currentQuery.savedQuery.hasOwnProperty("name")) {
      setPreviousQueryName(props.currentQuery.savedQuery.name);
      setQueryName(props.currentQuery.savedQuery.name);
      if (props.currentQuery.savedQuery.hasOwnProperty("description")) {
        setQueryDescription(props.currentQuery.savedQuery.description);
      }
    }
  }, [props.currentQuery, props.nextQueryName]);

  const onOk = async (queryName, queryDescription, currentQuery) => {
    let facets = {...searchOptions.selectedFacets};
    let selectedFacets = {...searchOptions.selectedFacets};
    let greyedFacets = greyedOptions.selectedFacets;
    switch (radioOptionClicked) {
    case 1:
      facets = {...facets, ...greyedOptions.selectedFacets};
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
      break;
    case 2:
      setAllGreyedOptions(greyedFacets);
      break;
    case 3:
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
    }
    props.setColumnSelectorTouched(false);
    try {
      currentQuery.savedQuery.name = queryName.trim();
      currentQuery.savedQuery.description = queryDescription;
      if (currentQuery.hasOwnProperty("savedQuery") && currentQuery.savedQuery.hasOwnProperty("query")) {
        currentQuery.savedQuery.query.selectedFacets = facets;
        currentQuery.savedQuery.query.searchText = searchOptions.query;
        currentQuery.savedQuery.query.entityTypeIds = searchOptions.entityTypeIds;
      }
      currentQuery.savedQuery.propertiesToDisplay = searchOptions.selectedTableProperties;
      currentQuery.savedQuery.sortOrder = searchOptions.sortOrder;

      const response = await axios.put(`/api/entitySearch/savedQueries`, currentQuery);
      if (response.data) {
        props.setSaveChangesModalVisibility();
        if (props.currentQueryName && !props.entityQueryUpdate) {
          let options: QueryOptions = {
            searchText: searchOptions.query,
            entityTypeIds: searchOptions.entityTypeIds,
            selectedFacets: facets,
            selectedQuery: queryName,
            propertiesToDisplay: searchOptions.selectedTableProperties,
            zeroState: searchOptions.zeroState,
            sortOrder: searchOptions?.sortOrder || [],
            database: searchOptions.database,
          };
          applySaveQuery(options);
        }
        if (props.nextQueryName && !props.entityQueryUpdate) {
          for (let key of props.savedQueryList) {
            if (key.savedQuery.name === props.nextQueryName) {
              props.getSaveQueryWithId(key);
              break;
            }
          }
          props.setCurrentQueryName(props.nextQueryName);
        }
        if (props.entityQueryUpdate && !props.resetYesClicked) {
          props.setCurrentQueryOnEntityChange();
          props.toggleEntityQueryUpdate();
        }
        if (props.resetYesClicked && !props.entityQueryUpdate) {
          let options: QueryOptions = {
            searchText: "",
            entityTypeIds: [],
            selectedFacets: {},
            selectedQuery: "select a query",
            propertiesToDisplay: [],
            zeroState: true,
            sortOrder: [],
            database: "final",
          };
          applySaveQuery(options);
        }
        props.setCurrentQueryDescription(queryDescription);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
          setAllSearchFacets(selectedFacets);
          setAllGreyedOptions(greyedFacets);
          props.currentQuery.savedQuery.name = previousQueryName;
        }
      } else {
        handleError(error);
      }
    }
  };

  const handleChange = (event) => {
    if (event.target.id === "save-changes-query-name") {
      setQueryName(event.target.value);
    }
    if (event.target.id === "save-changes-query-description") {
      setQueryDescription(event.target.value);
    }
  };

  const unAppliedFacets = (e) => {
    setRadioOptionClicked(e.target.value);
  };

  return (
    <Modal
      visible={true}
      title={"Save Query"}
      closable={true}
      onCancel={() => onCancel()}
      maskClosable={true}
      footer={null}
    >
      <Form
        name="basic"
        {...layout}
      >
        <Form.Item
          colon={false}
          label={<span className={styles.text}>
                        Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
          </span>}
          labelAlign="left"
          validateStatus={errorMessage ? "error" : ""}
          help={errorMessage}
        >
          <Input
            id="save-changes-query-name"
            value={queryName}
            placeholder={"Enter query name"}
            className={styles.input}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          colon={false}
          label="Description:"
          labelAlign="left"
        >
          <Input
            id="save-changes-query-description"
            value={queryDescription}
            onChange={handleChange}
            placeholder={"Enter query description"}
          />
        </Form.Item>
        {props.greyFacets.length > 0 && <Form.Item
          colon={false}
          label="Unapplied Facets:"
          labelAlign="left"
        >
          <Radio.Group onChange={unAppliedFacets} style={{"marginTop": "11px"}} defaultValue={2}>
            <Radio value={1}> Apply before saving</Radio>
            <Radio value={2}> Save as is, keep unapplied facets</Radio>
            <Radio value={3}> Discard unapplied facets</Radio>
          </Radio.Group>
        </Form.Item>}
        <Form.Item>
          <div className={styles.submitButtons}>
            <Button id="edit-save-changes-cancel-button" onClick={() => onCancel()}>Cancel</Button>
                        &nbsp;&nbsp;
            <Button type="primary"
              htmlType="submit"
              disabled={queryName.length === 0}
              onClick={() => onOk(queryName, queryDescription, props.currentQuery)} id="edit-save-changes-button">Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SaveChangesModal;


