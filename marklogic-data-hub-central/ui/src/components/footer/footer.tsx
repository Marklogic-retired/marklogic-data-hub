import React from 'react';
import { Layout } from 'antd';
import styles from './footer.module.scss';

const Footer = (props) => {

  const footerStyle = (props.pageTheme && props.pageTheme['footer']) ? props.pageTheme['footer'] : null;
  const linkStyle = (props.pageTheme && props.pageTheme['footerLink']) ? props.pageTheme['footerLink'] : null;

  return (
    <Layout.Footer>
      <div className={styles.content} style={footerStyle}>
        <span>Copyright @ 2020 MarkLogic Corporation. All Rights Reserved.</span>
        |
        <span className={styles.link} style={linkStyle}>Terms and Conditions</span>
        |
        <span className={styles.link} style={linkStyle}>Policies</span>
      </div>
    </Layout.Footer>

  )
}

export default Footer;
