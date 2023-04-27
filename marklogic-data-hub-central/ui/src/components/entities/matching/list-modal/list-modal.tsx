import React, {useState, useEffect} from "react";
import styles from "./list-modal.module.scss";
import {Modal, Row, Col, Form, FormLabel, Overlay, Tooltip} from "react-bootstrap";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {themeColors} from "@config/themes.config";
import {HCButton} from "@components/common";
import {Typeahead} from "react-bootstrap-typeahead";
import {HCInput} from "@components/common";
import {createEditExcludeValuesList} from "@api/matching";

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  action: string;
  listName?: string;
  listValues?: string[];
  confirmAction: () => void;
  updateListValues: () => void;
  checkIfExistInList: (name: string) => boolean;
};

const ListModal: React.FC<Props> = props => {
  const [listNameErrorMessage, setListNameErrorMessage] = useState<any>("");
  const [listValuesErrorMessage, setListValuesErrorMessage] = useState<any>("");
  const [listName, setListName] = useState<any>("");
  const [listNameOrigin, setListNameOrigin] = useState<any>("");
  const [listValues, setListValues] = useState<any>([]);
  const [selected, setSelected] = useState<any>([]);
  let textModalHeader = "";

  const [show, setShow] = useState(false);
  const target = React.useRef(null);
  const container = React.useRef(null);

  useEffect(() => {
    if (props.isVisible) {
      const fixData = props.listValues?.map(item => {
        return {label: item};
      });
      switch (props.action) {
      case "A":
        setListName("");
        setListValues([]);
        setSelected([]);
        break;
      case "E":
        setListName(props.listName);
        setListNameOrigin(props.listName);
        setListValues(fixData);
        setSelected(fixData);
        break;
      case "C":
        setListName("");
        setListValues(fixData);
        setSelected(fixData);
        break;
      }
    }
    return () => {
      setListName("");
    };
  }, [props.isVisible, props.action]);

  const checkListNameRules = listName => {
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/; // Start with a letter or number and detect special characters excluding "_" and "-"
    return !regex.test(listName);
  };
  const onSubmit = async event => {
    resetModalValuesIgnore();
    let formError = false;
    if (!listName) {
      setListNameErrorMessage({id: "titleRequired", highlight: ""});
      formError = true;
    }
    if (!listValues || listValues.length === 0) {
      setListValuesErrorMessage({id: "valuesRequired", highlight: ""});
      formError = true;
    }
    if (checkListNameRules(listName) && listName !== "") {
      setListNameErrorMessage({id: "stringRule", highlight: ""});
      formError = true;
    }
    if (props.checkIfExistInList(listName) && (props.action === "A" || props.action === "C")) {
      setListNameErrorMessage({id: "listAlreadyExists", highlight: listName});
      formError = true;
    }
    let responseCreateList = true;
    if ((props.action === "A" || props.action === "C") && !formError) {
      responseCreateList = await createEditExcludeValuesList(
        listName,
        listValues.map(item => item.label),
      );
    }
    if (props.action === "E" && !formError) {
      responseCreateList = await createEditExcludeValuesList(
        listName,
        listValues.map(item => item.label),
        listNameOrigin,
      );
    }
    if (formError && responseCreateList) {
      event.stopPropagation();
    } else {
      confirmAction();
      props.updateListValues();
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

  const handleListValues = selections => {
    if (Array.isArray(selections)) {
      resetModalValuesIgnore();
      let ruleError = false;
      // Remove duplicated values
      const filteredSelections = selections.filter((item, index, arr) => {
        if (checkListNameRules(item.label)) {
          ruleError = true;
          setListValuesErrorMessage({id: "stringRule", highlight: ""});
          return false;
        }
        return index === arr.findIndex(t => t.label === item.label);
      });
      if (selections.length !== filteredSelections.length && !ruleError) {
        setListValuesErrorMessage({id: "DuplicatedValue", highlight: selections[selections.length - 1].label});
      }
      setListValues(filteredSelections);
      setSelected(filteredSelections);
    }
  };

  const listValueTooltip = (
    <>
      <i ref={target}>
        <QuestionCircleFill
          color={themeColors.defaults.questionCircle}
          className={styles.icon}
          size={13}
          aria-label="icon: question-circle"
          onMouseOver={e => setShow(true)}
          onMouseLeave={e => setShow(false)}
          onFocus={e => setShow(true)}
          onBlur={e => setShow(false)}
          tabIndex={0}
        />
      </i>
      <Overlay target={target.current} show={show} placement="top" container={container}>
        {props => (
          <Tooltip id="list-tooltip" {...props}>
            <span aria-label="reduce-tooltip-text">
              {"Documents containing these values will be ignored during matching."}
            </span>
          </Tooltip>
        )}
      </Overlay>
    </>
  );

  const processListValueErrorMessage = listValuesErrorMessage => {
    let errorMessage;
    switch (listValuesErrorMessage.id) {
    case "DuplicatedValue":
      errorMessage = (
        <>
            The value <b>{listValuesErrorMessage.highlight}</b> already exists in this list.
        </>
      );
      break;
    case "stringRule":
      errorMessage = <>Names must start with a letter and can contain letters, numbers, hyphens, and underscores.</>;
      break;
    case "valuesRequired":
      errorMessage = <>Values to ignore in this list are required.</>;
      break;
    }
    return errorMessage;
  };

  const processListNameErrorMessage = listNameErrorMessage => {
    let errorMessage;
    switch (listNameErrorMessage.id) {
    case "stringRule":
      errorMessage = <>Names must start with a letter and can contain letters, numbers, hyphens, and underscores.</>;
      break;
    case "titleRequired":
      errorMessage = <>A title for this list is required.</>;
      break;
    case "listAlreadyExists":
      errorMessage = (
        <>
            An existing list is already using the name <b>{listNameErrorMessage.highlight}</b>.
        </>
      );
      break;
    }
    return errorMessage;
  };

  return (
    <Modal show={props.isVisible} data-testid="modal-list-ignore" onHide={closeModal}>
      <Modal.Header className={`bb-none ${styles.modalHeader}`}>
        <div className={`flex-column ${styles.modalTitleLegend}`}>{`${textModalHeader} List`}</div>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal} />
      </Modal.Header>

      <Modal.Body className={"pt-4 px-3"}>
        <Form id="form-modal-values-to-ignore" onSubmit={() => {}} className={"container-fluid"} ref={container}>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>
              {"Title:"}
              <span className={styles.asterisk}>*</span>
            </FormLabel>
            <Col className={listNameErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id={`${textModalHeader}-values-to-ignore-input`}
                ariaLabel={`${textModalHeader}-values-to-ignore-input`}
                placeholder="Enter title"
                className={styles.inputTitle}
                value={listName}
                onChange={e => setListName(e.target.value.trim())}
              />
            </Col>
            <Row>
              <Col xs={3} />
              <Col
                xs={9}
                className={styles.validationErrorIgnore}
                id="errorListName"
                data-testid={"ListNameErrorMessage"}
              >
                {processListNameErrorMessage(listNameErrorMessage)}
              </Col>
            </Row>
          </Row>

          <Row className={"mb-3"}>
            <FormLabel column lg={3}>
              {"List values:"}
              <span className={styles.asterisk}>*</span>
            </FormLabel>

            <Col className={"d-flex align-items-center"}>
              {/* const CustomSelectionsExample = () => ( */}
              <Typeahead
                className={styles.typeaheadList}
                allowNew
                id="custom-selections"
                multiple
                newSelectionPrefix="Add the new value: "
                options={[]}
                placeholder="Enter values to remove"
                onChange={e => {
                  handleListValues(e);
                }}
                selected={selected}
                tabIndex={0}
              />

              <div className={"p-2 d-flex align-items-center"}>{listValueTooltip}</div>
            </Col>
            <Row>
              <Col xs={3} />
              <Col
                xs={9}
                className={styles.validationErrorIgnore}
                id="errorListValues"
                data-testid={"ListValuesErrorMessage"}
              >
                {processListValueErrorMessage(listValuesErrorMessage)}
              </Col>
            </Row>
          </Row>
          <div className={styles.footer}>
            <HCButton size="sm" variant="outline-light" aria-label={`cancel-list-ignore`} onClick={closeModal}>
              Cancel
            </HCButton>
            <HCButton
              className={styles.saveButton}
              aria-label={`confirm-list-ignore`}
              variant="primary"
              size="sm"
              onClick={e => onSubmit(e)}
            >
              Save
            </HCButton>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ListModal;
