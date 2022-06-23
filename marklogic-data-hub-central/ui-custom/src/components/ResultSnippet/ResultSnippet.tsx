import React from "react";
import "./ResultSnippet.scss";
import _ from "lodash";

/**
 * Component for showing the match snippet for a record.
 *
 * @component
 * @prop {object} config  Configuration object.
 * @prop {string} config.highlight  HTML color for highlighting match text (default "#FFFFB0").
 * @prop {string} config.weight  CSS weight for match text (default: "bold").
 * @prop {string} config.separator  String sepator between match strings (default: " ... ").
 * @prop {object} config.style  CSS style object applied to snippet content.
 */

type Props = {
  data?: any;
  config?: any;
  style?: any;
}

const ResultSnippet: React.ComponentType<Props> = (props) => {
  const {config, data} = props;
  const highlight = config.highlight ? config.highlight : "#FFFFB0";
  const weight = config.weight ? config.weight : "bold";
  const separator = config.separator ? config.separator : " ... ";
  // Force to array
  let matches = _.isArray(data.snippet.match) ? data.snippet.match : [data.snippet.match];
  let processed: any[] = [];
  matches.forEach((m, i1) => {
    let replaced = String(m["match-string"] ? m["match-string"] : "");
    if (m.highlight) {
      // Force to array
      let highlights = _.isArray(m.highlight) ? m.highlight : [m.highlight];
      highlights.forEach((h, i2) => {
        const re = new RegExp(h, "g");
        replaced = replaced.replace(re,
          "<span data-testid=\"highlight-"+i1+"-"+i2+
              "\" style=\"background-color:"+highlight+"; font-weight:"+weight+
              "\">"+h+"</span>"
        );
      });
    }
    processed.push(replaced);
  });

  let snippetStyle: any = props.style ? props.style : config?.style ? config.style : {};

  return (
    <div
      className="ResultSnippetContainer"
      data-testid="result-snippet-component"
      style={snippetStyle}
      dangerouslySetInnerHTML={{__html: processed.join("<span>"+separator+"</span>")}}
    />
  );
};

export default ResultSnippet;