/* Readme:
  To get this component working properly you should
  restrict the size of the component that will contain <AddTooltipWhenTextOverflow />
  example:
  <span style={{maxWidth:'150px'}}>
    <AddTooltipWhenTextOverflow text="abc" />
  </span>
  Additional if the component in the first render is hidden and doesn't work correctly
  try using property forceRender
*/
import {HCTooltip} from "@components/common";
import React, {useLayoutEffect, useRef, useState} from "react";
import {Placement} from "react-bootstrap/esm/types";

export function AddTooltipWhenTextOverflow({
  text,
  placement = "auto",
  forceRender = false,
  dataTestId  = "AddTooltipWhenTextOverflow"
}: {
  text: string;
  placement?: Placement;
  forceRender?: Boolean;
  dataTestId?:string;
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
    <div
      ref={ref}
      style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}
      data-testid={dataTestId}
    >
      {isEllipsisActive ? (
        <HCTooltip text={text} id="additional-collections-tooltip" placement={placement}>
          <div style={{zIndex: 1, position: "absolute", width: labelWidth}}>&nbsp;</div>
        </HCTooltip>
      ) : null}
      <>{text}</>
    </div>
  );
}
