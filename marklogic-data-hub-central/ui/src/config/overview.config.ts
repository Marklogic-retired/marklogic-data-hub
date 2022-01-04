const VERSION = "5.5";

const documentationLinkRoot = "https://docs.marklogic.com/datahub/";
const documentationLinks = {
    tileSpecificLink: function (versionNum, tile) {
      switch (tile) {
        case "load": 
          return documentationLinkRoot + versionNum + "/" + "flows/loading-with-hubcentral.html"
        case "model": 
          return documentationLinkRoot + versionNum + "/" + "entities/modeling-with-hubcentral.html" 
        case "curate":
          return documentationLinkRoot + versionNum + "/" + "flows/curating-with-hubcentral.html"
        case "run":
          return documentationLinkRoot + versionNum + "/" + "flows/running-steps-with-hubcentral.html"
        case "explore": 
          return documentationLinkRoot + versionNum + "/" + "tools/hubcentral/exploring-with-hubcentral.html"
      }
    }
}

// TODO Video Tutorial links currently pegged to version 5.4, see: DHFPROD-7513
const videoLinkRoot = "https://developer.marklogic.com/video/datahub/5.4/";
const videoLinks = {
    load: videoLinkRoot + "data-hub-central-load",
    model: videoLinkRoot + "data-hub-central-model",
    curate: videoLinkRoot + "data-hub-central-curate",
    run: videoLinkRoot + "data-hub-central-run",
    explore: videoLinkRoot + "data-hub-central-explore",
}

export default {
    documentationLinks,
    videoLinks
};
