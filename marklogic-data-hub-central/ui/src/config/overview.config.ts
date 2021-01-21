const VERSION = "5.4";

const documentationLinkRoot = "https://docs.marklogic.com/datahub/" + VERSION + "/";
const documentationLinks = {
    load: documentationLinkRoot + "flows/loading-with-hubcentral.html",
    model: documentationLinkRoot + "entities/modeling-with-hubcentral.html",
    curate: documentationLinkRoot + "flows/curating-with-hubcentral.html",
    run: documentationLinkRoot + "flows/running-steps-with-hubcentral.html",
    explore: documentationLinkRoot + "tools/hubcentral/exploring-with-hubcentral.html",
}

const videoLinkRoot = "https://developer.marklogic.com/video/datahub/" + VERSION + "/";
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
