class RecordDetailsPage {

  backToSearch() {
    return cy.get(".title .icon svg");
  }
  recordTitle() {
    return cy.get(".title .text span span span.concat");
  }
  thumbNail() {
    return cy.get(".heading .thumbnail img");
  }
  recordValue(value: string) {
    return cy.get(`[data-testid="table-${value}"] span[data-testid="valueId"]`);
  }
  recordText(value: string, textVal: string) {
    return cy.get(`[data-testid="table-${value}"]`).findAllByText(textVal);
  }
  socialItems() {
    return cy.get(".social-items a");
  }
  socialHandle() {
    return cy.get(`[class="handle"]`);
  }
  metaDataVal() {
    return cy.get(".MetadataValue .hasPopover");
  }
  expandSections() {
    return cy.get(".expand");
  }
  expandButton() {
    return cy.findAllByTestId("expandButton");
  }
  collapseButton() {
    return cy.findAllByTestId("collapseButton");
  }
  membershipContainer() {
    return cy.findByTestId("membership-component");
  }
  relationships() {
    return cy.get(".relationships");
  }
  imageGallery() {
    return cy.findByTestId("ImageGalleryMulti-component");
  }
  timeline() {
    return cy.findByTestId("activity-info-timeline");
  }
  recordId() {
    return cy.get(`[class="details"] [class="title"] span`);
  }
}

const recordDetailsPage = new RecordDetailsPage();
export default recordDetailsPage;
