var config;

// config is a document-node, so must call toObject() first in order to modify it
config = config.toObject();

if (config["range-path-index"]) {
  config["range-path-index"].forEach(index => {
    let expr = index["path-expression"];
    const tokens = expr.split("/").slice(-2);
    const entityName = tokens[0];
    const propertyName = tokens[1];
    index["path-expression"] = "/customEnvelope/" + entityName + "/" + propertyName + "/value";
  })
}

// Must return a document-node
xdmp.toJSON(config);
