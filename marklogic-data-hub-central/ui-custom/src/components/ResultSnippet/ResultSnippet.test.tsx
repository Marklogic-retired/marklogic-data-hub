
import {render} from "@testing-library/react";
import ResultSnippet from "./ResultSnippet";

const resultSnippetConfig = {
  "config": {
    "highlight": "red",
    "separator": "---",
  }
}

const searchResults = {
    "result": [
        {
            "extracted": {
                "person": {
                    "id": "101",
                    "name": "57 Becker Alley"
                }
            },
            "entityType": "person",
            "uri": "/person/101.xml",
            "snippet": {
                "match": {
                  "#text": "57Alley",
                  "path": "fn:doc(&quot;/person/10062.xml&quot;)/person/addresses/address[3]/street",
                  "match-string": "57 Becker Alley",
                  "highlight": "Becker"
                }
            }
        },
        {
            "extracted": {
                "person": {
                    "id": "102",
                    "name": "2010-02-02T03:23:14Z foo bar"
                }
            },
            "entityType": "person",
            "uri": "/person/102.xml",
            "snippet": {
                "match": [
                  {
                    "#text": "foo bar",
                    "path": "fn:doc(&quot;/person/10016.xml&quot;)/person/sources/source/ts",
                    "match-string": "2010-02-02T03:23:14Z foo bar",
                    "highlight": 23
                  },
                  {
                    "#text": "2010-02-02T03:23:14",
                    "path": "fn:doc(&quot;/person/10016.xml&quot;)/person/memberships/membership[1]/ts",
                    "match-string": "2010-02-02T03:23:14Z foo bar",
                    "highlight": [ "foo", "bar" ]
                  }
                ]
            }
        }
    ]
};

describe("ResultSnippet component", () => {
  test("Verify single match renders", () => {
    const {getByText, getByTestId} = render(
      <ResultSnippet config={resultSnippetConfig.config} data={searchResults.result[0]} />
    );
    expect(getByText("Becker")).toBeInTheDocument();
    expect(getByTestId("highlight-0-0")).toHaveStyle(`background-color: red`);
  });

  test("Verify multiple matches render", () => {
    const {getByText, getByTestId} = render(
      <ResultSnippet config={resultSnippetConfig.config} data={searchResults.result[1]} />
    );
    expect(getByText("23")).toBeInTheDocument();
    expect(getByTestId("highlight-0-0")).toHaveStyle(`background-color: red`);
    expect(getByText("foo")).toBeInTheDocument();
    expect(getByTestId("highlight-1-0")).toHaveStyle(`background-color: red`);
    expect(getByText("---")).toBeInTheDocument();
  });

});