import React, {useContext, useState} from "react";
import {RouteComponentProps, withRouter, useHistory, Link} from "react-router-dom";
import axios from "axios";
import {Layout} from "antd";
import {UserContext} from "../../util/user-context";
import logo from "./logo.svg";
import styles from "./header.module.scss";
import {Application} from "../../config/application.config";
import SystemInfo from "./system-info";
import {Image, Nav, NavDropdown} from "react-bootstrap";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";
import {QuestionCircle} from "react-bootstrap-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {faUser} from "@fortawesome/free-regular-svg-icons";
import HCButton from "../common/hc-button/hc-button";

interface Props extends RouteComponentProps<any> {
  environment: any
}

const Header:React.FC<Props> = (props) => {
  const {user, userNotAuthenticated, handleError} = useContext(UserContext);

  const [systemInfoVisible, setSystemInfoVisible] = useState(false);
  const [showUserDropdown, toggleUserDropdown] = useState(false);
  const history = useHistory();

  const logoRef = React.createRef<HTMLAnchorElement>();
  const titleRef = React.createRef<HTMLDivElement>();
  const serviceNameRef = React.createRef<HTMLElement>();
  const helpLinkRef = React.createRef<HTMLAnchorElement>();
  const userDropdownRef = React.createRef<HTMLSpanElement>();

  const confirmLogout = async () => {
    try {
      let response = await axios(`/api/logout`);
      if (response.status === 200) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    }
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
      <HCButton id="logOut" variant="outline-light"
        onClick={confirmLogout} onKeyDown={logoutKeyDownHandler} tabIndex={1}>
        Log Out
      </HCButton>
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
      <Nav id="global-icons" className={styles.iconsContainerAuth}>

        <Nav.Item>
          <Nav.Link>
            <HCTooltip text={infoContainer} id="info-tooltip" placement="bottom-end" className={styles.infoTooltip}>
              <i id="service-name" aria-label="service-details" tabIndex={1} ref={serviceNameRef}
                onMouseDown={serviceNameClickHandler} onKeyDown={serviceNameKeyDownHandler}>
                <FontAwesomeIcon icon={faInfoCircle} size="2x" aria-label="icon: info-circle" />
              </i>
            </HCTooltip>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item tabIndex={-1}>
          <div className={styles.vertical}></div>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link id="help-link" aria-label="help-link" className={styles.helpIconLink} href={getVersionLink()} target="_blank" rel="noopener noreferrer"
            tabIndex={1} ref={helpLinkRef} onKeyDown={helpLinkKeyDownHandler} onMouseDown={helpLinkClickHandler} as="a">
            <HCTooltip text="Help" id="help-tooltip" placement="bottom">
              <QuestionCircle color={"rgba(255, 255, 255, 0.65)"} size={24} aria-label="icon: question-circle" />
            </HCTooltip></Nav.Link>
        </Nav.Item>
        <NavDropdown autoClose={false} title={
          <HCTooltip text="User" id="user-tooltip" placement="bottom">
            <i>
              <FontAwesomeIcon icon={faUser} size="2x" aria-label="icon: user" />
            </i>
          </HCTooltip>
        }
        className={styles.userDrop}
        id="user-dropdown">
          <NavDropdown.Item
            as="span"
            className="bg-transparent p-0 m-0"
            ref={userDropdownRef}
            onKeyDown={userIconKeyDownHandler}
            onMouseDown={userDropdownClickHandler}>
            {userMenu}
          </NavDropdown.Item>

        </NavDropdown>
      </Nav>;
  } else {
    globalIcons =(
      <Nav id="global-icons" className={styles.iconsContainer}>
        <Nav.Item>
          <Nav.Link id="help-link" href="https://docs.marklogic.com/datahub/" target="_blank" rel="noopener noreferrer" tabIndex={1} className={styles.helpIconLink}>
            <HCTooltip text="Help" id="help-tooltip" placement="bottom">
              <QuestionCircle color={"rgba(255, 255, 255, 0.65)"} size={24} aria-label="icon: question-circle" />
            </HCTooltip></Nav.Link>
        </Nav.Item>
      </Nav>);
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
          <Link to="/tiles" aria-label="logo-link" className={styles.logo} tabIndex={1} ref={logoRef}
            onKeyDown={logoKeyDownHandler} onMouseDown={logoClickHandler}>
            <Image className={styles.logo} src={logo} />
          </Link>
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
    </>
  );
};

export default withRouter(Header);
