import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import MetadataValue from "./MetadataValue";

const meta = {
  color: "#96bde4",
  path: "classification",
  placement: "after",
  type: "block",
}
const metaPopover = {
  type: "block",
  color: "#5d6aaa",
  placement: "after",
  popover: {
    title: "Sources",
    dataPath: "source",
    placement: "right",
    cols: [
      {
        path: "name",
        type: "chiclet",
        colors: {
          "New York Times": "#d5e1de",
          "USA Today": "#ebe1fa",
          "Los Angeles Times": "#cae4ea",
          "Wall Street Journal": "#fae9d3",
          "Washington Post": "#fae3df",
          "Chicago Tribune": "#f0f6d9"
        }
      },
      {
        path: "ts",
        type: "datetime",
        format: "yyyy-MM-dd"
      }
    ]
  }
}

const data = {
  "classification": "U",
  "restricted": "false",
  "value": "Bello Tybi",
  "source": [
    {
      "name": "Chicago Tribune",
      "ts": "2017-01-24T16:17:52Z"
    },
    {
      "name": "Los Angeles Times",
      "ts": "2021-10-24T21:22:33Z"
    },
    {
      "name": "USA Today",
      "ts": "2010-09-21T15:24:31Z"
    }
  ]

}

describe('Metadata Component', () => {
  test('Verify single metadata renders correctly', () => {
    const {getByTestId, getByText} = render(
      <MetadataValue config={meta} data={data} />
    )
    expect(getByText("U")).toBeInTheDocument();
  });
  test('Verify a popover metadata renders correctly', async () => {
    const {getByText} = render(
      <MetadataValue config={metaPopover} data={data} />
    )
    expect(getByText("3")).toBeInTheDocument();
    const title = screen.queryByText("Sources");
    expect(title).not.toBeInTheDocument();
    fireEvent.click(getByText("3"));
    await waitFor(() => {
      expect(getByText("Sources")).toBeInTheDocument();
    })

  });
})