import {HCTooltip} from "@components/common";
import React, {useEffect, useRef, useState} from "react";

export function AddTooltipWhenTextOverflow({text}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEllipsisActive, setIsEllipsisActive] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);

  function handleResize() {
    setLabelWidth(ref.current!.offsetWidth);
    setIsEllipsisActive(ref.current!.offsetWidth < ref.current!.scrollWidth);
  }


  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize, false);
    return () => {
      window.removeEventListener("resize", handleResize, false);
    };
  }, []);

  return (
    <div ref={ref} style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
      {isEllipsisActive ?
        <HCTooltip
          text={text}
          id="additional-collections-tooltip"
          placement="top">
          <div style={{zIndex: 1, position: "absolute", width: labelWidth}}>&nbsp;</div>
        </HCTooltip>
        :
        null
      }
      <>{text}</>
    </div>
  );
}