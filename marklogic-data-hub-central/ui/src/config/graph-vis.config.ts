const defaultOptions: any = {
  edges: {
      color: "#000000"
  },
  height: "500px",
  interaction: {
      hover: true
  }
};

const defaultNodeProps: any = {
  shape: "box",
  shapeProperties: {
    borderRadius: 2
  },
  font: {
    multi: true,
    align: "left",
    bold: { // entity name styles
      color: "#333",
      face: "arial",
      size: 14
    },
    mono: { // number of instances styles
      color: "#777",
      face: "arial",
      size: 14,
      vadjust: 6
    }
  },
  margin: {
    top: 12,
    right: 12,
    bottom: 16,
    left: 12,
  },
  widthConstraint: {
    minimum: 60
  },
  hidden: false
};

const defaultEdgeProps: any = {
  arrows: "to",
  color: "#666",
  font: {
    align: "top"
  }
};

const nodeStyles: any = {
  hoverColor: "#E9F7FE",
  selectColor: "#5B69AF"
}

export default {
    defaultOptions,
    defaultNodeProps,
    defaultEdgeProps,
    nodeStyles
};
