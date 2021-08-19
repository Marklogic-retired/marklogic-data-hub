import React from "react";
import {Card, CardProps} from "react-bootstrap";
import styles from "./hc-card.module.scss";

export interface HCCardProps extends CardProps {
  actions?: Array<JSX.Element>,
  titleExtra?: JSX.Element,
  bodyClassName?: string,
  footerClassName?: string
}

function HCCard({className, actions, title, titleExtra, bodyClassName, footerClassName, children, ...others}: HCCardProps): JSX.Element {

  let percentage = actions ? 100 / actions.length + "%" : "100%";

  return (
    <Card className={`${styles.cardStyle} ${className}`} {...others}>
      {title && <Card.Header bsPrefix={styles.header}>
        <label className={styles.title}>{title}</label> {titleExtra}
      </Card.Header>}
      <Card.Body className={bodyClassName}>
        {children}
      </Card.Body>
      {actions && <Card.Footer className={` ${styles.footer} ${styles.card} ${footerClassName}`}>
        <ul className={styles.footerContent}>
          {actions.map((action, index) =>
            <li key={index} style={{width: percentage}}>
              {action}
            </li>
          )}
        </ul>
      </Card.Footer>}
    </Card>
  );
}

export default HCCard;