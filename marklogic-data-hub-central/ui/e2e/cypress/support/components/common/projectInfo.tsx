class ProjectInfo {

    getAboutProject(){
        return cy.get('#service-name');
    }

    getDownloadButton() {
        return cy.findByText('Download');
    }
}

const projectInfo = new ProjectInfo();
export default projectInfo;
