
import {render, waitFor} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import ImageGallery from "./ImageGallery";

const configMultiple = {
  component: "ImageGallery",
  config: {
    style: {
      height: "150px",
      width: "150px"
    },
    images: {
      url: {
        arrayPath: "person.images.image",
        path: "url"
      }
    },
    metadata: {},
    download: true
  }
};

const detail = {
  person: {
    images: {
      "image": [
        {
          "url": "http://example.org/image1.jpg",
          "source": {
            "name": "Name 1",
            "ts": "2011-09-29T17:38:02Z"
          }
        },
        {
          "url": "http://example.org/image2.jpg",
          "source": {
            "name": "Name 1",
            "ts": "2012-04-10T16:00:11Z"
          }
        }
      ]
    }
  }
};

const detailContextValue = {
  detail: detail,
  handleDetail: jest.fn()
};
describe("ImageGallery component", () => {

  test("Verify ImageGallery widget renders correctly", () => {
    const {getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <ImageGallery config={configMultiple.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByTestId("ImageGallery-component")).toBeInTheDocument();
    expect(getByTestId("item-0")).toBeInTheDocument();
    expect(getByTestId("item-1")).toBeInTheDocument();
  });
});