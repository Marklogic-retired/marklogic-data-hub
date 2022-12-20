import React, {useState, useEffect} from "react";
import styles from "./list-modal.module.scss";
import {Modal, Row, Col, Form, FormLabel} from "react-bootstrap";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {themeColors} from "@config/themes.config";
import {HCTooltip} from "@components/common";
import {HCButton} from "@components/common";
import {Typeahead} from "react-bootstrap-typeahead";
import {HCInput} from "@components/common";

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  action: string;
  listName?: string;
  listValues?: string[];
  confirmAction: () => void;
};

const ListModal: React.FC<Props> = (props) => {
  const [listNameErrorMessage, setListNameErrorMessage] = useState("");
  const [listValuesErrorMessage, setListValuesErrorMessage] = useState("");
  const [listName, setListName] = useState(props?.listName);
  const [listValues, setListValues] = useState<any>(props?.listValues);
  const [selected, setSelected] = useState<any>([]);
  let textModalHeader = "";

  const onSubmit = (event) => {
    resetModalValuesIgnore();
    let formError = false;
    if (!listName) { setListNameErrorMessage("A title for this list is required."); formError = true; }
    if (!listValues || listValues.length === 0) { setListValuesErrorMessage("Values to ignore in this list are required."); formError = true; }
    if (formError) {
      event.stopPropagation();
    } else {
      confirmAction();
    }
  };

  const closeModal = () => {
    resetModalValuesIgnore();
    props.toggleModal(false);
  };

  const confirmAction = async () => {
    if (props.action === "A") {
      //console.log("create new list");
    } else if (props.action === "C") {
      //console.log("copy list");
    } else if (props.action === "E") {
      //console.log("edit list");
    } else if (props.action === "D") {
      //console.log("delete list");
    }
    props.toggleModal(false);
  };

  if (props.action) {
    if (props.action === "A") {
      textModalHeader = "Create New";
    } else if (props.action === "C") {
      textModalHeader = "";
    } else if (props.action === "E") {
      textModalHeader = "Edit";
    } else if (props.action === "D") {
      textModalHeader = "Delete";
    }
  }

  const resetModalValuesIgnore = () => {
    setListNameErrorMessage("");
    setListValuesErrorMessage("");
  };

  useEffect(() => {
    setListValues(props.listValues);
  }, [props?.listValues]);

  const handleListValues = (selections) => {
    if (Array.isArray(selections)) {
      resetModalValuesIgnore();
      // Remove duplicated values
      const filteredSelections = selections.filter(
        (item, index, arr) =>
          index === arr.findIndex((t) => t.label === item.label)
      );
      if (selections.length !== filteredSelections.length) setListValuesErrorMessage("Duplicated values is not allowed");
      setListValues(filteredSelections);
      setSelected(filteredSelections);
    }

  };

  useEffect(() => {
    setListName(props.listName);
  }, [props?.listName]);

  return (
    <Modal
      show={props.isVisible}
      data-testid="modal-list-ignore"
    >
      <Modal.Header className={`bb-none ${styles.modalHeader}`}>
        <div className={`flex-column ${styles.modalTitleLegend}`}>{`${textModalHeader} List`}</div>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
      </Modal.Header>

      <Modal.Body className={"pt-4 px-3"}>
        <Form
          id="form-modal-values-to-ignore"
          onSubmit={() => {}}
          className={"container-fluid"}
        >
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Title:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col className={listNameErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id={`${textModalHeader}-values-to-ignore-input`}
                ariaLabel={`${textModalHeader}-values-to-ignore-input`}
                placeholder="Enter title"
                className={styles.inputTitle}
                value={props?.listName ? props.listName : ""}
                onChange={(e) => setListName(e.target.value.trim())}
              />
            </Col>
            <Row>
              <Col xs={3}></Col>
              <Col xs={9} className={styles.validationErrorIgnore} id="errorListName" data-testid={"ListNameErrorMessage"}>{listNameErrorMessage}</Col>
            </Row>
          </Row>

          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"List values:"}<span className={styles.asterisk}>*</span></FormLabel>

            <Col className={"d-flex align-items-center"}>
              {/* const CustomSelectionsExample = () => ( */}
              <Typeahead
                className={styles.typeaheadList}
                allowNew
                id="custom-selections"
                multiple
                defaultSelected={props.action !== "E" ? [] :
                  props?.listValues ? props.listValues : []}
                newSelectionPrefix="Add the new value: "
                options={[]}
                placeholder="Enter values to remove"
                onChange={(e) => { handleListValues(e); }}
                selected={selected}
              />

              <div className={"p-2 d-flex align-items-center"}>
                <HCTooltip text={<span aria-label="reduce-tooltip-text">{"Documents containing these values will be ignored during matching."}</span>} id="list-tooltip" placement="top">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.icon} size={13} aria-label="icon: question-circle" />
                </HCTooltip>
              </div>
            </Col>
            <Row>
              <Col xs={3}></Col>
              <Col xs={9} className={styles.validationErrorIgnore} id="errorListValues" data-testid={"ListValuesErrorMessage"}>{listValuesErrorMessage}</Col>
            </Row>
          </Row>
          <div className={styles.footer}>
            <HCButton
              size="sm"
              variant="outline-light"
              aria-label={`cancel-list-ignore`}
              onClick={closeModal}
            >Cancel</HCButton>
            <HCButton
              className={styles.saveButton}
              aria-label={`confirm-list-ignore`}
              variant="primary"
              size="sm"
              onClick={(e) => onSubmit(e)}
            >Save</HCButton>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ListModal;
