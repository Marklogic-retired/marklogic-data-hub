import React, {useState, useEffect} from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import {XCircleFill, Search} from "react-bootstrap-icons";
import styles from "./hc-search.module.scss";
import {themeColors} from "@config/themes.config";

interface Props {
  id?: string;
  value?: any;
  style?: React.CSSProperties;
  className?: string;
  classNameFull?: string;
  size?: "lg" | "sm";
  placeholder?: string;
  type?: string;
  min?: number | string;
  ariaLabel?: string;
  dataTestid?: string;
  dataCy?: string;
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  addonBefore?: string | React.ReactNode;
  allowClear?: boolean;
  onBlur?: any;
  onChange?: any;
  onFocus?: any;
  onKeyPress?: any;
  onPressEnter?: any;
  ref?: any;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  classNameErrorMessage?: string;
  enterButton?: boolean | React.ReactNode;
  onSearch?: any;
}

function HCSearch(props: Props) {
  const [showIconClear, setShowIconClear] = useState(false);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [focusedInput, setFocusedInput] = useState(false);

  const handleKeyPressEnter = event => {
    let enterKeyPressed = false;
    if (event.key === "Enter") {
      enterKeyPressed = true;
    }
    return enterKeyPressed;
  };
  const handleMessage = (event, onChange) => {
    let newMessage = event.currentTarget.value;
    setCount(newMessage.length);

    if (newMessage.length > 0) {
      setShowIconClear(true);
    } else {
      setShowIconClear(false);
    }

    setMessage(newMessage);
    if (onChange) {
      onChange(event);
    }
  };
  useEffect(() => {}, [message]);
  useEffect(() => {}, [count]);

  const handleOnFocus = (event, onFocus) => {
    if (event) {
      setFocusedInput(true);
    }
    if (onFocus) {
      onFocus(event);
    }
  };
  useEffect(() => {}, [focusedInput]);

  const handleOnBlur = (event, onBlur) => {
    if (event) {
      setFocusedInput(false);
    }
    if (onBlur) {
      onBlur(event);
    }
  };

  useEffect(() => {
    if (props?.value) {
      setMessage(props.value);
      if (props?.allowClear) {
        setShowIconClear(true);
      }
    }
  }, [props?.value]);

  return (
    <>
      <InputGroup
        style={props?.style}
        className={[
          props.className,
          props?.disabled
            ? styles.inputGroupWrapperDisabled
            : props?.error && showIconClear && focusedInput
              ? styles.inputGroupWrapper
              : focusedInput && props?.error
                ? styles.inputGroupWrapperErrorFocus
                : props?.error
                  ? styles.inputGroupWrapperError
                  : focusedInput
                    ? styles.inputGroupWrapperFocus
                    : styles.inputGroupWrapper,
        ].join(" ")}
      >
        {props?.prefix ? (
          <InputGroup.Text
            style={{backgroundColor: !props?.disabled ? "white" : ""}}
            className={[props.classNameFull, styles.noBorders].join(" ")}
            data-testid={"hc-input-prefix"}
          >
            {props.prefix}
          </InputGroup.Text>
        ) : null}

        {props?.addonBefore ? (
          typeof props.addonBefore === "string" ? (
            <InputGroup.Text data-testid={"hc-input-addonBefore"}>{props.addonBefore}</InputGroup.Text>
          ) : (
            props.addonBefore
          )
        ) : null}

        <Form.Control
          id={props?.id}
          value={message}
          className={[props?.classNameFull, styles.noBorders].join(" ")}
          style={{paddingLeft: 10, fontSize: 16}}
          size={props?.size}
          placeholder={props?.placeholder}
          type={props?.type}
          min={props?.min}
          aria-label={props?.ariaLabel}
          data-testid={props?.dataTestid ? props.dataTestid : "hc-inputSearch-component"}
          data-cy={props?.dataCy}
          onBlur={event => handleOnBlur(event, props?.onBlur)}
          onFocus={event => handleOnFocus(event, props?.onFocus)}
          onChange={event => handleMessage(event, props?.onChange)}
          onKeyPress={event =>
            props?.onPressEnter
              ? handleKeyPressEnter(event)
                ? props?.onPressEnter(true, message)
                : false
              : props?.onKeyPress
          }
          ref={props?.ref}
          disabled={props?.disabled}
        />

        {props?.allowClear && !props?.disabled && (
          <InputGroup.Text
            style={{backgroundColor: "white", padding: props?.suffix ? 2 : ""}}
            className={[props.classNameFull, styles.noBorders].join(" ")}
          >
            {showIconClear ? (
              <XCircleFill
                className={styles.cleanIcon}
                onClick={() => {
                  if (showIconClear) setMessage("");
                  setShowIconClear(false);
                  return props?.onSearch("");
                }}
                data-testid={"hc-input-allowClear"}
              />
            ) : (
              <XCircleFill className={styles.cleanIconHide} />
            )}
          </InputGroup.Text>
        )}

        {!props?.allowClear && !props?.disabled && (
          <InputGroup.Text
            style={{backgroundColor: "white", padding: props?.suffix ? 2 : ""}}
            className={[props.classNameFull, styles.noBorders].join(" ")}
          >
            {props?.error && !showIconClear ? <XCircleFill className={styles.warningIcon} /> : null}
          </InputGroup.Text>
        )}

        {props?.suffix ? (
          <InputGroup.Text
            style={{backgroundColor: !props?.disabled ? "white" : ""}}
            className={[props.classNameFull, styles.noBorders].join(" ")}
            data-testid={"hc-input-suffix"}
          >
            {props.suffix}
          </InputGroup.Text>
        ) : null}

        {
          <InputGroup.Text
            style={{
              backgroundColor: !props?.disabled && props?.enterButton ? themeColors.primary : "transparent",
              cursor: "pointer",
            }}
            className={[
              props.classNameFull,
              styles.noBorders,
              !props?.enterButton ? "" : props?.enterButton === true ? styles.enterButton : styles.searchWord,
            ].join(" ")}
            data-testid={"hc-inputSearch-btn"}
            onClick={() => (props?.onSearch ? props?.onSearch(message) : false)}
          >
            {props?.enterButton === true ? (
              <Search className={styles.searchIcon} data-testid={"hc-inputSearch-btn1"} />
            ) : props?.enterButton ? (
              props?.enterButton
            ) : (
              <Search className={styles.searchIconGrey} data-testid={"hc-inputSearch-btn2"} />
            )}
          </InputGroup.Text>
        }
      </InputGroup>
      {props?.errorMessage && !showIconClear && (
        <span className={[styles.errorMessage, props?.classNameErrorMessage].join(" ")}>{props.errorMessage}</span>
      )}
    </>
  );
}

export default HCSearch;
