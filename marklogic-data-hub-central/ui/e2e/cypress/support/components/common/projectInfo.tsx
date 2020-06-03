class ProjectInfo {

    getAboutProject(){
        return cy.get('#project-name');
    }

    getDownloadButton() {
        return cy.findByText('Download');
    }
}

const projectInfo = new ProjectInfo();
export default projectInfo;
