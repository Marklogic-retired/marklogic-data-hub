import React, {useContext, useState, useEffect, createRef} from "react";
import {RouteComponentProps, withRouter, useHistory, Link} from "react-router-dom";
import axios from "axios";
import {UserContext} from "@util/user-context";
import {parseVersion} from "@util/environment";
import logo from "./logo.svg";
import styles from "./header.module.scss";
import {Application} from "@config/application.config";
import SystemInfo from "./system-info/system-info";
import {Image, Nav, NavDropdown} from "react-bootstrap";
import {QuestionCircle} from "react-bootstrap-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle, faBell} from "@fortawesome/free-solid-svg-icons";
import {faUser} from "@fortawesome/free-regular-svg-icons";
import {HCButton, HCTooltip} from "@components/common";
import NotificationBadge from "react-notification-badge";
import {Effect} from "react-notification-badge";
import NotificationModal from "./notification-modal/notification-modal";
import {NotificationContext} from "@util/notification-context";
import {getNotifications} from "@api/merging";
import {entityFromJSON, entityParser} from "@util/data-conversion";

interface Props extends RouteComponentProps<any> {
  environment: any
}

const Header: React.FC<Props> = (props) => {
  const {user, userNotAuthenticated, handleError} = useContext(UserContext);
  const {notificationOptions, setNotificationsObj} = useContext(NotificationContext);
  const [systemInfoVisible, setSystemInfoVisible] = useState(false);
  const [showUserDropdown, toggleUserDropdown] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const history = useHistory();

  const logoRef = createRef<HTMLAnchorElement>();
  const titleRef = createRef<HTMLDivElement>();
  const serviceNameRef = createRef<HTMLElement>();
  const helpLinkRef = createRef<HTMLAnchorElement>();
  const userDropdownRef = createRef<HTMLSpanElement>();
  const [isAutoClose, setAutoClose] = useState(false);
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const notificationBellRef = createRef<HTMLAnchorElement>();

  const fetchModels = async () => {
    await axios.get(`/api/models`)
      .then((modelsResponse) => {
        const parsedModelData = entityFromJSON(modelsResponse.data);
        const parsedEntityDef = entityParser(parsedModelData).filter(entity => entity.name && entity);
        setEntityDefArray(parsedEntityDef);
      });
  };

  useEffect(() => {
    if (user.authenticated === true) {
      const fetchNotifications = async () => {
        await getNotifications(1, notificationOptions.pageLength)
          .then((resp: any) => {
            if (resp && resp.data) {
              setNotificationsObj(resp.data.notifications, resp.data.total, resp.data.pageLength, true);
            } else {
              setNotificationsObj([], 0, 0, false);
            }
          })
          .catch((err) => {
            if (err.response) {
              setNotificationsObj([], 0, 0, false);
            } else {
              setNotificationsObj([], 0, 0, false);
            }
          });
      };
      fetchNotifications();
      fetchModels();
    }
  }, [user.authenticated]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      // @ts-ignore
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setAutoClose(true);
      } else {
        setAutoClose(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownRef]);

  const confirmLogout = async () => {
    try {
      let response = await axios(`/api/logout`);
      if (response.status === 200) {
        userNotAuthenticated();
      }
    } catch (error) {
      console.error(error);
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

  const logoutKeyDownHandler = (event) => {
    if (event.key === "Tab") {
      toggleUserDropdown(false);
    }
    if (event.key === "Escape") { toggleUserDropdown(false); }
  };

  let userMenu = <div className={styles.userMenu}tabIndex={-1}>
    <div className={styles.username} tabIndex={-1}>{localStorage.getItem("dataHubUser")}</div>
    <div className={styles.logout} tabIndex={-1}>
      <HCButton id="logOut" variant="outline-light"
        onClick={confirmLogout} onKeyDown={logoutKeyDownHandler} tabIndex={0}>
        Log Out
      </HCButton>
    </div>
  </div>;

  const serviceNameKeyDownHandler = (event) => {
    if (event.key === "Enter") { handleSystemInfoDisplay(); }
    if (event.key === "ArrowRight") { if (notificationBellRef.current !== null) notificationBellRef.current.focus(); }//debe ir a llogin no quedarse y el de izq va a ltitulo?
    if (event.key === "ArrowLeft") { titleRef.current!.focus(); }
  };

  const serviceNameClickHandler = (event) => {
    event.preventDefault();
    handleSystemInfoDisplay();
  };

  const bellIconKeyKeyDownHandler = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      setNotificationModalVisible(true);
    } else if (event.key === "ArrowLeft") { serviceNameRef.current!.focus(); }
    if (event.key === "ArrowRight") { helpLinkRef.current!.focus(); }
  };

  const helpLinkKeyDownHandler = (event) => {
    if (event.key === "ArrowRight") { if (userDropdownRef.current !== null)userDropdownRef.current!.focus(); }
    if (event.key === "ArrowLeft") { if (notificationBellRef.current !== null) { notificationBellRef.current.focus(); } }
  };

  const helpLinkClickHandler = (event) => {
    event.preventDefault();
    helpLinkRef.current!.click();
  };

  const userIconKeyDownHandler = (event) => {
    if (event.key === "ArrowLeft") { helpLinkRef.current!.focus(); }
    if (event.key === "Escape") { toggleUserDropdown(false); }
  };

  const userDropdownClickHandler = (event) => {
    event.preventDefault();
    toggleUserDropdown(!showUserDropdown);
  };

  let infoContainer = <div aria-label="info-text">
    Data Hub Version: <strong>{props.environment.dataHubVersion}</strong><br />
    MarkLogic Version: <strong>{props.environment.marklogicVersion}</strong><br />
    Service Name: <strong>{props.environment.serviceName}</strong><br /><br />
    Click to see details, to download configuration files, and to clear user data.
  </div>;

  let globalIcons;
  if (user.authenticated) {
    globalIcons =
      <Nav id="global-icons" className={styles.iconsContainerAuth}>
        <Nav.Item>
          <Nav.Link tabIndex={-1}>
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
          <HCTooltip text="Merge Notifications" id="notification-tooltip" placement="bottom">
            <Nav.Link aria-label={"notification-link"} ref={notificationBellRef} tabIndex={0} onKeyDown={bellIconKeyKeyDownHandler} onClick={() => setNotificationModalVisible(true)}>
              <NotificationBadge className={styles.notificationBadge} count={notificationOptions.totalCount} effect={Effect.SCALE} />
              <FontAwesomeIcon id="notificationBell" className={styles.notificationBell} icon={faBell} size="2x" aria-label="icon: notification-bell" />
            </Nav.Link>
          </HCTooltip>
        </Nav.Item>
        <Nav.Item>
          <HCTooltip text="Help" id="help-tooltip" placement="bottom">
            <Nav.Link id="help-link" aria-label="help-link" className={styles.helpIconLink} href={getVersionLink()} target="_blank" rel="noopener noreferrer"
              tabIndex={0} ref={helpLinkRef} onKeyDown={helpLinkKeyDownHandler} onMouseDown={helpLinkClickHandler} as="a">
              <QuestionCircle color={"rgba(255, 255, 255, 0.65)"} size={24} aria-label="icon: question-circle" />
            </Nav.Link></HCTooltip>
        </Nav.Item>

        <HCTooltip text="User" id="user-tooltip" placement="bottom">
          <NavDropdown tabIndex={-1} autoClose={isAutoClose} title={
            <i tabIndex={-1} >
              <FontAwesomeIcon icon={faUser} size="2x" aria-label="icon: user" />
            </i>
          }
          className={styles.userDrop}
          id="user-dropdown">
            <NavDropdown.Item
              tabIndex={0}
              as="span"
              className="bg-transparent p-0 m-0"
              onKeyDown={userIconKeyDownHandler}
              onMouseDown={userDropdownClickHandler}
              ref={userDropdownRef}>
              {userMenu}
            </NavDropdown.Item>
          </NavDropdown>
        </HCTooltip>
      </Nav>;
  } else {
    globalIcons = (
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
      <div className={styles.headerContainer}>
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
      </div>
      <SystemInfo
        serviceName={props.environment.serviceName}
        dataHubVersion={props.environment.dataHubVersion}
        marklogicVersion={props.environment.marklogicVersion}
        systemInfoVisible={systemInfoVisible}
        setSystemInfoVisible={setSystemInfoVisible}
      />
      <NotificationModal
        notificationModalVisible={notificationModalVisible}
        setNotificationModalVisible={setNotificationModalVisible}
        entityDefArray={entityDefArray}
      />
    </>
  );
};

export default withRouter(Header);
