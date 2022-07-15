import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBox from "../components/SearchBox/SearchBox";
import Menus from "../components/Menus/Menus";
import { UserContext } from "../store/UserContext";

import { PersonCircle } from "react-bootstrap-icons";
// import "./Header.scss";

type Props = {};

const Header: React.FC<Props> = (props) => {

  const userContext = useContext(UserContext);

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    setConfig(userContext.config);
  }, [userContext.config]);

  return (
 
    <header className="bg-dark text-white py-3 fixed-top"> 
        <div className="container-fluid">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <a href="/" className="d-flex align-items-center my-2 my-lg-0 text-white text-decoration-none">

              {config?.header &&
                <span className="d-flex align-items-center me-4">
                  <img className="me-1" width="42" src="/marklogic.png" alt="image" />
                  <Link className="text-white text-decoration-none me-2 fs-4" to="/">{config.header.title}</Link>
                  <small>{config.header.subtitle}</small>
                </span>
              }
            </a>

            {config?.header?.menus &&
              <Menus config={config.header.menus} />
            }

            <div className="col-12 col-lg-4 mb-3 me-lg-3 mb-lg-0">
              {config?.searchbox &&
                <SearchBox config={config.searchbox} />
              }
            </div>
            <div className="text-end d-flex align-items-center  ">
              <div className="account">
                <PersonCircle color="#ccc" size={28} />
              </div>
            </div> 
        </div>
      </div>
    </header>
  );

};

export default Header;
