import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import SocialMedia from "./SocialMedia";

const configMultiple = {
  component: "SocialMedia",
  config: {
    id: "socialmedia",
    title: "Social Media",
    social: {
      arrayPath: "result[0].extracted.person.socials.social",
      site:"site",
      handle: "handle",
      url: "address"
    },
    sites: {
      facebook: {
        title: "facebook",
        icon: "Facebook",
        color: "#3B5998",
        size: 24
      },
      twitter: {
        title: "twitter",
        icon: "Twitter",
        color: "#00ACEE",
        size: 24
      },
      linkedin: {
        title: "linkedin",
        icon: "Linkedin",
        color: "#0E76A8",
        size: 24
      },
      instagram: {
        title: "instagram",
        icon: "Instagram",
        color: "#8134AF",
        size: 24
      },
      youtube: {
        title: "youtube",
        icon: "Youtube",
        color: "#c4302b",
        size: 24
      }
    }
  }
}
const configSingular = {
  component: "SocialMedia",
  config: {
    id: "socialmedia",
    title: "Social Media",
    social: {
      arrayPath: "result[0].extracted.person.social",
      site:"site",
      handle: "handle",
      url: "address"
    },
    sites: {
      facebook: {
        title: "facebook",
        icon: "Facebook",
        color: "#3B5998",
        size: 24
      },
      twitter: {
        title: "twitter",
        icon: "Twitter",
        color: "#00ACEE",
        size: 24
      },
      linkedin: {
        title: "linkedin",
        icon: "Linkedin",
        color: "#0E76A8",
        size: 24
      },
      instagram: {
        title: "instagram",
        icon: "Instagram",
        color: "#8134AF",
        size: 24
      },
      youtube: {
        title: "youtube",
        icon: "Youtube",
        color: "#c4302b",
        size: 24
      }
    }
  }
}
const socials = {
  "result": [
    {
      "extracted": {
        "person": {
          "socials": {
            "social": [
              {
                "site": "twitter",
                "address": "https://example.org/jsmith"
              },
              {
                "site": "linkedin",
                "address": "https://example.com/jsmith1"
              },
              {
                "site": "twitter",
                "address": "https://example.org/johnsmith"
              }
            ]
          }
        }
      }
    }
  ]
};
const social = {
  "result": [
    {
      "extracted": {
        "person": {
          "social":
          {
            "site": "twitter",
            "address": "https://dmoz.org/sit/amet/erat/nulla/tempus/vivamus/in.aspx"
          }

        }
      }
    }
  ]
};

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: socials,
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

describe("SocialMedia component", () => {
  test("Verify social media widget renders with a property object with multiple values", () => {
    const {getByText, getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <SocialMedia config={configMultiple.config} data={socials} />
      </DetailContext.Provider>
    );
    expect(getByText(configMultiple.config.title)).toBeInTheDocument();
    expect(getByTestId("social-items")).toBeInTheDocument();
  })
  test("Verify social media widget renders with a property object with a single value", () => {
    const {getByText, getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <SocialMedia config={configSingular.config} data={social} />
      </DetailContext.Provider>
    );
    expect(getByText(configSingular.config.title)).toBeInTheDocument();
    expect(getByTestId("social-items")).toBeInTheDocument();
  })
});