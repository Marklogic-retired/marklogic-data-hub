
import {render, waitFor} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import ImageGalleryMulti from "./ImageGalleryMulti";



const configMultiple = {
  component: "ImageGalleryMulti",
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
            "name": "Washington Post",
            "ts": "2011-09-29T17:38:02Z"
          }
        },
        {
          "url": "http://example.org/image1.jpg",
          "source": {
            "name": "Wall Street Journal",
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
describe("ImageGalleryMulti component", () => {
  test("Verify ImageGalleryMulti widget renders correctly images", () => {
    const {getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <ImageGalleryMulti config={configMultiple.config} data={detail} />
      </DetailContext.Provider>
    );
    waitFor(() => {
      expect(getByTestId("ImageGalleryMulti-component")).toBeInTheDocument();
      expect(getByTestId("item-0")).toBeInTheDocument();
      expect(getByTestId("item-1")).toBeInTheDocument();
    })
  });

});