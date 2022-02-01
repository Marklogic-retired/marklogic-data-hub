import React from "react";
import { Link } from "react-router-dom";
import SearchBox from "../components/SearchBox/SearchBox";
import Menus from "../components/Menus/Menus";
import { configHeader } from "../config/header.js";
import { configSearchbox } from "../config/searchbox.js";
import { ArrowUpRightSquare, PersonCircle } from "react-bootstrap-icons";
import styles from "./Header.module.scss";

type Props = {};

const Header: React.FC<Props> = (props) => {

  return (
    <header className="sticky-top">
      <div>
        <span className={styles.logo}>
          <ArrowUpRightSquare color="#ccc" size={24} />
        </span>
        <span className={styles.title}>
          <Link to="/">{configHeader.title}</Link>
        </span>
        <Menus config={configHeader.menus} />
      </div>
      <div>
        <SearchBox config={configSearchbox} width="600px" />
        <div className={styles.account}>
            <PersonCircle color="#ccc" size={28} />
        </div>
      </div>
    </header>
  );

};

export default Header;
