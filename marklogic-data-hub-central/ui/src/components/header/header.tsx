import React, {useContext, useState} from "react";
import {RouteComponentProps, withRouter, useHistory} from "react-router-dom";
import axios from "axios";
import {Layout, Icon, Avatar, Menu, Dropdown} from "antd";
import {UserContext} from "../../util/user-context";
import {ModelingContext} from "../../util/modeling-context";
import logo from "./logo.svg";
import styles from "./header.module.scss";
import {Application} from "../../config/application.config";
import {MLButton, MLTooltip} from "@marklogic/design-system";
import SystemInfo from "./system-info";
import ConfirmationModal from "../confirmation-modal/confirmation-modal";
import {ConfirmationType} from "../../types/common-types";

interface Props extends RouteComponentProps<any> {
  environment: any
}

const Header:React.FC<Props> = (props) => {
  const {user, userNotAuthenticated, handleError} = useContext(UserContext);
  const {modelingOptions, clearEntityModified} = useContext(ModelingContext);

  const [systemInfoVisible, setSystemInfoVisible] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [showUserDropdown, toggleUserDropdown] = useState(false);
  const history = useHistory();

  const logoRef = React.createRef<HTMLAnchorElement>();
  const titleRef = React.createRef<HTMLDivElement>();
  const serviceNameRef = React.createRef<HTMLElement>();
  const helpLinkRef = React.createRef<HTMLAnchorElement>();
  const userDropdownRef = React.createRef<HTMLSpanElement>();

  const handleLogout = () => {
    if (modelingOptions.isModified) {
      toggleConfirmModal(true);
    } else {
      confirmLogout();
    }
  };

  const confirmLogout = async () => {
    try {
      let response = await axios(`/api/logout`);
      if (response.status === 200) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    }
    clearEntityModified();
    toggleConfirmModal(false);
    toggleUserDropdown(false);
  };

  const handleSystemInfoDisplay = () => {
    toggleUserDropdown(false);
    axios.get("/api/environment/systemInfo")
      .then(res => {
        setSystemInfoVisible(true);
      })
      // Timeouts throw 401s and are caught here
      .catch(err => {
        if (err.response) {
          handleError(err);
        } else {
          history.push("/noresponse");
        }
      });
  };

  const getVersionLink = () => {
    let versionNum = parseVersion(props.environment.dataHubVersion);
    return "https://docs.marklogic.com/datahub/" + versionNum;
  };

  const parseVersion = (value) => {
    if (value === "") {
      return "";
    } else {
      let version = "";
      let flag = false;
      for (let c in value) {
        if (value[c] !== "." && value[c] !== "-") {
          version += value[c];
        } else if (value[c] === "." && flag === false) {
          flag = true;
          version += value[c];
        } else {
          break;
        }
      }
      return version;
    }
  };

  const logoutKeyDownHandler = (event) => {
    if (event.key === "Tab") {
      toggleUserDropdown(false);
    }
    if (event.key === "Escape") { toggleUserDropdown(false); }
  };

  let userMenu = <div className={styles.userMenu}>
    <div className={styles.username}>{localStorage.getItem("dataHubUser")}</div>
    <div className={styles.logout}>
      <MLButton id="logOut" type="primary" size="default"
        onClick={handleLogout} onKeyDown={logoutKeyDownHandler} tabIndex={1}>
        Log Out
      </MLButton>
    </div>
  </div>;

  const serviceNameKeyDownHandler = (event) => {
    if (event.key === "Enter") { handleSystemInfoDisplay(); }

    if (event.key === "ArrowRight") { helpLinkRef.current!.focus(); }
    if (event.key === "ArrowLeft") { titleRef.current!.focus(); }
  };

  const serviceNameClickHandler = (event) => {
    event.preventDefault();
    handleSystemInfoDisplay();
  };

  const helpLinkKeyDownHandler = (event) => {
    if (event.key === "ArrowRight") { userDropdownRef.current!.focus(); }
    if (event.key === "ArrowLeft") { serviceNameRef.current!.focus(); }
  };

  const helpLinkClickHandler = (event) => {
    event.preventDefault();
    helpLinkRef.current!.click();
  };

  const userIconKeyDownHandler = (event) => {
    if (event.key === "Enter") { toggleUserDropdown(!showUserDropdown); }
    if (event.key === "ArrowLeft") { helpLinkRef.current!.focus(); }
    if (event.key === "Escape") { toggleUserDropdown(false); }
  };

  const userDropdownClickHandler = (event) => {
    event.preventDefault();
    toggleUserDropdown(!showUserDropdown);
  };

  let infoContainer = <div aria-label="info-text">
      Data Hub Version: <strong>{props.environment.dataHubVersion}</strong><br/>
      MarkLogic Version: <strong>{props.environment.marklogicVersion}</strong><br/>
      Service Name: <strong>{props.environment.serviceName}</strong><br/><br/>
      Click to see details, to download configuration files, and to clear user data.
  </div>;

  let globalIcons;
  if (user.authenticated) {
    globalIcons =
    <div className={styles.iconsContainerAuth}>
      <Menu
        id="global-icons"
        className={styles.globalIcons}
        mode="horizontal"
        theme="dark"
      >
        <Menu.Item>
          <MLTooltip title={infoContainer} placement={"bottomLeft"} overlayClassName={styles.infoTooltip}>
            <i id="service-name" aria-label="service-details" className={styles.serviceName} tabIndex={1} ref={serviceNameRef}
              onMouseDown={serviceNameClickHandler} onKeyDown={serviceNameKeyDownHandler}>
              <Icon type="info-circle" className={styles.infoIcon}/>
            </i>
          </MLTooltip>
        </Menu.Item>
        <div className={styles.vertical}></div>
        {/* <Menu.Item>
          <MLTooltip title="Search"><Icon type="search"/></MLTooltip>
        </Menu.Item> */}
        <Menu.Item>
          <MLTooltip title="Help" overlayClassName={styles.infoTooltip}>
            <div className={styles.helpIconContainer}>
              <a id="help-link" aria-label="help-link" className={styles.helpIconLink} href={getVersionLink()} target="_blank"
                tabIndex={1} ref={helpLinkRef} onKeyDown={helpLinkKeyDownHandler} onMouseDown={helpLinkClickHandler}>
                <Icon type="question-circle" className={styles.helpIcon}/>
              </a>
            </div>
          </MLTooltip>
        </Menu.Item>
        {/* <Menu.Item>
          <MLTooltip title="Settings"><Icon type="setting"/></MLTooltip>
        </Menu.Item> */}
        <Dropdown overlay={userMenu} className={styles.userDropDown} visible={showUserDropdown}>
          {/*
            to revert to previous behavior of open/close on hover, remove visible={...} property from above
            to allow open/close on click, add trigger={['click'], ['hover']} property (DO NOT ADD 'contextmenu'!)
            note that this disables open/close on enter key
          */}
          <span
            aria-label="user-dropdown" tabIndex={1} ref={userDropdownRef} onKeyDown={userIconKeyDownHandler}
            onMouseDown={userDropdownClickHandler}
          >
            {/*
              possible modifications
                hover: onMouseOver={toggleUserDropdown(true)}  not used; makes dropdown feel clunky
                un-hover: onMouseOut={toggleUserDropdown(false)}  DO NOT USE: impossible to click on the logout button
            */}
            <MLTooltip title="User" overlayClassName={styles.infoTooltip}><Icon type="user" className={styles.userIcon}/></MLTooltip>
          </span>
        </Dropdown>
      </Menu>
    </div>;
  } else {
    globalIcons =
    <div className={styles.iconsContainer}>
      <Menu
        id="global-icons"
        className={styles.globalIcons}
        mode="horizontal"
        theme="dark"
      >
        <Menu.Item>
          <MLTooltip title="Help">
            <div className={styles.helpIconContainer}>
              <a id="help-link" href="https://docs.marklogic.com/datahub/" target="_blank" tabIndex={1} className={styles.helpIconLink}>
                <Icon type="question-circle" className={styles.helpIcon}/>
              </a>
            </div>
          </MLTooltip>
        </Menu.Item>
      </Menu>
    </div>;
  }

  const handleHomeClick = (event) => {
    event.preventDefault();
    props.history.push("/tiles");
  };

  const logoKeyDownHandler = (event) => {
    if (event.key === "ArrowRight") { titleRef.current!.focus(); }
  };

  const logoClickHandler = (event) => {
    event.preventDefault();
    logoRef.current!.click();
  };

  const titleKeyDownHandle = (event) => {
    if (event.key === "Enter") { handleHomeClick(event); }

    if (event.key === "ArrowRight") { serviceNameRef.current!.focus(); }
    if (event.key === "ArrowLeft") { logoRef.current!.focus(); }
  };

  return (
    <>
      <Layout.Header className={styles.container}>
        <div className={styles.logoContainer} aria-label="header-logo">
          <a href="https://www.marklogic.com/" aria-label="logo-link" className={styles.logo} tabIndex={1} ref={logoRef}
            onKeyDown={logoKeyDownHandler} onMouseDown={logoClickHandler}>
            <Avatar className={styles.logo} src={logo} />
          </a>
          <div className={styles.vertical}></div>
        </div>
        <div className={styles.titleContainer} aria-label="title-container">
          <div id="title" className={styles.title} aria-label="title-link" tabIndex={1} ref={titleRef}
            onMouseDown={handleHomeClick} onKeyDown={titleKeyDownHandle}>
            {Application.title}
          </div>
        </div>
        {globalIcons}
      </Layout.Header>
      <SystemInfo
        serviceName={props.environment.serviceName}
        dataHubVersion={props.environment.dataHubVersion}
        marklogicVersion={props.environment.marklogicVersion}
        systemInfoVisible={systemInfoVisible}
        setSystemInfoVisible={setSystemInfoVisible}
      />
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={ConfirmationType.NavigationWarn}
        boldTextArray={[]}
        toggleModal={toggleConfirmModal}
        confirmAction={confirmLogout}
      />
    </>
  );
};

export default withRouter(Header);
