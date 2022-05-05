import React from "react";
import "./Image.scss";
import { getValByConfig } from "../../util/util";

type Props = {
  config?: any;
  data?: any;
  style?: any;
  className?: any;
};

/**
 * Component for showing date and time information.
 *
 * @component
 * @example
 * TBD
 */
const Image: React.FC<Props> = (props) => {

    let src;
    if (props.children) {
        src = props.children;
    } else {
        src = getValByConfig(props.data, props.config, true);
    }

    const imageClassName: any = props.className ? props.className : props.config?.className ? props.config.className : "";
    const imageStyle: any = props.style ? props.style : props?.config?.style ? props?.config?.style : {};

    return (<img
        src={src}
        className={imageClassName ? imageClassName : "Image"}
        style={imageStyle}
        alt={props.config?.alt}
        data-testid="imageId"
    />);
};

export default Image;
