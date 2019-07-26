const DataHub = require("/data-hub/5/datahub.sjs");

let dataHubInstance;

function instance(config = {}) {
  if (!dataHubInstance) {
    dataHubInstance = new DataHub(config);
  }
  return dataHubInstance;
}

module.exports = {
  instance
};
