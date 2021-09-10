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

const colorOptionsArray : string[] = [
  "#D5D3DD",	"#CEE0ED",	"#D9F5F0",	"#C9EBC4",	"#FFF0A3",	"#F6D4A7",	"#E7B8B2",	"#EEC5D4",	"#D6D7D9",
  "#EAE9EE",	"#E6EFF6",	"#E1F3EC",	"#E4F5E1",	"#FFF8D1",	"#FAE9D3",	"#F3DBD8",	"#F6E2E9",	"#E3E4E5",
  "#DCDAEB",	"#BAD8E7",	"#CFE9E6",	"#E1EDB4",	"#FFECB0",	"#FFD0AE",	"#F3BEBE",	"#E2D2DC",	"#EEEFF1",
  "#EDECF5",	"#DCEBF3",	"#E7F4F2",	"#F0F6D9",	"#FFF5D7",	"#FFE7D7",	"#F9DEDE",	"#F0E8ED",
  "#BEC5DC",	"#CAE4EA",	"#D1F5E8",	"#E8ECC2",	"#EDD9C5",	"#FCC6B4",	"#FDC7D4",	"#E3DEEB",
  "#DEE2ED",	"#E4F1F4",	"#E8FAF4",	"#F8F8DE",	"#FCE7D1",	"#FDE2D9",	"#FEE3E9",	"#F1EEF5"
]

const customEdgeSVG: any = {
  //base 64 svg data for custom icons on edge arrows
  oneToMany: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzApIj4KPGxpbmUgeDE9IjAuNjgzMzgxIiB5MT0iOS42MTMwMiIgeDI9IjExLjY4MzQiIHkyPSIwLjYxMzAyMSIgc3Ryb2tlPSIjMzMzMzMzIi8+CjxsaW5lIHgxPSIwLjI3NzM1IiB5MT0iOS41ODM5NyIgeDI9IjEyLjI3NzQiIHkyPSIxNy41ODQiIHN0cm9rZT0iIzMzMzMzMyIvPgo8bGluZSB4MT0iMSIgeTE9IjkuNSIgeDI9IjEyIiB5Mj0iOS41IiBzdHJva2U9IiMzMzMzMzMiLz4KPC9zdmc+Cg==",
  oneToOne: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeDE9IjEiIHkxPSI5LjUiIHgyPSIxMiIgeTI9IjkuNSIgc3Ryb2tlPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=",
  oneToManyHover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzApIj4KPGxpbmUgeDE9IjAuNjgzMzgxIiB5MT0iOS42MTMwMiIgeDI9IjExLjY4MzQiIHkyPSIwLjYxMzAyMSIgc3Ryb2tlPSIjN0ZBREUzIi8+CjxsaW5lIHgxPSIwLjI3NzM1IiB5MT0iOS41ODM5NyIgeDI9IjEyLjI3NzQiIHkyPSIxNy41ODQiIHN0cm9rZT0iIzdGQURFMyIvPgo8bGluZSB4MT0iMSIgeTE9IjkuNSIgeDI9IjEyIiB5Mj0iOS41IiBzdHJva2U9IiM3RkFERTMiLz4KPC9zdmc+Cg==",
  oneToOneHover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMyAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeDE9IjEiIHkxPSI5LjUiIHgyPSIxMiIgeTI9IjkuNSIgc3Ryb2tlPSIjN0ZBREUzIi8+Cjwvc3ZnPgo="
}

// TODO temp hardcoded node data, remove when retrieved from db
let sampleMetadata = {
  BabyRegistry: {
    color: "#e3ebbc",
    instances: 5,
    x: 10,
    y: -100
  },
  Customer: {
    color: "#ecf7fd",
    instances: 63,
    x: 10,
    y: 50
  },
  Product: {
    color: "#ded2da",
    instances: 252,
    x: -10,
    y: -100
  },
  Order: {
    color: "#cfe3e8",
    instances: 50123,
    x: -300,
    y: 50
  },
  NamespacedCustomer: {
    color: "#dfe2ec",
    instances: 75,
    x: -600,
    y: -100
  },
  Person: {
    color: "#dfe2ec",
    instances: 75,
    x: -150,
    y: -100
  },
  Client: {
    color: "#dfe2ec",
    instances: 75,
    x: -300,
    y: -100
  },
  Relation: {
    color: "#ded2da",
    instances: 75,
    x: -400,
    y: -100
  },
  Concept: {
    color: "#ded2da",
    instances: 75,
    x: -300,
    y: -200
  }
};

export default {
    defaultOptions,
    defaultNodeProps,
    defaultEdgeProps,
    nodeStyles,
    customEdgeSVG,
    sampleMetadata,
    colorOptionsArray,
};
