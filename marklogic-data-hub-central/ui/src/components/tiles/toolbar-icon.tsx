import React, {FC, RefObject} from "react";
import {HCTooltip} from "@components/common";
import {Link} from "react-router-dom";
import {TileItem, TileId} from "@config/tiles.config";

import styles from "./toolbar.module.scss";

interface Props {
  tile: TileItem;
  tileId: TileId;
  tileRef: RefObject<any>;
  i: number;
  isActive: boolean;
  enabled: boolean;
  onClick: (tileId: TileId, i: number) => void;
  onKeyDown: (e: React.KeyboardEvent<any>, i: number) => void;
}

const ToolbarIcon: FC<Props> = ({tile, tileRef, tileId, i, isActive, enabled, onClick, onKeyDown}) => {
  let tooltipText = enabled
    ? tile["title"]
    : `${tile["title"]}: Contact your security administrator to get the roles and permissions required to access this functionality.`;

  const linkOnClickHandler = event => {
    if (!enabled) event.preventDefault();
  };

  const handleClick = () => {
    return enabled ? onClick(tileId, i) : null;
  };

  return (
    <HCTooltip text={tooltipText} id={tooltipText + "-tooltip"} placement="left-start" key={i}>
      <div
        className={`${styles.toolbarIcon} ${styles[tile["icon"]]} ${isActive && styles.selected} ${
          !enabled && styles.disabled
        }`}
        aria-label={"tool-" + tileId}
        tabIndex={-1}
        onClick={handleClick}
      >
        <Link
          to={{
            pathname: `/tiles-${tileId}`,
            state: {
              tileIconClicked: true,
            },
          }}
          aria-label={"tool-" + tileId + "-link"}
          tabIndex={0}
          ref={tileRef}
          onClick={linkOnClickHandler}
          onKeyDown={e => onKeyDown(e, i)}
        />
      </div>
    </HCTooltip>
  );
};

export default ToolbarIcon;
