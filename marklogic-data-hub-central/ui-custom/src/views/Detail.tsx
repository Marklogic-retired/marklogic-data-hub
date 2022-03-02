import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../store/UserContext";
import { DetailContext } from "../store/DetailContext";
import Loading from "../components/Loading/Loading";
import Occupations from "../components/Occupations/Occupations";
import Relationships from "../components/Relationships/Relationships";
import DataTableValue from "../components/DataTableValue/DataTableValue";
import DataTableMultiValue from "../components/DataTableMultiValue/DataTableMultiValue";
import DateTime from "../components/DateTime/DateTime";
import Image from "../components/Image/Image";
import Section from "../components/Section/Section";
import Value from "../components/Value/Value";
import { ArrowLeft } from "react-bootstrap-icons";
import "./Detail.scss";
import _ from "lodash";
import SocialMedia from "../components/SocialMedia/SocialMedia";

type Props = {};

const COMPONENTS = {
  DataTableValue: DataTableValue,
  DataTableMultiValue: DataTableMultiValue,
  DateTime: DateTime,
  Image: Image,
  Relationships: Relationships,
  Value: Value,
  SocialMedia: SocialMedia
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
      detailContext.handleGetDetail(id);
    }
  }, [userContext.config]);

  useEffect(() => {
    detailContext.handleSaveRecentlyVisited();
  }, [detailContext.detail]);
  
  const getHeading = (configHeading) => {
    return (
      <div className="heading">
      <div className="icon" onClick={handleBackClick}>
        <ArrowLeft color="#394494" size={28} />
      </div>
      <div className="title">
        <Value data={detailContext.detail} config={configHeading.title} getFirst={true} />
      </div>
      {configHeading.thumbnail && <div className="thumbnail">
        <Image data={detailContext.detail} config={configHeading.thumbnail.config} />
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
              { config: it.config, data: detailContext.detail}, null
            )}
          </div>
        );
      }
    });
    return personaItems;
  };

  return (

    <div className="detail">

      {config?.detail && !_.isEmpty(detailContext.detail) ? (

      <div>

        {config?.detail?.heading ? 
          getHeading(config.detail.heading)
        : null}

        <div className="container-fluid">

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
                  <div className="relationships">
                    {React.createElement(
                      COMPONENTS[config.detail.relationships.component], 
                      { config: config?.detail?.relationships.config, data: detailContext.detail}, null
                    )}
                  </div>
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

      ) : <Loading />}

    </div>
  );
};

export default Detail;
