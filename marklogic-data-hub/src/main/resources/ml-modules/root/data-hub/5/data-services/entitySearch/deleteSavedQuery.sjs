'use strict';
declareUpdate();

var id;

let documentUri = "/saved-queries/" + id + ".json";
let canDelete = cts.exists(cts.andQuery([cts.documentQuery(documentUri), cts.jsonPropertyValueQuery("owner", xdmp.getCurrentUser())]));
if(canDelete) {
    xdmp.documentDelete(documentUri);
}
