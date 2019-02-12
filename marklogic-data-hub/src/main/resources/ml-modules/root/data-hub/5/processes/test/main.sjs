function main(id, rawContent, options) {
    let envelope = {
      "envelope" : {
        "triples": {},
        "headers": {
          "createdOn": fn.currentDateTime(),
          "optionsTest" : options.test
        },
        "content": rawContent
      }
    };
    return envelope;
  }

module.exports = {
  main: main
};
