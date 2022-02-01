import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DetailContext } from "../store/DetailContext";
import Occupations from "../components/Occupations/Occupations";
import Relationships from "../components/Relationships/Relationships";
import DataTableValue from "../components/DataTableValue/DataTableValue";
import DataTableMultiValue from "../components/DataTableMultiValue/DataTableMultiValue";
import Section from "../components/Section/Section";
import {configDetail} from "../config/detail.js";
import { ArrowLeft } from "react-bootstrap-icons";
import styles from "./Detail.module.scss";
import { getValByPath } from "../util/util";
import _ from "lodash";

type Props = {};

const Detail: React.FC<Props> = (props) => {
  
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const detailContext = useContext(DetailContext);
  let { id } = useParams();
  if (_.isEmpty(detailContext.detail)) {
    detailContext.handleDetail(id);
  }

  let thumbStyle = {
    width: (configDetail.heading.thumbnail && configDetail.heading.thumbnail.width) ? 
    configDetail.heading.thumbnail.width : "auto",
    height: (configDetail.heading.thumbnail && configDetail.heading.thumbnail.height) ? 
    configDetail.heading.thumbnail.height : "auto"
  };
  
  const getHeading = () => {
    console.log("getHeading", configDetail.heading, detailContext.detail);
    let config = configDetail.heading;
    return (
      <div className={styles.heading}>
      <div className={styles.icon} onClick={handleBackClick}>
        <ArrowLeft color="#394494" size={28} />
      </div>
      <div className={styles.title}>
        {getValByPath(detailContext.detail, config.title)}
      </div>
      {config.thumbnail && <div className={styles.thumbnail}>
        <img
            src={getValByPath(detailContext.detail, config.thumbnail.src)}
            alt={getValByPath(detailContext.detail, config.title)}
            style={thumbStyle}
        ></img>
      </div>}
    </div>
    );
  };

  return (

    <div className={styles.detail}>
      {(!_.isEmpty(detailContext.detail)) ? (

      <div>

        {getHeading()}

        <div className="dashboard container-fluid">

          <div className="row">
            {/* Membership... */}
          </div>

          <div className="row">
            <div className="col-lg-7">

              <Section title="Personal Info">
                <DataTableValue config={configDetail.personal.name} />
                <DataTableValue config={configDetail.personal.phone} />
                <DataTableValue config={configDetail.personal.email} />
                <DataTableValue config={configDetail.personal.ssn} />
                <DataTableMultiValue config={configDetail.personal.address} />
                <DataTableMultiValue config={configDetail.personal.school} />
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
