import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../store/UserContext";
import { DetailContext } from "../store/DetailContext";
import Occupations from "../components/Occupations/Occupations";
import Relationships from "../components/Relationships/Relationships";
import DataTableValue from "../components/DataTableValue/DataTableValue";
import DataTableMultiValue from "../components/DataTableMultiValue/DataTableMultiValue";
import Section from "../components/Section/Section";
import { ArrowLeft } from "react-bootstrap-icons";
import "./Detail.scss";
import { getValByPath } from "../util/util";
import _ from "lodash";

type Props = {};

const COMPONENTS = {
  DataTableValue: DataTableValue,
  DataTableMultiValue: DataTableMultiValue
}

const Detail: React.FC<Props> = (props) => {
  
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const userContext = useContext(UserContext);
  const detailContext = useContext(DetailContext);
  
  const [config, setConfig] = useState<any>(null);

  let { id } = useParams();

  useEffect(() => {
    setConfig(userContext.config);
    // If config is loaded and id is present but detail context is 
    // empty, load detail context so content is displayed
    if (userContext.config.detail && id && _.isEmpty(detailContext.detail)) {
      detailContext.handleDetail(id);
    }
  }, [userContext.config]);

  let thumbStyle = {
    width: (config?.detail?.heading?.thumbnail && config?.detail?.heading?.thumbnail.width) ? 
    config.detail.heading.thumbnail.width : "auto",
    height: (config?.detail?.heading?.thumbnail && config?.detail?.heading?.thumbnail.height) ? 
    config.detail.heading.thumbnail.height : "auto"
  };
  
  const getHeading = (configHeading) => {
    return (
      <div className="heading">
      <div className="icon" onClick={handleBackClick}>
        <ArrowLeft color="#394494" size={28} />
      </div>
      <div className="title">
        {getValByPath(detailContext.detail, configHeading.title)}
      </div>
      {configHeading.thumbnail && <div className="thumbnail">
        <img
            src={getValByPath(detailContext.detail, configHeading.thumbnail.src)}
            alt={getValByPath(detailContext.detail, configHeading.title)}
            style={thumbStyle}
        ></img>
      </div>}
    </div>
    );
  };

  let getPersonalItems = (items) => {
    const personaItems = items.map((it, index) => {
      if (it.component) {
        return (
          <div key={"item-" + index} className="item">
            {React.createElement(
              COMPONENTS[it.component], 
              { config: it }, null
            )}
          </div>
        );
      }
    });
    return personaItems;
  };

  return (

    <div className="detail">
      {(config?.detail && !_.isEmpty(detailContext.detail)) ? (

      <div>

        {config?.detail?.heading ? 
          getHeading(config.detail.heading)
        : null}

        <div className="dashboard container-fluid">

          <div className="row">
            {/* Membership... */}
          </div>

          <div className="row">
            <div className="col-lg-7">

              {config?.detail?.personal ? 
                <Section title="Personal Info">
                  {getPersonalItems(config?.detail?.personal?.items)}
                </Section>
              : null}

            </div>
            <div className="col-lg-5">

              {config?.detail?.relationships ? 
                <Section title="Relationships">
                  <Relationships id={id ? parseInt(id) : 0} />
                </Section>
              : null}

              {config?.detail?.occupations ? 
                <Section title="Occupations">
                  <Occupations />
                </Section>
              : null}

            </div>
          </div>

        </div>

      </div>

      ) : null}

    </div>
  );
};

export default Detail;
