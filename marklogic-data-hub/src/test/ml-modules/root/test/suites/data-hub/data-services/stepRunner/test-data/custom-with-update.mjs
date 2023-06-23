
function main(content, options) {
  xdmp.documentInsert("/custom-with-update-doc.json", {inserted: true}, {permissions: [xdmp.permission("data-hub-common-writer", "update"), xdmp.permission("data-hub-common", "read")]});
  return null;
}

export default {
  main
};