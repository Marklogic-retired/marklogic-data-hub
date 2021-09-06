import React, {useState, useContext} from "react";
import {Modal, Form, Input, Radio} from "antd";
import {SearchContext} from "../../../../util/search-context";
import styles from "./save-query-modal.module.scss";
import {UserContext} from "../../../../util/user-context";
import {QueryOptions} from "../../../../types/query-types";
import HCButton from "../../../common/hc-button/hc-button";


interface Props {
  setSaveModalVisibility: () => void;
  saveNewQuery: (queryName: string, queryDescription: string, facets: {}) => void;
  greyFacets: any[];
  toggleApply: (clicked: boolean) => void;
  toggleApplyClicked: (clicked: boolean) => void;
  currentQueryName: string;
  setCurrentQueryName: (name: string) => void;
  setSaveNewIconVisibility: (clicked: boolean) => void;
  currentQueryDescription: string;
  setCurrentQueryDescription: (description: string) => void;
  resetYesClicked: boolean;
  setColumnSelectorTouched: (state: boolean) => void;
  existingQueryYesClicked: boolean;
}

const SaveQueryModal: React.FC<Props> = (props) => {

  const {
    clearAllGreyFacets,
    greyedOptions,
    setAllSearchFacets,
    searchOptions,
    applySaveQuery,
    setAllGreyedOptions,
    setEntity
  } = useContext(SearchContext);

  const {
    handleError
  } = useContext(UserContext);

  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [radioOptionClicked, setRadioOptionClicked] = useState(0);
  const [errorMessage, setErrorMessage] = useState<any>("");

  const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
  };

  const onCancel = () => {
    props.setSaveModalVisibility();
  };
  const onOk = async () => {
    let facets = {...searchOptions.selectedFacets};
    let selectedFacets = facets;
    let greyedFacets = greyedOptions.selectedFacets;
    switch (radioOptionClicked) {
    case 1:
      facets = {...facets, ...greyedOptions.selectedFacets};
      setAllSearchFacets(facets);
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
      break;
    case 2:
      break;
    case 3:
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
    }
    try {
      await props.saveNewQuery(queryName.trim(), queryDescription, facets);
      props.setSaveNewIconVisibility(false);
      props.setSaveModalVisibility();
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
      props.setCurrentQueryName(queryName);
      props.setCurrentQueryDescription(queryDescription);
      if (props.resetYesClicked) {
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
      props.setColumnSelectorTouched(false);
      props.existingQueryYesClicked && setEntity(searchOptions.nextEntityType);
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
          setAllSearchFacets(selectedFacets);
          setAllGreyedOptions(greyedFacets);
        }
      } else {
        handleError(error);
      }
    }
  };

  const handleChange = (event) => {
    if (event.target.id === "save-query-name") {
      setQueryName(event.target.value);
    }
    if (event.target.id === "save-query-description") {
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
      onOk={() => onOk()}
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
            id="save-query-name"
            value={queryName}
            placeholder={"Enter query name"}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          colon={false}
          label="Description:"
          labelAlign="left"
        >
          <Input
            id="save-query-description"
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
            <HCButton variant="outline-light" id="save-query-cancel-button" onClick={() => onCancel()}>Cancel</HCButton>
            &nbsp;&nbsp;
            <HCButton variant="primary"
              type="submit"
              disabled={queryName.length === 0}
              onClick={() => onOk()} id="save-query-button">Save
            </HCButton>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SaveQueryModal;


