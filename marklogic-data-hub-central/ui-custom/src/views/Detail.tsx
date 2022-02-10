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

              <Section title="Personal Info">

                {config?.detail?.personal?.name ? 
                  <DataTableValue config={config.detail.personal.name} />
                : null}

                {config?.detail?.personal?.phone ? 
                  <DataTableValue config={config.detail.personal.phone} />
                : null}

                {config?.detail?.personal?.email ? 
                  <DataTableValue config={config.detail.personal.email} />
                : null}

                {config?.detail?.personal?.ssn ? 
                  <DataTableValue config={config.detail.personal.ssn} />
                : null}

                {config?.detail?.personal?.address ? 
                  <DataTableMultiValue config={config.detail.personal.address} />
                : null}

                {config?.detail?.personal?.school ? 
                  <DataTableMultiValue config={config.detail.personal.school} />
                : null}

              </Section>

            </div>
            <div className="col-lg-5">

              <Section title="Relationships">
                <Relationships id={id ? parseInt(id) : 0} />
              </Section>

              <Section title="Occupations">
                <Occupations />
              </Section>

            </div>
          </div>

        </div>

      </div>

      ) : null}

    </div>
  );
};

export default Detail;
