import React from 'react';
import { Layout } from 'antd';
import styles from './footer.module.scss';

const Footer = (props) => {

  return (
    <Layout.Footer>
      <div className={styles.content} style={props.pageTheme['footer']}>
        <span>Copyright @ 2019 MarkLogic Corporation. All Rights Reserved.</span>
        | 
        <span className={styles.link} style={props.pageTheme['footerLink']}>Terms and Conditions</span>
        | 
        <span className={styles.link} style={props.pageTheme['footerLink']}>Policies</span>
      </div>
    </Layout.Footer>

  )
}

export default Footer;