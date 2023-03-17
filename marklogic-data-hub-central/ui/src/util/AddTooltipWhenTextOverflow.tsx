import {HCTooltip} from "@components/common";
import React, {useLayoutEffect, useRef, useState} from "react";
import {Placement} from "react-bootstrap/esm/types";

export function AddTooltipWhenTextOverflow({
  text,
  placement = "auto",
  forceRender = false,
}: {
  text: string;
  placement?: Placement;
  forceRender?: Boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEllipsisActive, setIsEllipsisActive] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);

  function handleResize() {
    setTimeout(() => {
      if (ref.current) {
        setLabelWidth(ref.current!.offsetWidth);
        setIsEllipsisActive(ref.current!.offsetWidth < ref.current!.scrollWidth);
      }
    }, 10);
  }

  useLayoutEffect(
    () => {
      handleResize();
      window.addEventListener("resize", handleResize, false);
      return () => {
        window.removeEventListener("resize", handleResize, false);
      };
    },
    forceRender ? undefined : [],
  );

  return (
    <div ref={ref} style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
      {isEllipsisActive ? (
        <HCTooltip text={text} id="additional-collections-tooltip" placement={placement}>
          <div style={{zIndex: 1, position: "absolute", width: labelWidth}}>&nbsp;</div>
        </HCTooltip>
      ) : null}
      <>{text}</>
    </div>
  );
}
