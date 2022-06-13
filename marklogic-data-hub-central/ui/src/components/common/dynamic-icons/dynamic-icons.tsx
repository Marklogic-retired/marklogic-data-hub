import React from "react";
import * as FontIcon from "react-icons/fa";


const DynamicIcons = ({name}) => {

  const IconComponent = FontIcon[name];
  if (!IconComponent) { // Return a default one
    return <FontIcon.FaShapes />;
  }

  return <IconComponent aria-label={`icon-${name}`}/>;
};

export default DynamicIcons;
