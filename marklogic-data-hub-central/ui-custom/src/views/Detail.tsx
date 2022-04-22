import React, {useContext, useState, useEffect} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {UserContext} from "../store/UserContext";
import {DetailContext} from "../store/DetailContext";
import Loading from "../components/Loading/Loading";
import Occupations from "../components/Occupations/Occupations";
import Timeline from "../components/Timeline/Timeline";
import Relationships from "../components/Relationships/Relationships";
import DataTableValue from "../components/DataTableValue/DataTableValue";
import DataTableMultiValue from "../components/DataTableMultiValue/DataTableMultiValue";
import DateTime from "../components/DateTime/DateTime";
import Image from "../components/Image/Image";
import Section from "../components/Section/Section";
import Value from "../components/Value/Value";
import SocialMedia from "../components/SocialMedia/SocialMedia";
import Membership from "../components/Membership/Membership";
import ImageGallery from "../components/ImageGallery/ImageGallery";
import ImageGalleryMulti from "../components/ImageGalleryMulti/ImageGalleryMulti";
import LinkList from "../components/LinkList/LinkList";
import {ArrowLeft, ChevronDoubleDown, ChevronDoubleUp} from "react-bootstrap-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";
import "./Detail.scss";
import _ from "lodash";

type Props = {};

const COMPONENTS = {
  DataTableValue: DataTableValue,
  DataTableMultiValue: DataTableMultiValue,
  DateTime: DateTime,
  Image: Image,
  Relationships: Relationships,
  Value: Value,
  SocialMedia: SocialMedia,
  ImageGallery: ImageGallery,
  ImageGalleryMulti: ImageGalleryMulti,
  Membership: Membership,
  LinkList: LinkList,
  Timeline: Timeline
};

const Detail: React.FC<Props> = (props) => {

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };


  const handleFavoriteClick = () => {
    setFavorite(!favorite);
  };

  const userContext = useContext(UserContext);
  const detailContext = useContext(DetailContext);
  const {expandIds, handleExpandIds} = detailContext;

  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState<any>(null);
  const [favorite, setFavorite] = useState<any>(false);
  const [expand, setExpand] = useState<any>(true);

  const id = searchParams.get('recordId');
  const entityType = detailContext.detail.entityType;

  const handleExpandClick = () => {
    if (expand) {
      handleExpandIds(
        {
          membership: false,
          info: false,
          relationships: false,
          imageGallery: false,
          timeline: false
        }
      );
    } else {
      handleExpandIds({
        membership: true,
        info: true,
        relationships: true,
        imageGallery: true,
        timeline: true
      });
    }
    setExpand(!expand);
  };

  useEffect(() => {
    setConfig(userContext.config);
    // If config is loaded and id is present but detail context is
    // empty, load detail context so content is displayed
    if (userContext.config.detail && id && _.isEmpty(detailContext.detail)) {
      detailContext.handleGetDetail(id);
    }
  }, [userContext.config]);

  useEffect(() => {
    if (userContext.config.api &&
      userContext.config.api.recentStorage === "database") {
      detailContext.handleSaveRecent();
    } else {
      detailContext.handleSaveRecentLocal();
    }
  }, [detailContext.detail]);

  const getHeading = (configHeading) => {
    return (
      <div className="heading">
        <div className="title">
          <div className="icon" onClick={handleBackClick}>
            <ArrowLeft color="#394494" size={28} />
          </div>
          <div className="text">
            <Value data={detailContext.detail} config={configHeading.title} getFirst={true} />
          </div>
          {configHeading.thumbnail && <div className="thumbnail">
            <Image data={detailContext.detail} config={configHeading.thumbnail.config} />
          </div>}
        </div>
        <div className="actions">
          <div className="expand">
            <button onClick={handleExpandClick}>
              <span className="label">{expand ? `Collapse All` : `Expand All`}</span>
              <span className="icon">
                {expand ? <ChevronDoubleUp color="#777" size={16} /> :
                  <ChevronDoubleDown color="#777" size={16} />}
              </span>
            </button>
          </div>
          <div className="favorite">
            <button onClick={handleFavoriteClick}>
              <span className="label">Mark as Important</span>
              <FontAwesomeIcon icon={faStar} style={{color: favorite ? "#FB637E" : "#777"}}></FontAwesomeIcon>
            </button>
          </div>
        </div>
      </div>
    );
  };

  let getRecordItems = (items) => {
    const personaItems = items.map((it, index) => {
      if (it.component) {
        return (
          <div key={"item-" + index} className="item">
            {React.createElement(
              COMPONENTS[it.component],
              {config: it.config, data: detailContext.detail}, null
            )}
          </div>
        );
      }
    });
    return personaItems;
  };

  const handleExpandIdsClick = (id, value) => {
    const newExpandId = {...expandIds, [id]: value}
    handleExpandIds(newExpandId);
  }

  return (

    <div className="detail">

      {config?.detail && !_.isEmpty(detailContext.detail) && !detailContext.loading ? (

        <div>

          {config?.detail?.entities[entityType]?.heading ?
            getHeading(config.detail.entities[entityType].heading)
            : null}

          <div className="container-fluid">

            {config?.detail?.entities[entityType]?.linkList?.config && <div>
              {React.createElement(
                COMPONENTS.LinkList,
                {config: config?.detail?.entities[entityType]?.linkList.config, data: detailContext.detail}, null
              )}
            </div>}

            {config?.detail?.entities[entityType]?.membership && <div className="row">
              <div className="col-12">
                <Section title="Membership" config={{
                  "headerStyle": {
                    "backgroundColor": "transparent"
                  },
                  "mainStyle": {
                    "paddingTop": "6px"
                  }
                }}
                  collapsible={true}
                  expand={expandIds.membership}
                  onExpand={() => {handleExpandIdsClick('membership', true)}}
                  onCollapse={() => {handleExpandIdsClick('membership', false)}}>
                  {React.createElement(
                    COMPONENTS[config?.detail?.entities[entityType]?.membership.component],
                    {config: config?.detail?.entities[entityType]?.membership.config, data: detailContext.detail}, null
                  )}
                </Section>
              </div>
            </div>}

            <div className="row">
              <div className="col-lg-7">

                {config?.detail?.entities[entityType]?.info &&
                  <Section title={config?.detail?.entities[entityType]?.info.title}
                    collapsible={true}
                    expand={expandIds.info}
                    onExpand={() => {handleExpandIdsClick('info', true)}}
                    onCollapse={() => {handleExpandIdsClick('info', false)}} >
                    {getRecordItems(config?.detail?.entities[entityType]?.info?.items)}
                  </Section>
                }

              </div>
              <div className="col-lg-5">

                {config?.detail?.entities[entityType]?.relationships &&
                  <Section
                    title="Relationships"
                    collapsible={true}
                    expand={expandIds.relationships}
                    onExpand={() => {handleExpandIdsClick('relationships', true)}}
                    onCollapse={() => {handleExpandIdsClick('relationships', false)}} config={{
                      "mainStyle": {
                        "padding": "0"
                      }
                    }}>
                    <div className="relationships">
                      {React.createElement(
                        COMPONENTS[config?.detail?.entities[entityType]?.relationships.component],
                        {config: config?.detail?.entities[entityType]?.relationships.config, data: detailContext.detail}, null
                      )}
                    </div>
                  </Section>
                }

                {config?.detail?.entities[entityType]?.imageGallery &&
                  <Section title="Image Gallery"
                    collapsible={true}
                    expand={expandIds.imageGallery}
                    onExpand={() => {handleExpandIdsClick('imageGallery', true)}}
                    onCollapse={() => {handleExpandIdsClick('imageGallery', false)}}
                  >
                    {React.createElement(
                      COMPONENTS[config?.detail?.entities[entityType]?.imageGallery.component],
                      {config: config?.detail?.entities[entityType]?.imageGallery.config, data: detailContext.detail}, null
                    )}
                  </Section>
                }

              </div>
            </div>
              {config?.detail?.timeline && <div className="row">
                  <div className="col-12">
                      <Section
                          title="Timeline"
                          data-test="timelineSection"
                          collapsible={true}
                          expand={expandIds.timeline}
                          onExpand={() => {handleExpandIdsClick('timeline', true)}}
                          onCollapse={() => {handleExpandIdsClick('timeline', false)}}>
                          {React.createElement(
                              COMPONENTS[config.detail.timeline.component],
                              {config: config.detail.timeline.config, data: detailContext.detail}, null
                          )}
                      </Section>
                  </div>
              </div>}
          </div>

        </div>

      ) : <Loading />}

    </div>
  );
};

export default Detail;