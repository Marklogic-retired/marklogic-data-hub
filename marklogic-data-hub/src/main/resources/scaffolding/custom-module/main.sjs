const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(content, options) {
  return content;
}

module.exports = {
  main: main
};
