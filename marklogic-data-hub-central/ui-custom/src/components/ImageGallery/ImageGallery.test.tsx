
import {render, waitFor, fireEvent} from "@testing-library/react";
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
    modal: {
      title: {
        component: "Value",
        path: "url",
        config: {
          style: {
            fontStyle: "bold"
          }
        }
      },
      items: [
        {
          component: "Value",
          label: "Source",
          path: "source.name",
          config: {}
        },
        {
          component: "DateTime",
          label: "Uploaded on",
          path: "source.ts",
          config: {
            format: "MMMM dd, yyyy"
          }
        },
        {
          component: "Value",
          label: "Uploaded by",
          path: "source.uploadedBy",
          config: {
            className: "foo"
          }
        }
      ]
    },
    download: true
  }
};

const detail = {
  person: {
    images: {
      "image": [
        {
          "url": "http://example.org/image1.jpg",
          title: "image1.jpg",
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

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: detail,
    recentRecords: [],
    loading: false,
    expandIds: EXPANDIDS,
    handleGetDetail: jest.fn(),
    handleGetRecent: jest.fn(),
    handleGetRecentLocal: jest.fn(),
    handleSaveRecent: jest.fn(),
    handleSaveRecentLocal: jest.fn(),
    handleExpandIds: jest.fn(),
    handleDeleteAllRecent: jest.fn(), 
    hasSavedRecords: jest.fn()
};

describe("ImageGallery component", () => {

  test("Verify ImageGallery widget renders correctly", () => {
    const {getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <ImageGallery config={configMultiple.config} data={detail} />
      </DetailContext.Provider>
    );
    waitFor(() => {
      expect(getByTestId("ImageGallery-component")).toBeInTheDocument();
      expect(getByTestId("item-0")).toBeInTheDocument();
    })
  });

  test("Verify Image metadata modal renders correctly", () => {
    const {getByTestId, getByText} = render(
      <DetailContext.Provider value={detailContextValue}>
        <ImageGallery config={configMultiple.config} data={detail} />
      </DetailContext.Provider>
    );
    waitFor(() => {
      expect(getByTestId("ImageGalleryMulti-component")).toBeInTheDocument();
      expect(getByTestId("item-0")).toBeInTheDocument();
      fireEvent.click(getByTestId("item-0"));
      expect(getByText("image1.jpg")).toBeInTheDocument();
      expect(getByText("Washington Post")).toBeInTheDocument();

    })
  });
});