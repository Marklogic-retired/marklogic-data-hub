// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var Pos = CodeMirror.Pos;
  var MarkLogic;
  var cm;
  var closing = null;
  var mlDocsSite = 'http://docs.marklogic.com/';
  var mode;
  var delimiters = {
    "xquery": ":",
    "javascript": "."
  };
  var prefixes = {
    "xquery": "$",
    "javascript": ""
  };
  var selectRegistered = false;
  var closeRegistered = false;
  var blurRegistered = false;
  var docsElement;
  var docsTemplate = '<h1><a href="{url}" target="_new">{name}</a></h1><h2>Summary</h2><p>{summary}</p><h2>Parameters</h2><ul>{params}</ul><h2>Required Privileges</h2><p>{privs}</p>{example}';
  var fillerText = '<p>aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa</p>';
  var keywords = {
    "javascript": ("break case catch continue debugger default delete do else false finally for function if in instanceof let new null return switch throw true try typeof var void while with").split(" "),
    "xquery": ("after ancestor ancestor-or-self and as ascending assert attribute before by case cast child comment declare default define descendant descendant-or-self descending document document-node element else eq every except external following following-sibling follows for function if import in instance intersect item let module namespace node of only or order parent precedes preceding preceding-sibling processing-instruction ref return satisfies schema schema-element self some sortby stable text then to treat typeswitch union variable version where xquery empty-sequence at castable encoding boundary-space ordering ordered unordered copy-namespaces preserve no-preserve strip empty least greatest inherit no-inherit type-name xml children skip validate nilled formula subscript element-only instance of derives-from nillable node-name string-value typed-value is-id is-idrefs base-uri attributes in-scope-namespaces target content unparsed-entities document-uri treat local schema-attribute byte-order-mark media-type normalization-form omit-xml-declaration standalone").split(" ")
  };
  var globalObjects = {
    "javascript": {},
    "xquery": {}
  };  // stores everything under Docs "Global-Objects"

  /* utility functions */
  function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    return arr.indexOf(item) != -1;
  }

  // for px valued styles only (convenience func)
  function getComputedStyleValue( el, style ) {
    return parseInt(window.getComputedStyle(el, null).getPropertyValue(style).replace('px',''));
  }

  /* docs functions */
  function getOffset( el ) {
      var _x = 0;
      var _y = 0;
      var _w = el.offsetWidth;
      _w += getComputedStyleValue(el, 'padding-left');
      _w += getComputedStyleValue(el, 'padding-right');
      _w += getComputedStyleValue(el, 'border-left-width');
      _w += getComputedStyleValue(el, 'border-right-width');
      var _h = el.offsetHeight;
      _h += getComputedStyleValue(el, 'padding-top');
      _h += getComputedStyleValue(el, 'padding-bottom');
      _h += getComputedStyleValue(el, 'border-top-width');
      _h += getComputedStyleValue(el, 'border-bottom-width');
      while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft;
          _y += el.offsetTop;
          el = el.offsetParent;
      }
      return { top: _y, left: _x, width:_w, height:_h };
  }

  function interpolate(str) {
    return function interpolate(o) {
        return str.replace(/{([^{}]*)}/g, function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        });
    };
  }

  function camelToDash(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  function dashToCamel(str) {
    return str.toLowerCase().replace(/-(.)/g, function(match, found) {
      return found.toUpperCase();
    });
  }

  function flatten(data) {
    return (Array.isArray(data) ? data.join("") : data);
  }

  function prepExamples(data) {
    var separator = "<h2>Example</h2>";
    var prefix = "<h2>Example</h2>";
    var wrapperSt = "<xmp>";
    var wrapperEnd = "</xmp>";
    var examples = (
                  Array.isArray(data) ?
                    data.reduce(function(a, b) {
                      var str = (a + (separator || '') + (wrapperSt || '') + b + (wrapperEnd || ''));
                      str = str.replace("<pre>","").replace("</pre>","");
                      return str;
                    }, '') :
                    data
                );
    return examples;
  }

  function maintainFocus() {
    clearTimeout(closing);
    closing = null;
    CodeMirror.signal(cm, "stopHintsClose", cm);
  }

  function keepFocus() {
    // add small timeout to allow editor.on("close") event to fire first, which we will then manipulate.
    setTimeout(function() {
      docsElement.setAttribute("data-clicked", "true");
    }, 1);
  }

  function showDocs(data, el) {
    if (!data.obj) {
      closeDocs();  // close previously open docs window
      return;
    }
    var pos = getOffset(el.parentElement);

    if (!docsElement) {
      docsElement = document.createElement("div");
      docsElement.setAttribute("tabindex", "100"); // need for focus handling
      docsElement.className = "CodeMirror-hint-docs";
      document.body.appendChild(docsElement);
      docsElement.addEventListener("click", keepFocus);
      docsElement.addEventListener("focus", keepFocus);
      docsElement.addEventListener("blur", function() {
        // manually trigger blur with CM, since we hijacked their eventing
        docsElement.setAttribute("data-clicked", "false");
        CodeMirror.signal(cm, "blur", cm);
      });
    }
    docsElement.setAttribute("data-clicked", "false"); // need for handling focus on docs DIV
    docsElement.style.display = "block";
    docsElement.innerHTML = fillerText;
    var docsWidth = docsElement.offsetWidth;
    var spacer = 5;
    var docsRight = {
      top: pos.top,
      right: pos.left + pos.width + docsWidth + spacer,
      left: pos.left + pos.width
    };
    var docsLeft = {
      top: pos.top,
      left: pos.left - docsWidth - spacer
    };
    var docsBottom = {
      top: pos.top + pos.height + spacer,
      left: pos.left,
      width: pos.width
    };
    docsElement.innerHTML = '';

    var position = (docsRight.right > window.innerWidth) ?
                  ((docsLeft.left < 0) ? docsBottom : docsLeft) :
                  docsRight;
    docsElement.style.left = position.left + "px";
    docsElement.style.top = position.top + "px";
    if (position.width)
      docsElement.style.width = position.width + "px";
    else
      docsElement.style.removeProperty('width');

    // generate params HTML (TODO: templating?)
    var params = '';
    var delimiter = delimiters[mode];
    var prefix = prefixes[mode];
    for (var index in data.obj.params) {
      var optWrapOpen = (data.obj.params[index].optional) ? '[' : '';
      var optWrapClose = (data.obj.params[index].optional) ? ']' : '';
      params += '<li>';
      params += '<span class="CodeMirror-hint-docs-50percent">' + optWrapOpen + prefix + data.obj.params[index].name + optWrapClose + ' <span class="CodeMirror-hint-param-type">&lt;' + data.obj.params[index].type + '&gt;</span></span>';
      params += '<span class="CodeMirror-hint-docs-50percent">' + data.obj.params[index].description + '</span>';
      params += '</li>';
    }
    docsElement.innerHTML = interpolate(docsTemplate)({
      url: mlDocsSite + (data.context ? data.context + delimiter : '') + data.obj.name,
      name: (data.context ? data.context + delimiter : '') + data.text,
      summary: data.obj.summary ? flatten(data.obj.summary) : 'No summary available',
      params: params,
      privs: data.obj.privilege ? flatten(data.obj.privilege) : 'No privileges required',
      example: data.obj.example ? prepExamples(data.obj.example) : '<h2>Example</h2> <p>No examples available</p>'
    });
  }

  function closeDocs(closeWithDelay) {
    var close = function() {
      // only close if the hints have closed
      if (docsElement) {
        docsElement.style.display = "none";
        docsElement.setAttribute("data-clicked", "false");
        // Ugly work-around: closeDocs triggered with delay every time
        // show-hints calls close event (which happens every time you type).
        // The 100ms delay causes a problem in the case of the suggestions
        // actually being re-drawn, not technically closed. The close() event
        // occurs but the suggestions get redrawn, so we trigger another timeout
        // to see if the suggestions still exist and re-display the docs if the do.
        doubleCheckClose = setTimeout(function() {
          var hints = document.getElementsByClassName("CodeMirror-hint");
          var first = hints[0];
          var isFunction = (first && ((" " + first.className + " ").replace(/[\t\r\n\f]/g, " ").indexOf(" CodeMirror-hint-type-function ") > -1)) ? true : false;
          if (first && isFunction)
            docsElement.style.display = "block";
        }, 1);
      }
    };

    if (closeWithDelay)
      // close with delay, because we may interrupt the blur event
      // and keep open if the user is clicking on the docsElement
      // In that case, closing timer is cleared and the close never occurs.
      closing = setTimeout(close, 100);
    else
      close();
  }


  /* hint functions */
  function scriptHint(editor, getToken, options) {
    // Find the token at the cursor
    var context, cur = editor.getCursor(), token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    if (token.string === '') return;
    token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_-]*$/.test(token.string)) {
      token = {start: cur.ch, end: cur.ch, string: "", state: token.state,
               type: token.string == delimiters[mode] ? "property" : null};
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    var tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type == "property") {
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      // if (tprop.string != ".") return;
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (!context) context = [];
      context.push(tprop);
    }
    return {list: getCompletions(token, context, options),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)};
  }

  function marklogicHint(editor, options) {
    cm = editor;
    var s = editor.marklogicHintSuggestions;
    var t = editor.marklogicHintTemplates;

    // create the MarkLogic namespace if our suggestions and templates exist,
    // if not, wait for them to be fetched
    if (!MarkLogic && !!s() && !!t()) {
      MarkLogic = {
        "suggestions": s ? s() : undefined,
        "templates": t ? t() : undefined
      };
      globalObjects.javascript = MarkLogic.suggestions.docs.javascript['Global-Object'];
      delete MarkLogic.suggestions.namespaces.javascript[MarkLogic.suggestions.namespaces.javascript.indexOf('Global-Object')];
      delete MarkLogic.suggestions.docs.javascript['Global-Object'];
    }
    mode = editor.getMode().name;  // if switched, we'll pick it up.

    if (!selectRegistered) {
      editor.on("select",showDocs);
      selectRegistered = true;
    }
    if (!closeRegistered) {
      editor.on("close",function() {
        closeDocs(true);
      });
      closeRegistered = true;
    }
    if (!blurRegistered) {
      editor.on("blur", function() {
        setTimeout(function() {
          if (docsElement && docsElement.getAttribute("data-clicked") === "true")
            maintainFocus();
        },99);
      });
      blurRegistered = true;
    }

    // don't trigger hints until we're properly constructed our
    // MarkLogic Object - contents lazy-load
    if (!MarkLogic) return;

    return scriptHint(editor,
                      function (e, cur) {return e.getTokenAt(cur);},
                      options);
  }


  CodeMirror.registerHelper("hint", "javascript", marklogicHint);
  CodeMirror.registerHelper("hint", "xquery", marklogicHint);

  function getCompletions(token, context, options) {
    var found = {},
        start = token.string,
        global = options && options.globalScope || window,
        funcParams = options && options.marklogicHintParamCompletionSetting,
        hasContext = (context && context.length > 0) ? true : false,
        foundExactMatch = false;
    function maybeAdd(name, obj, context, type) {
      found[type] = !!found[type] ? found[type] : [];
      // if ((start === name && name !== '$')
      //       || foundExactMatch
      //       || (type === 'type' && context && start === name.replace((context || '') + delimiters[mode],''))) {
      //   // string typed matches exactly with a variable or function - don't show matches.
      //   // '$' is considered, by the XQuery mode parser, to be it's own local var, so we
      //   // exclude that from the matching query.
      //   foundExactMatch = true;
      //   return;
      // }
      if (!!name && (!!start || (!start && hasContext)) && name.indexOf(start, 0) !== -1 &&
        (type === 'global' || name !== start || (hasContext && name === start)) && !arrayContains(found[type], name)) {
        if (type === 'type' && context && name.indexOf((context || '') + delimiters[mode]) === -1) return;
        var completionObj = {};
        // suggestion
        if (obj) {
          var prefix = prefixes[mode];
          var text = name + '(';
          var nameHighlighted = (name).replace(new RegExp(start,'g'),'<strong>' + start + '</strong>');
          var displayText = '<span class="CodeMirror-hint-func-name">' + nameHighlighted + '</span><span class="CodeMirror-hint-func-paren">(</span>';
          if (obj.params && obj.params.length > 0){
            var numProps = obj.params.length;
            for (var index in obj.params) {
              // add brackets around optional params
              var optional = obj.params[index].optional;
              var optOpen = optional ? '[' : '';
              var optClose = optional ? ']' : '';
              numProps--;
              displayText += optOpen + prefix + obj.params[index].name + ' <span class="CodeMirror-hint-param-type">&lt;' + obj.params[index].type + '&gt;</span>' + optClose + (numProps > 0 ? ', ' : '');
              // if req_params_only, then skip adding this param to "text",
              // the text that fills in the editor when completed
              if (funcParams === "req_params_only" && optional || funcParams === "no_params")
                continue;
              var nextRequiresComma = (funcParams === "req_params_only"
                                          && obj.params[parseInt(index)+1]
                                          && obj.params[parseInt(index)+1].optional) ? false : true;
              var comma = (numProps > 0 && nextRequiresComma) ? ', ' : '';
              text += optOpen + prefix + obj.params[index].name + optClose + comma;
            }
          }
          text += ')';
          displayText += (obj.return) ? '<span class="CodeMirror-hint-func-paren">)</span> <span class="CodeMirror-hint-return">returns</span> <span class="CodeMirror-hint-param-type">&lt;' + obj.return + '&gt;</span>' : ')';
          completionObj.text = text;
          completionObj.displayText = displayText;
        } else {
          // this is a local variable, keyword or type
          if (type === 'type') {
            if (context && name.indexOf(context + delimiters[mode]) !== -1)
              completionObj.text = name.replace((context || '') + delimiters[mode],'');
            else
              completionObj.text = name;
          }
          else
            completionObj.text = name;
        }
        completionObj.context = context; // used to render namespace info in docs template
        completionObj.obj = obj; // used to render all docs info
        completionObj.render = function(el, self, data) {
          var text = data.displayText ? data.displayText : data.text;
          // var type = data.displayText ? 'func' : 'local';
          // type = "<span class='CodeMirror-hint-type'>" + type + "</span>";
          el.className += " CodeMirror-hint-type-" + type;
          el.innerHTML = "<span class='CodeMirror-hint-text'>" + text + "</span>";
        };
        found[type].push(completionObj);
      }
    }

    var v, t, h, name, mlContextType;

    if (context && context.length) {
      // If this is a property, see if it belongs to some object we can
      // find in the current environment.
      var obj = context.pop(), base, lastContext = obj.string;
      if (obj.type && obj.type.indexOf("variable") === 0) {
        base = base || MarkLogic.suggestions.docs[mode][obj.string];
        if (base)
          mlContextType = 'namespace';
        else
          mlContextType = 'type'; // a type with a '.' in the sting
      } else if (obj.type == "string") {
        base = "";
      } else if (obj.type == "atom") {
        base = 1;
      } else if (obj.type == "function") {
        if (global.jQuery !== null && (obj.string == '$' || obj.string == 'jQuery') &&
            (typeof global.jQuery == 'function'))
          base = global.jQuery();
        else if (global._ !== null && (obj.string == '_') && (typeof global._ == 'function'))
          base = global._();
      }
      while (base !== null && context.length) {
        lastContext = context.pop().string;
        base = base[lastContext];
      }
      // add our functions to the suggestion list that are a part
      // of the namespace defined in 'base' object
      if (base !== null && mlContextType === 'namespace')
        for (name in base) maybeAdd(name, base[name], lastContext, "function");

      // add types with '.' in the string
      if (mlContextType === 'type')
        if (MarkLogic.suggestions && MarkLogic.suggestions.types && MarkLogic.suggestions.types[mode]) {
          for (v = 0; v < MarkLogic.suggestions.types[mode].length; v++)
            maybeAdd(MarkLogic.suggestions.types[mode][v], undefined, lastContext, "type");
        }
    } else {

      // If no context, then add all local variables to the suggestion list
      for (v = token.state.localVars; v; v = v.next)
        if (token.string !== v.name)
          maybeAdd(v.name, undefined, undefined, "local");

      // module suggestions
      if (MarkLogic.suggestions) {
        for (v = 0; v < MarkLogic.suggestions.namespaces[mode].length; v++)
          maybeAdd(MarkLogic.suggestions.namespaces[mode][v], undefined, undefined, "module");
      }

      // keywords
      for (v = 0; v < keywords[mode].length; v++)
        maybeAdd(keywords[mode][v], undefined, undefined, "keyword");

      // types
      if (MarkLogic.suggestions && MarkLogic.suggestions.types && MarkLogic.suggestions.types[mode]) {
        for (v = 0; v < MarkLogic.suggestions.types[mode].length; v++)
          maybeAdd(MarkLogic.suggestions.types[mode][v], undefined, undefined, "type");
      }

      // global
      for (name in globalObjects[mode])
        maybeAdd(name, globalObjects[mode][name], undefined, "global");

      // templates
      // if (MarkLogic.templates) {
      //   for (var v = 0; v < MarkLogic.templates[mode].length; v++)
      //     maybeAdd(MarkLogic.templates[mode][v], undefined, undefined, "template");
      // }
    }

    // sort each array alphabetically and return
    var hints = [];
    hints = hints.concat(found.local || [],
                         found.module || [],
                         found["function"] || [],
                         found.keyword || [],
                         found.type || [],
                         found.global || []);
     //                  found["template"]

    // sort all suggestions alphabetically
    hints = hints.sort(function(o1, o2) {
          var textA, textB;
          if (o1.obj && o1.obj.name && o2.obj && o2.obj.name) {
            // functions
            textA = o1.obj.name.toUpperCase();
            textB = o2.obj.name.toUpperCase();
          } else {
            // namespaces
            textA = o1.text;
            textB = o2.text;
          }
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

    var beginningHintMatch = -1;
    if (start)
      for (var h=0; h < hints.length; h++) {
        if (hints[h].text.lastIndexOf(start, 0) === 0 && beginningHintMatch === -1)
          beginningHintMatch = h;
      }

    // if no match found default to first in the list
    beginningHintMatch = (beginningHintMatch === -1) ? 0 : beginningHintMatch;

      // usability feature: if the beginning of what was typed
      // matches the beginning of a found hint, then move highlight
      // to that position and scroll it into view (done automatically)
    if (hints.length > 0 && !foundExactMatch)
      setTimeout(function() {
        if (cm.state.completionActive && cm.state.completionActive.widget)
          cm.state.completionActive.widget.changeActive(beginningHintMatch);
      }, 1);

    return (!foundExactMatch) ? hints : [];
  }
});
