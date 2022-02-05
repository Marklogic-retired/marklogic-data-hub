import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBox from "../components/SearchBox/SearchBox";
import Menus from "../components/Menus/Menus";
import { UserContext } from "../store/UserContext";
import { PersonCircle } from "react-bootstrap-icons";
import "./Header.scss";

type Props = {};

const Header: React.FC<Props> = (props) => {

  const userContext = useContext(UserContext);

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    setConfig(userContext.config);
  }, [userContext.config]);

  return (
    <header className="sticky-top">
      <div>
        <span className="logo">
          <img src="/marklogic.png" alt="image" />
        </span>

        {config?.header ? 
          <span className="title">
            <Link to="/">{config.header.title}</Link>
            <span className="subtitle">{config.header.subtitle}</span>
          </span>
        : null}

        {config?.header?.menus ? 
          <Menus config={config.header.menus} />
        : null}

      </div>
      <div>

        {config?.searchbox ? 
          <SearchBox config={config.searchbox} width="600px" />
        : null}

        <div className="account">
            <PersonCircle color="#ccc" size={28} />
        </div>
      </div>
    </header>
  );

};

export default Header;
