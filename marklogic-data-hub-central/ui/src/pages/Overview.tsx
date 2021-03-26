import React from "react";
import styles from "./Overview.module.scss";
import {useHistory} from "react-router-dom";
import overviewConfig from "../config/overview.config";
import tiles from "../config/tiles.config";

interface Props {
    enabled: any;
}

const Overview: React.FC<Props> = (props) => {

  const history: any = useHistory();

  const goToTile = (id) => {
    if (props.enabled && props.enabled.includes(id)) {
      history.push({
        pathname: `/tiles/${id}`,
        state: {
          tileIconClicked: true
        }
      });
    }
  };

  const openDocumentation = (e, type) => {
    if (e) e.stopPropagation(); // Stop click from also opening tile
    window.open(overviewConfig.documentationLinks[type], "_blank");
  };

  const openVideo = (e, type) => {
    if (e) e.stopPropagation(); // Stop click from also opening tile
    window.open(overviewConfig.videoLinks[type], "_blank");
  };

  const getClassNames = (id) => {
    const nameMap = {
      "load": "cardLoad",
      "model": "cardModel",
      "curate": "cardCurate",
      "explore": "cardExplore",
      "run": "cardRun"
    };
    if (props.enabled && props.enabled.includes(id)) {
      return `${styles[nameMap[id]]} ${styles.enabled}`;
    } else {
      return `${styles[nameMap[id]]} ${styles.disabled}`;
    }
  };

  const cardRefMap = {
    "load": React.createRef<HTMLDivElement>(),
    "model": React.createRef<HTMLDivElement>(),
    "curate": React.createRef<HTMLDivElement>(),
    "explore": React.createRef<HTMLDivElement>(),
    "run": React.createRef<HTMLDivElement>()
  };

  const focusCard = (id) => {
    if (cardRefMap[id].current !== null) { cardRefMap[id].current.focus(); }
  };

  const cardKeyDownHandler = (event, id) => {
    if (event.key === "Enter" && props.enabled && props.enabled.includes(id)) { goToTile(id); }

    if (event.key === "ArrowUp") {
      switch (id) {
      case "run":
        focusCard("load");
        break;
      default:
        event.preventDefault();
        break;
      }
    }

    if (event.key === "ArrowDown") {
      switch (id) {
      case "load":
      case "model":
      case "curate":
        focusCard("run");
        break;
      default:
        event.preventDefault();
        break;
      }
    }

    if (event.key === "ArrowRight") {
      switch (id) {
      case "load":
        focusCard("model");
        break;
      case "model":
        focusCard("curate");
        break;
      case "curate":
      case "run":
        focusCard("explore");
        break;
      default:
        event.preventDefault();
        break;
      }
    }

    if (event.key === "ArrowLeft") {
      switch (id) {
      case "model":
        focusCard("load");
        break;
      case "curate":
        focusCard("model");
        break;
      case "explore":
        focusCard("curate");
        break;
      default:
        event.preventDefault();
        break;
      }
    }
  };

  return (
    <div className={styles.overviewContainer} aria-label="overview">
      <div className={styles.title}>Welcome to MarkLogic Data Hub Central</div>
      <div className={styles.introText} aria-label={"introText"}>MarkLogic Data Hub Central makes it easy to manage your data. You can load, curate, and manage your data, or explore and export your data — all within Hub Central.</div>
      <div className={styles.cardsContainer}>
        <div className={styles.cards}>
          <div
            className={getClassNames("load")} aria-label={"load-card"}
            ref={cardRefMap["load"]} tabIndex={0}
            onClick={() => { goToTile("load"); }} onKeyDown={(e) => cardKeyDownHandler(e, "load")}
          >
            <div className={styles.head}></div>
            <div className={styles.subtitle}>
              <span className={styles.icon} aria-label="load-icon"></span>Load
            </div>
            <div className={styles.body}>Create and configure steps that define how data should be loaded.
              <div className={styles.docLink}>
                <span onClick={(e) => { openDocumentation(e, "load"); }}>Documentation</span>
              </div>
              <div className={styles.vidLink}>
                <span onClick={(e) => { openVideo(e, "load"); }}>Video Tutorial</span>
              </div>
              { props.enabled && !props.enabled.includes("load") &&
                            <div className={styles.permissions}>*additional permissions required</div> }
            </div>
          </div>

          <div
            className={getClassNames("model")} aria-label={"model-card"}
            ref={cardRefMap["model"]} tabIndex={0}
            onClick={() => { goToTile("model"); }} onKeyDown={(e) => cardKeyDownHandler(e, "model")}
          >
            <div className={styles.head}></div>
            <div className={styles.subtitle}>
              <span className={styles.icon} aria-label="model-icon"></span>Model
            </div>
            <div className={styles.body}>Define the entity models that describe and standardize your data.
              <div className={styles.docLink}>
                <span onClick={(e) => { openDocumentation(e, "model"); }}>Documentation</span>
              </div>
              <div className={styles.vidLink}>
                <span onClick={(e) => { openVideo(e, "model"); }}>Video Tutorial</span>
              </div>
              { props.enabled && !props.enabled.includes("model") &&
                            <div className={styles.permissions}>*additional permissions required</div> }
            </div>
          </div>

          <div
            className={getClassNames("curate")} aria-label={"curate-card"}
            ref={cardRefMap["curate"]} tabIndex={0}
            onClick={() => { goToTile("curate"); }} onKeyDown={(e) => cardKeyDownHandler(e, "curate")}
          >
            <div className={styles.head}></div>
            <div className={styles.subtitle}>
              <span className={styles.icon} aria-label="curate-icon"></span>Curate
            </div>
            <div className={styles.body}>Create and configure steps that curate and refine your data.
              <div className={styles.docLink}>
                <span onClick={(e) => { openDocumentation(e, "curate"); }}>Documentation</span>
              </div>
              <div className={styles.vidLink}>
                <span onClick={(e) => { openVideo(e, "curate"); }}>Video Tutorial</span>
              </div>
              { props.enabled && !props.enabled.includes("curate") &&
                            <div className={styles.permissions}>*additional permissions required</div> }
            </div>
          </div>

          <div
            className={getClassNames("run")} aria-label={"run-card"}
            ref={cardRefMap["run"]} tabIndex={0}
            onClick={() => { goToTile("run"); }} onKeyDown={(e) => cardKeyDownHandler(e, "run")}
          >
            <div className={styles.head}>
              <div className={styles.subtitle}>
                <span className={styles.icon} aria-label="run-icon"></span>Run
              </div>
              <div className={styles.body}>{tiles.run.intro}
                <div className={styles.docLink}>
                  <span onClick={(e) => { openDocumentation(e, "run"); }}>Documentation</span>
                </div>
                <div className={styles.vidLink}>
                  <span onClick={(e) => { openVideo(e, "run"); }}>Video Tutorial</span>
                </div>
                { props.enabled && !props.enabled.includes("run") &&
                                <div className={styles.permissionsRun}>*additional permissions required</div> }
              </div>
            </div>
          </div>

          <div
            className={getClassNames("explore")} aria-label={"explore-card"}
            ref={cardRefMap["explore"]} tabIndex={0}
            onClick={() => { goToTile("explore"); }} onKeyDown={(e) => cardKeyDownHandler(e, "explore")}
          >
            <div className={styles.head}>
              <span className={styles.icon} aria-label="explore-icon"></span>
              <div className={styles.subtitle}>Explore</div>
              <div className={styles.body}>{tiles.explore.intro}
                <div className={styles.docLink}>
                  <span onClick={(e) => { openDocumentation(e, "explore"); }}>Documentation</span>
                </div>
                <div className={styles.vidLink}>
                  <span onClick={(e) => { openVideo(e, "explore"); }}>Video Tutorial</span>
                </div>
                { props.enabled && !props.enabled.includes("explore") &&
                                <div className={styles.permissionsExplore}>*additional permissions required</div> }
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Overview;
