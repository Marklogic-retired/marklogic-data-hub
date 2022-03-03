import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import SocialMedia from "./SocialMedia";

const configMultiple = {
  component: "SocialMedia",
  config: {
    id: "socialmedia",
    title: "Social Media",
    site: {
      arrayPath: "result[0].extracted.person.socials.social",
      path: "site"
    },
    url: {
      arrayPath: "result[0].extracted.person.socials.social",
      path: "address"
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
    site: {
      arrayPath: "result[0].extracted.person.social",
      path: "site"
    },
    url: {
      arrayPath: "result[0].extracted.person.social",
      path: "address"
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
                "address": "https://dmoz.org/sit/amet/erat/nulla/tempus/vivamus/in.aspx"
              },
              {
                "site": "linkedin",
                "address": "http://printfriendly.com/viverra/dapibus/nulla/suscipit/ligula/in.jsp"
              },
              {
                "site": "twitter",
                "address": "http://globo.com/hac/habitasse/platea/dictumst.json"
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

const detailContextValue = {
  detail: socials,
  handleDetail: jest.fn()
};
describe("SocialMedia component", () => {
  test("Verify social media widget renders with a property object with multiple values", () => {
    const {getByText, getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <SocialMedia config={configMultiple.config} data={socials} />
      </DetailContext.Provider>
    );
    expect(getByText(configMultiple.config.title)).toBeInTheDocument();
    expect(getByTestId("social-icons")).toBeInTheDocument();
  })
  test("Verify social media widget renders with a property object with a single value", () => {
    const {getByText, getByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <SocialMedia config={configSingular.config} data={social} />
      </DetailContext.Provider>
    );
    expect(getByText(configSingular.config.title)).toBeInTheDocument();
    expect(getByTestId("social-icons")).toBeInTheDocument();
  })
});