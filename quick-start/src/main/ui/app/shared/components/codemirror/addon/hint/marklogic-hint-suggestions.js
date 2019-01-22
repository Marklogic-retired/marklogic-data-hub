(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {

    var name;
    // var selfFile = require("./marklogic-hint-suggestions.js)"; // used for directory look-up
    var docsFile = require("./marklogic-hint-docs.json");
    var typeFile = require("./marklogic-hint-types.json");
    var docsAdditionsFile = require("./marklogic-hint-docs-additions.json");  // for namespace + funcs not in RunDMC

    var registry = {
      "docs": {
        data: docsFile
      },
      "docsAdditions": {
        data: docsAdditionsFile
      },
      "types": {
        data: typeFile
      }
    };

    var loadingComplete = function() {
      var hasLoaded = true;
      for (name in registry) {
        if (!registry[name] || !registry[name].data)
          hasLoaded = false;
      }
      return hasLoaded;
    };

    // TODO: Post ML9, add docsAdditionsFile to Documentation DB to centralize
    // the source so we can keep maintenance of this list outside of Query Console.

    // var scripts = [].slice.call(document.getElementsByTagName('script'));
    // var path = scripts.filter(function(jsPath) {
    //   return (jsPath.src.indexOf(selfFile) !== -1);
    // });
    // var myDir = (path[0].src.split('?')[0]).split('/').slice(0, -1).join('/') + '/';

    // // lazy-load external JSON files
    // var requests = [];
    // for (name in registry) {
    //   var file, currentReq;
    //   file = registry[name].file;

    //   requests.push(new XMLHttpRequest());

    //   currentReq = requests[requests.length - 1];
    //   currentReq.registryName = name;
    //   currentReq.onreadystatechange = function() {
    //       var self = this;
    //       if (self.readyState == XMLHttpRequest.DONE ) {
    //          if (self.status == 200) {
    //              registry[self.registryName].data = JSON.parse(self.responseText);
    //          }
    //          else {
    //              console.warn('MarkLogic Auto-Complete Plugin Error: Unable to load "' + myDir + 'marklogic-hint-docs.json".  Auto-Complete feature disabled.');
    //          }
    //       }
    //   };

    //   currentReq.open("GET", myDir + file, true);
    //   currentReq.send();
    // }

    CodeMirror.defineExtension("marklogicHintSuggestions", function() {
        var suggestions, lang, type, ns;
        var docs, docsAdditions, types;

        if (loadingComplete()) {
          docs = registry.docs && registry.docs.data;
          docsAdditions = registry.docsAdditions && registry.docsAdditions.data;
          types = registry.types && registry.types.data;

          suggestions = {};
          suggestions.namespaces = {};
          suggestions.types = {};
          for (lang in docs) {
              if (!suggestions.namespaces[lang]) suggestions.namespaces[lang] = [];
              for (ns in docs[lang])
                suggestions.namespaces[lang].push(ns);
          }
          for (lang in docsAdditions) {
              if (!suggestions.namespaces[lang]) suggestions.namespaces[lang] = [];
              for (ns in docsAdditions[lang]) {
                // add to namespaces
                if (suggestions.namespaces[lang].indexOf(ns) === -1)
                  suggestions.namespaces[lang].push(ns);
                // add to docs
                if (!docs[lang][ns])
                  docs[lang][ns] = docsAdditions[lang][ns];
              }
          }
          for (lang in types) {
              if (!suggestions.types[lang])
                suggestions.types[lang] = types[lang];
          }
          suggestions.docs = docs;
        }

        return suggestions;
    });

});
