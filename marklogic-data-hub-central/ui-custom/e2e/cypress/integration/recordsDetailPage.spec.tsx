import landingPage from "../support/pages/landing";
import searchPage from "../support/pages/search";
import recordDetailsPage from "../support/pages/recordDetails";

let searchPerson="";
let response;

describe("Entity Viewer Record Detail page ", () => {
  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.intercept({
      method: "GET",
      url: "/api/explore**",
    }).as("getSearch");
  });
  afterEach(() => {
    cy.saveLocalStorage();
  });
  it("Visit Entity Viewer Application ", () => {
    cy.visit("/");
    landingPage.whatsNewChart().should("be.visible");
  });
  it("Click on search button for navigating to search page and get search values", () => {
    cy.intercept({
      method: "GET",
      url: "/api/explore/getRecord?recordId=/**",
    }).as("something");
    searchPage.searchButton().click();
    cy.wait("@getSearch").its("response.statusCode").should("equal", 200);
    searchPage.resultsList().should("be.visible");
    searchPage.resultTitle().eq(0).then(nameVal => {
      searchPerson = nameVal.text();
    });
    searchPage.resultTitle().eq(0).click({force: true});
    cy.wait("@something").then((resp) => {
      response = resp.response.body[0].person;
    });
    recordDetailsPage.backToSearch().should("be.visible");
  });
  it("Validate the title, thumbnail and memberships of the record", () => {
    recordDetailsPage.recordTitle().should("have.text", searchPerson);
    recordDetailsPage.thumbNail().invoke("attr", "src").should("eq", response.images.image[0].url);
    let memberships = response.memberships.membership;
    for (let i=0; i< memberships.length; i++) {
      cy.findByText(memberships[i].list).parent().should("have.class", "item success");
      cy.findByText(memberships[i].list).parent().findByTestId("success-icon").should("be.visible");
      cy.findByText(memberships[i].list).parent().findByTestId("dateTimeContainer").should("have.text", memberships[i].ts);
    }
  });
  it("Validate the name, phone, email, ssn of the record", () => {
    recordDetailsPage.recordValue("name").contains(response.nameGroup.fullname.value).should("be.visible");
    recordDetailsPage.recordValue("phone").contains(response.phone).should("be.visible");
    recordDetailsPage.recordValue("email").contains(response.emails.email[0].value).should("be.visible");
    recordDetailsPage.recordValue("ssn").contains(response.ssn.value).should("be.visible");
    cy.findByText(response.ssn.classification).should("be.visible");
    let addresses = response.addresses.address;
    for (let i=0; i< addresses.length; i++) {
      recordDetailsPage.recordText("address", addresses[i].street).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].city).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].state).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].postal).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].country).should("be.visible");
    }
    let schools = response.schools.school;
    for (let i=0; i< schools.length; i++) {
      recordDetailsPage.recordText("school", schools[i].name).should("be.visible");
      recordDetailsPage.recordText("school", schools[i].city).should("be.visible");
      recordDetailsPage.recordText("school", schools[i].country).should("be.visible");
    }
  });
  it("Validate the name, phone,email, ssn of the record", () => {
    recordDetailsPage.recordValue("name").contains(response.nameGroup.fullname.value).should("be.visible");
    recordDetailsPage.recordValue("phone").contains(response.phone).should("be.visible");
    recordDetailsPage.recordValue("email").contains(response.emails.email[0].value).should("be.visible");
    recordDetailsPage.recordValue("ssn").contains(response.ssn.value).should("be.visible");
    cy.findByText(response.ssn.classification).should("be.visible");
  });
  it("Validate the addresses of the record", () => {
    let addresses = response.addresses.address;
    for (let i=0; i< addresses.length; i++) {
      recordDetailsPage.recordText("address", addresses[i].street).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].city).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].state).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].postal).should("be.visible");
      recordDetailsPage.recordText("address", addresses[i].country).should("be.visible");
    }
  });
  it("Validate the schools of the record", () => {
    let schools = response.schools.school;
    for (let i=0; i< schools.length; i++) {
      recordDetailsPage.recordText("school", schools[i].name).should("be.visible");
      recordDetailsPage.recordText("school", schools[i].city).should("be.visible");
      recordDetailsPage.recordText("school", schools[i].country).should("be.visible");
    }
  });
  it("Validate the social media and meta data popup of the record", () => {
    let socials = response.socials.social;
    for (let i=0; i< socials.length; i++) {
      recordDetailsPage.socialHandle().eq(i).should("have.text", socials[i].handle);
      recordDetailsPage.socialItems().eq(i).trigger("mouseover");
      cy.findByText(socials[i].address).should("be.visible");
    }
    recordDetailsPage.metaDataVal().eq(1).click().invoke("attr", "aria-describedby").should("exist");
  });
  it("Validate the expand All and collapse All ", () => {
    cy.contains("button", "Collapse All").should("be.visible").click({force: true});
    recordDetailsPage.expandSections().should("have.length", 1);
    cy.contains("button", "Expand All").should("be.visible").click({force: true});
    recordDetailsPage.expandSections().should("have.length", 6);
  });
  it("Validate the expand and collapse individual sections ", () => {
    //Memeberships
    recordDetailsPage.collapseButton().eq(0).click({force: true});
    recordDetailsPage.membershipContainer().should("not.be.visible");
    recordDetailsPage.expandButton().eq(0).click({force: true});
    recordDetailsPage.membershipContainer().should("be.visible");
    //Personal Info
    recordDetailsPage.collapseButton().eq(1).click({force: true});
    recordDetailsPage.recordValue("name").should("not.be.visible");
    recordDetailsPage.expandButton().eq(1).click({force: true});
    recordDetailsPage.recordValue("name").should("be.visible");
    //Relationships
    recordDetailsPage.collapseButton().eq(2).click({force: true});
    recordDetailsPage.relationships().should("not.be.visible");
    recordDetailsPage.expandButton().eq(2).click({force: true});
    recordDetailsPage.relationships().should("be.visible");
    //Image Gallery
    recordDetailsPage.collapseButton().eq(3).click({force: true});
    recordDetailsPage.imageGallery().should("not.be.visible");
    recordDetailsPage.expandButton().eq(3).click({force: true});
    recordDetailsPage.imageGallery().should("be.visible");
    //Timeline
    recordDetailsPage.collapseButton().eq(4).click({force: true});
    recordDetailsPage.timeline().should("not.be.visible");
    recordDetailsPage.expandButton().eq(4).click({force: true});
    recordDetailsPage.timeline().should("be.visible");
  });
});
