import React from "react";
import {Layout} from "antd";
import styles from "./footer.module.scss";

const Footer = (props) => {

  const footerStyle = (props.pageTheme && props.pageTheme["footer"]) ? props.pageTheme["footer"] : null;
  const linkStyle = (props.pageTheme && props.pageTheme["footerLink"]) ? props.pageTheme["footerLink"] : null;
  const currentYear = (new Date()).getFullYear();

  let linkRef = React.createRef<HTMLAnchorElement>();
  const linkWrapperKeyDown = (event) => {
    if (event.key === "Enter") {
      linkRef.current!.click();
    }
  };

  return (
    <Layout.Footer>
      <div className={styles.content} style={footerStyle}>
        <span>© {currentYear} MarkLogic Corporation</span>
        |
        <span tabIndex={0} onKeyDown={linkWrapperKeyDown} className={styles.link}>
          <a className={styles.linkStyle} tabIndex={-1} ref={linkRef} href="https://www.marklogic.com/privacy/" style={linkStyle}>Privacy</a>
        </span>
      </div>
    </Layout.Footer>
  );
};

export default Footer;
