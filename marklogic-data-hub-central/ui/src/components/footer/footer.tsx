import React from 'react';
import { Layout } from 'antd';
import styles from './footer.module.scss';

const Footer = (props) => {

  const footerStyle = (props.pageTheme && props.pageTheme['footer']) ? props.pageTheme['footer'] : null;
  const linkStyle = (props.pageTheme && props.pageTheme['footerLink']) ? props.pageTheme['footerLink'] : null;
  const currentYear = (new Date()).getFullYear();

  return (
    <Layout.Footer>
      <div className={styles.content} style={footerStyle}>
        <span>© {currentYear} MarkLogic Corporation</span>
        |
        <span className={styles.link}><a href="https://www.marklogic.com/privacy/" style={linkStyle}>Privacy</a></span>
      </div>
    </Layout.Footer>

  );
};

export default Footer;
