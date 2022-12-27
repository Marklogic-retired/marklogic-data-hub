import DataHub from "/data-hub/5/datahub.mjs";

let dataHubInstance;

function instance(config = {}) {
  if (!dataHubInstance) {
    dataHubInstance = new DataHub(config);
  }
  return dataHubInstance;
}

export default {
    instance
};
