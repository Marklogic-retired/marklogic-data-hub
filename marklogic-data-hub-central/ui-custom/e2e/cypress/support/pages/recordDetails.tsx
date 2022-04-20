class RecordDetailsPage {

  backToSearch() {
    return cy.get(".title .icon svg");
  }

}

const recordDetailsPage = new RecordDetailsPage();
export default recordDetailsPage;
