import React from "react";
import styles from "./Section.module.scss";

type Props = {
    title: string;
    width?: string;
};

/**
 * Component for showing a container around one or more other components.
 *
 * @component
 * @prop {string} title - Section label.
 * @prop {string} value - Section width (as CSS width value, default to "100%").
 * @example
 * <Section title="My Section Title" width="200px">
 *   <SomeComponent />
 * </Section>
 */
const Section: React.FC<Props> = (props) => {

  let divStyle = {
    width: props.width ? props.width : "100%"
  };

  return (
    <div className={styles.section} style={divStyle}>
      <header><span>{props.title}</span></header>
      <main>{props.children}</main>
    </div>
  );
};

export default Section;
