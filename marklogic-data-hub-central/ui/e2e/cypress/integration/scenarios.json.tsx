/// <reference types="cypress"/>

import viewPage from '../support/pages/view';
import browsePage from '../support/pages/browse';
import detailPage from '../support/pages/detail';
import homePage from "../support/pages/home";
import { Application } from '../support/application.config';
import {toolbar} from "../support/components/common";

xdescribe('json scenario on view entities page', () => {

  //login with valid account
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper();
    cy.wait(1000);
    // temporary change as tile is not working
    homePage.getTitle().click();
    cy.wait(500);
    // temporary change end here
    homePage.getViewEntities().click();
    cy.visit('/view');
  });

  it('has total entities and documents', () => {
    viewPage.getTotalEntities().should('be.equal', 3);
    viewPage.getTotalDocuments().should('be.greaterThan', 1008);
  });

  it('has Person entity with properties and attributes', () => {
    viewPage.expandEntityRow('Person');
    viewPage.getEntityProperty('id').should('contains', 'id');
    viewPage.getEntityDataType('id').should('contains', 'string');
    viewPage.getEntityIndexSettings('id').should('contains', 'Primary Key');
  });

  it('navigates to /browse on entity name click', () => {
    viewPage.getEntity('Person')
        .click()
        .url()
        .should('include', '/browse');
    browsePage.getSelectedEntity().should('contain', 'Person')
  });

});

describe('json scenario for snippet on browse documents page', () => {

  var facets: string[] = ['collection', 'flow'];

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    toolbar.getExploreToolbarIcon().should('exist');
    toolbar.getExploreToolbarIcon().click();
    browsePage.getExploreButton().should('exist');
    browsePage.getExploreButton().click();
    cy.wait(200);
    browsePage.getFacetView();
  });

  it('select "all entities" verify docs, hub/entity properties', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 1008)
    browsePage.getDocuments().each(function (item, i) {
      browsePage.getDocumentEntityName(i).should('exist');
      //browsePage.getDocumentId(i).should('exist');
      browsePage.getDocumentSnippet(i).should('exist');
      browsePage.getDocumentCreatedOn(i).should('exist');
      browsePage.getDocumentSources(i).should('exist');
      browsePage.getDocumentFileType(i).should('exist');
    })

    facets.forEach(function (item) {
      browsePage.getFacet(item).should('exist');
      browsePage.getFacetItems(item).should('exist');
    })
  });

  it('select Person entity and verify entity, docs, hub/entity properties', () => {
    browsePage.selectEntity('Person');
    browsePage.getSelectedEntity().should('contain', 'Person');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 5)
    browsePage.getDocuments().each(function (item, i) {
      browsePage.getDocumentEntityName(i).should('exist');
      //browsePage.getDocumentId(i).should('exist');
      browsePage.getDocumentSnippet(i).should('exist');
      browsePage.getDocumentCreatedOn(i).should('exist');
      browsePage.getDocumentSources(i).should('exist');
      browsePage.getDocumentFileType(i).should('exist');
    })

    facets.forEach(function (item) {
      browsePage.getFacet(item).should('exist');
      browsePage.getFacetItems(item).should('exist');
    })
  });

  it('apply facet search and verify docs, hub/entity properties', () => {
    browsePage.selectEntity('All Entities');
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(500);
    browsePage.getHubPropertiesExpanded();
    browsePage.getExpandableSnippetView();
    cy.wait(500);
    browsePage.getTotalDocuments().should('be.greaterThan', 1008);
    browsePage.getShowMoreLink().click();
    browsePage.getFacetItemCheckbox('collection', 'Person').click();
    browsePage.getSelectedFacets().should('exist');
    browsePage.getGreySelectedFacets('Person').should('exist');
    browsePage.getFacetApplyButton().should('exist');
    browsePage.getClearGreyFacets().should('exist');
    browsePage.getFacetApplyButton().click();
    cy.wait(500);
    browsePage.getTotalDocuments().should('be.equal', 6);
    browsePage.getClearAllButton().should('exist');
    browsePage.getFacetSearchSelectionCount('collection').should('contain', '1');
    browsePage.clearFacetSearchSelection('Person');
  });

  it('apply facet search and clear individual grey facet', () => {
     browsePage.selectEntity('All Entities');
     browsePage.getSelectedEntity().should('contain', 'All Entities');
     cy.wait(500);
     browsePage.getHubPropertiesExpanded();
     browsePage.getTotalDocuments().should('be.greaterThan', 1008);
     browsePage.getShowMoreLink().click();
     browsePage.getFacetItemCheckbox('collection', 'Person').click();
     browsePage.getGreySelectedFacets('Person').click();
     cy.wait(500);
     browsePage.getTotalDocuments().should('be.greaterThan', 1008);
    });

  it('apply facet search and clear all grey facets', () => {
     browsePage.selectEntity('All Entities');
     browsePage.getSelectedEntity().should('contain', 'All Entities');
     cy.wait(500);
     browsePage.getHubPropertiesExpanded();
     browsePage.getTotalDocuments().should('be.greaterThan', 1008);
     browsePage.getShowMoreLink().click();
     browsePage.getFacetItemCheckbox('collection', 'Person').click();
     browsePage.getFacetItemCheckbox('collection', 'Customer').click();
     browsePage.getGreySelectedFacets('Person').should('exist');
     browsePage.getGreySelectedFacets('Customer').should('exist');
     browsePage.getClearGreyFacets().click();
     cy.wait(500);
     browsePage.getTotalDocuments().should('be.greaterThan', 1008);
    });

  it('search for a simple text/query and verify content', () => {
    cy.wait(500);
    browsePage.search('Bill');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getDocumentEntityName(0).should('exist');
    //browsePage.getDocumentId(0).should('exist');
    browsePage.getDocumentSnippet(0).should('exist');
    browsePage.getDocumentCreatedOn(0).should('exist');
    browsePage.getDocumentSources(0).should('exist');
    browsePage.getDocumentFileType(0).should('exist')
  });

  it('verify instance view of the document', () => {
    cy.wait(500);
    browsePage.search('Bill');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Person');
    detailPage.getDocumentID().should('contain', '0');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'PersonFlow');
    detailPage.getDocumentFileType().should('contain', 'json');
    detailPage.getDocumentTable().should('exist');
  });

  it('verify source view of the document', () => {
    cy.wait(500);
    browsePage.search('Bill');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentJSON().should('exist');
  });

});


xdescribe('json scenario for table on browse documents page', () => {

  var facets: string[] = ['collection', 'flow'];

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    // temporary change as tile is not working
    homePage.getTitle().click();
    cy.wait(500);
    // temporary change end here
    homePage.getBrowseEntities().click();
    cy.wait(2000);
    browsePage.getTableView();
    browsePage.selectEntity('All Entities');
  });

  it('select "all entities" and verify table default columns', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getExpandableTableView();
    browsePage.getTotalDocuments().should('be.greaterThan', 1008)
    browsePage.getColumnTitle(2).should('contain', 'Identifier');
    browsePage.getColumnTitle(3).should('contain', 'Entity');
    browsePage.getColumnTitle(4).should('contain', 'File Type');
    browsePage.getColumnTitle(5).should('contain', 'Created');

    facets.forEach(function (item) {
      browsePage.getFacet(item).should('exist');
      browsePage.getFacetItems(item).should('exist');
    })
  });

  it('select "all entities" and verify table', () => {
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 1008)
    //check table rows
    browsePage.getTableRows().should('have.length', 20);
    //check table columns
    browsePage.getTableColumns().should('have.length', 5);
    //check cells data
    for (let i = 2; i <= 10; i++) {
      for (let j = 2; j <= 4; j++) {
        browsePage.getTableCell(i, j).should('not.be.empty')
      }
    }
    for (let i = 1; i <= 10; i++) {
      browsePage.getTableUriCell(i).should('not.be.empty')
    }
  });

  it('select Person entity and verify table', () => {
    browsePage.selectEntity('Person');
    browsePage.getSelectedEntity().should('contain', 'Person');
    cy.wait(2000);
    browsePage.getHubPropertiesExpanded();
    browsePage.getTotalDocuments().should('be.greaterThan', 5)
    //check table rows
    browsePage.getTableRows().should('have.length', 6);
    //check table columns
    browsePage.getTableColumns().should('have.length', 5);
    //check cells data
    for (let i = 1; i <= 5; i++) {
      for (let j = 2; j <= 5; j++) {
        browsePage.getTableCell(i, j).should('not.be.empty')
      }
    }
  });

  it('search for a simple text/query and verify content', () => {
    cy.wait(500);
    browsePage.search('Bill');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getTableRows().should('have.length', 1);
  });

  it('verify instance view of the document', () => {
    cy.wait(500);
    browsePage.search('Bill');
    browsePage.getTotalDocuments().should('be.equal', 1);
    //browsePage.getDocumentById(0).click();
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Person');
    detailPage.getDocumentID().should('contain', '0');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'PersonFlow');
    detailPage.getDocumentFileType().should('contain', 'json');
    detailPage.getDocumentTable().should('exist');
  });

  it('verify source view of the document', () => {
    cy.wait(500);
    browsePage.search('Bill');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getTableViewSourceIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentJSON().should('exist');
  });

  it('search for multiple facets, switch to snippet view, delete a facet, switch to table view, verify search query', () => {
    browsePage.selectEntity('Customer');
    browsePage.getSelectedEntity().should('contain', 'Customer');
    cy.wait(500);
    browsePage.getFacetItemCheckbox('firstname', 'Kelley').click();
    browsePage.getFacetItemCheckbox('lastname', 'Oneal').click();
    browsePage.getSelectedFacets().should('exist');
    browsePage.getGreySelectedFacets('Kelley').should('exist');
    browsePage.getFacetApplyButton().click();
    cy.get('[data-testid="spinner"]').should('not.exist')
    browsePage.getFacetView();
    cy.wait(500);
    browsePage.getClearFacetSearchSelection('Kelley').should('contain', 'firstname: Kelley');
    browsePage.getClearFacetSearchSelection('Oneal').should('exist');
    browsePage.getTotalDocuments().should('be.equal', 0);
    browsePage.clearFacetSearchSelection('Kelley')
    cy.wait(500);
    browsePage.getTableView();
    cy.wait(200);
    browsePage.getClearFacetSearchSelection('Oneal').should('exist');
    browsePage.getTotalDocuments().should('be.equal', 2);
  });

});
