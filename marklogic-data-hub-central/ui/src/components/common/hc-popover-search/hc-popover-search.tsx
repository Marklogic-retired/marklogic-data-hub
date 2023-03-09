import React, {useState, useEffect, useCallback, useRef} from "react";
import {HCButton, HCInput} from "@components/common";
import {Search} from "react-bootstrap-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import styles from "./hc-popover-search.module.scss";

interface Props {
  // input props
  inputValue: string;
  inputId?: string;
  inputAriaLabel?: string;
  inputPlaceholder?: string;

  // dialog props
  popoverId?: string;
  popoverAriaLabel?: string;
  closeOnClickOutside?: boolean;

  // icon props
  searchIconId?: string;
  searchIconAriaLabel?: string;

  // button search props
  searchButtonText?: string;
  searchButtonId?: string;
  onSearch: (value: string) => void;

  // button reset props
  resetButtonText?: string;
  resetButtonId?: string;
  onReset: () => void;
}

const HCPopoverSearch: React.FC<Props> = ({
  inputValue,
  inputId,
  inputAriaLabel,
  inputPlaceholder,
  popoverId,
  popoverAriaLabel,
  closeOnClickOutside,
  searchIconId,
  searchIconAriaLabel,
  searchButtonText,
  searchButtonId,
  onSearch,
  resetButtonText,
  resetButtonId,
  onReset,
}: Props) => {
  const [searchText, setSearchText] = useState(inputValue);
  const [isVisible, setIsVisible] = useState(false);
  const [isEventValid, setIsEventValid] = useState(false);
  const popoverBodyRef: any = useRef();

  const toggleVisibility = () => {
    setIsEventValid(prev => true);
    setIsVisible(isVisible => !isVisible);
  };

  const handleOuterClick = useCallback(e => {
    if (popoverBodyRef.current && !popoverBodyRef.current.contains(e.target) && closeOnClickOutside) {
      // Clicked outside the popover
      hideDialog();
    }
  }, []);

  useEffect(() => {
    if (isEventValid) {
      document.addEventListener("click", handleOuterClick);
    }

    return () => {
      document.removeEventListener("click", handleOuterClick);
    };
  });

  const handleOnChange = ({target: {value}}) => {
    setSearchText(value);
  };

  const hideDialog = () => {
    setIsEventValid(false);
    setIsVisible(false);
  };

  const handleOnReset = event => {
    event.stopPropagation();
    hideDialog();
    setSearchText("");
    onReset();
  };

  const handleOnSearch = event => {
    event.stopPropagation();
    hideDialog();
    onSearch(searchText);
  };

  const serviceNameKeyDownHandler = async (event, component) => {
    //reset when user presses tab out of popover
    if (event.keyCode === 9) {
      if (!event.shiftKey) {
        if (component === "submitSearch") toggleVisibility();
      } else if (event.shiftKey) {
        if (component === "searchInput") toggleVisibility();
      }
    }

    //Make selection when user presses space or enter key
    if (event.keyCode === 13 || event.keyCode === 32) {
      if (component === "searchIcon") {
        if (
          event.target !== document.getElementById("searchInput-source") &&
          event.target !== document.getElementById("searchInput-entity") &&
          event.target !== document.getElementById("searchInput-settingns")
        ) {
          event.preventDefault();
          toggleVisibility();
        }
      }
      if (component === "submitReset") {
        handleOnReset(event);
      }
      if (component === "submitSearch") {
        handleOnSearch(event);
      }
    }
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={"position-relative d-inline-block"}
      tabIndex={0}
      onKeyDown={e => serviceNameKeyDownHandler(e, "searchIcon")}
    >
      <span>
        <FontAwesomeIcon
          className={isVisible || searchText ? styles.filterIconActive : styles.filterIcon}
          id={searchIconId}
          aria-label={searchIconAriaLabel || searchIconId}
          icon={faSearch}
          size="lg"
          onClick={() => toggleVisibility()}
        />
      </span>
      {isVisible && (
        <div
          id={popoverId}
          ref={popoverBodyRef}
          aria-label={popoverAriaLabel || popoverId}
          role="tooltip"
          className={`fade show popover bs-popover-bottom position-absolute top-100 start-50 translate-middle-x mt-1 ${styles.popoverStyle}`}
        >
          <div className={`popover-arrow ${styles.popoverIndicator}`} />
          <div className="popover-body">
            <HCInput
              id={inputId}
              ariaLabel={inputAriaLabel || inputId}
              placeholder={inputPlaceholder}
              value={searchText}
              onChange={handleOnChange}
              className={`${styles.searchInput} mb-2`}
              onKeyDown={e => serviceNameKeyDownHandler(e, "searchInput")}
            />
            <HCButton
              id={resetButtonId}
              data-testid={resetButtonId}
              variant="outline-light"
              size="sm"
              className={styles.resetButton}
              onClick={handleOnReset}
              onKeyDown={e => serviceNameKeyDownHandler(e, "submitReset")}
            >
              {resetButtonText}
            </HCButton>
            <HCButton
              id={searchButtonId}
              data-testid={searchButtonId}
              variant="primary"
              size="sm"
              className={styles.searchSubmitButton}
              onClick={handleOnSearch}
              onKeyDown={e => serviceNameKeyDownHandler(e, "submitSearch")}
            >
              <Search className={styles.searchIcon} />
              {searchButtonText}
            </HCButton>
          </div>
        </div>
      )}
    </div>
  );
};

HCPopoverSearch.defaultProps = {
  // input props
  inputId: "hc-popover-search-input",
  inputPlaceholder: "Search",

  // dialog props
  popoverId: "hc-popover-search",
  closeOnClickOutside: true,

  // icon props
  searchIconId: "hc-popover-search-search-icon",

  // button search props
  searchButtonText: "Search",
  searchButtonId: "hc-popover-search-search-button",

  // button reset props
  resetButtonText: "Reset",
  resetButtonId: "hc-popover-search-reset-button",
};

export default HCPopoverSearch;
