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

const customEdgeSVG: any = {
  //base 64 svg data for custom icons on edge arrows
  oneToMany: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzApIj4KPGxpbmUgeDE9IjAuNjgzMzgxIiB5MT0iOS42MTMwMiIgeDI9IjExLjY4MzQiIHkyPSIwLjYxMzAyMSIgc3Ryb2tlPSIjMzMzMzMzIi8+CjxsaW5lIHgxPSIwLjI3NzM1IiB5MT0iOS41ODM5NyIgeDI9IjEyLjI3NzQiIHkyPSIxNy41ODQiIHN0cm9rZT0iIzMzMzMzMyIvPgo8bGluZSB4MT0iMSIgeTE9IjkuNSIgeDI9IjEyIiB5Mj0iOS41IiBzdHJva2U9IiMzMzMzMzMiLz4KPC9zdmc+Cg==",
  oneToOne: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeDE9IjEiIHkxPSI5LjUiIHgyPSIxMiIgeTI9IjkuNSIgc3Ryb2tlPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=",
  oneToManyHover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzApIj4KPGxpbmUgeDE9IjAuNjgzMzgxIiB5MT0iOS42MTMwMiIgeDI9IjExLjY4MzQiIHkyPSIwLjYxMzAyMSIgc3Ryb2tlPSIjN0ZBREUzIi8+CjxsaW5lIHgxPSIwLjI3NzM1IiB5MT0iOS41ODM5NyIgeDI9IjEyLjI3NzQiIHkyPSIxNy41ODQiIHN0cm9rZT0iIzdGQURFMyIvPgo8bGluZSB4MT0iMSIgeTE9IjkuNSIgeDI9IjEyIiB5Mj0iOS41IiBzdHJva2U9IiM3RkFERTMiLz4KPC9zdmc+Cg==",
  oneToOneHover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeDE9IjEiIHkxPSI5LjUiIHgyPSIxMiIgeTI9IjkuNSIgc3Ryb2tlPSIjN0ZBREUzIi8+Cjwvc3ZnPgo="
}

export default {
    defaultOptions,
    defaultNodeProps,
    defaultEdgeProps,
    nodeStyles,
    customEdgeSVG
};
