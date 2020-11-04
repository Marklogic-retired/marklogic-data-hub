/// <reference types="cypress"/>

import browsePage from '../../support/pages/browse';
import detailPage from '../../support/pages/detail';
import { Application } from '../../support/application.config';
import {toolbar} from "../../support/components/common";
import 'cypress-wait-until';
import detailPageNonEntity from '../../support/pages/detail-nonEntity';

describe('xml scenario for snippet view on browse documents page', () => {

  var facets: string[] = ['collection', 'flow'];

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.clickFacetView();
  });

  it('select Customer XML entity instances and verify entity, docs, hub/entity properties', () => {
    browsePage.selectEntity('Customer');
    browsePage.getSelectedEntity().should('contain', 'Customer');
    browsePage.getHubPropertiesExpanded();
    browsePage.getFacetItemCheckbox('collection', 'mapCustomersXML').click();
    browsePage.getGreySelectedFacets('mapCustomersXML').should('exist');
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should('be.gte', 5);
    browsePage.getDocuments().each((item, i) => {
      browsePage.getDocumentEntityName(i).should('exist');
      browsePage.getDocumentPKey(i).should('exist');
      browsePage.getDocumentPKeyValue(i).should('exist');
      browsePage.getDocumentSnippet(i).should('exist');
      browsePage.getDocumentCreatedOn(i).should('exist');
      browsePage.getDocumentSources(i).should('exist');
      browsePage.getDocumentFileType(i).should('exist');
    });

    facets.forEach(function (item) {
      browsePage.getFacet(item).should('exist');
      browsePage.getFacetItems(item).should('exist');
    });
  });

  it('apply facet search and verify docs, hub/entity properties', () => {
    browsePage.selectEntity('All Entities');
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getShowMoreLink().first().click();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    browsePage.getFacetItemCheckbox('collection', 'mapCustomersXML').click();
    browsePage.getSelectedFacets().should('exist');
    browsePage.getGreySelectedFacets('mapCustomersXML').should('exist');
    browsePage.getFacetApplyButton().should('exist');
    browsePage.getClearGreyFacets().should('exist');
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should('be.equal', 5);
    browsePage.getClearAllButton().should('exist');
    browsePage.getFacetSearchSelectionCount('collection').should('contain', '1');
    browsePage.clickClearFacetSearchSelection('mapCustomersXML');
  });

  it('apply facet search and clear individual grey facet', () => {
    browsePage.selectEntity('All Entities');
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getShowMoreLink().first().click();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    browsePage.getFacetItemCheckbox('collection', 'mapCustomersXML').click();
    browsePage.getGreySelectedFacets('mapCustomersXML').click();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    });

  it('apply facet search and clear all grey facets', () => {
    browsePage.selectEntity('All Entities');
    browsePage.getSelectedEntity().should('contain', 'All Entities');
    browsePage.getShowMoreLink().first().click();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    browsePage.getFacetItemCheckbox('collection', 'Customer').click();
    browsePage.getFacetItemCheckbox('collection', 'mapCustomersXML').click();
    browsePage.getGreySelectedFacets('Customer').should('exist');
    browsePage.getGreySelectedFacets('mapCustomersXML').should('exist');
    browsePage.getClearGreyFacets().click();
    browsePage.getTotalDocuments().should('be.greaterThan', 25);
    });

  it('search for a simple text/query and verify content', () => {
    browsePage.search('Randolph');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getDocumentEntityName(0).should('exist');
    browsePage.getDocumentPKey(0).should('exist');
    browsePage.getDocumentPKeyValue(0).should('exist');
    browsePage.getDocumentSnippet(0).should('exist');
    browsePage.getDocumentCreatedOn(0).should('exist');
    browsePage.getDocumentSources(0).should('exist');
    browsePage.getDocumentFileType(0).should('exist');
    browsePage.getDocumentFileType(0).should('be.equal', 'xml');
  });

  it('verify instance view of the document', () => {
    browsePage.search('Randolph');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getInstanceViewIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Customer');
    detailPage.getDocumentID().should('contain', '0');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'loadCustomersXML');
    detailPage.getDocumentFileType().should('contain', 'xml');
    detailPage.getDocumentTable().should('exist');
  });

  it('verify source view of the document', () => {
    browsePage.search('Randolph');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getSourceViewIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentXML().should('exist');
  });

});


describe('xml scenario for table on browse documents page', () => {

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.clickTableView();
    browsePage.selectEntity('All Entities');
  });

  it('select Customer xml entity instances and verify table', () => {
    browsePage.selectEntity('Customer');
    browsePage.getSelectedEntity().should('contain', 'Customer');
    browsePage.getHubPropertiesExpanded();
    cy.waitUntil(() => browsePage.getFacetItemCheckbox('collection', 'mapCustomersXML')).click();
    browsePage.getGreySelectedFacets('mapCustomersXML').should('exist');
    browsePage.getFacetApplyButton().click();
    browsePage.getTotalDocuments().should('be.gte', 5);
    //check table rows
    browsePage.getTableRows().should('have.length', 5);
    //check table columns
    browsePage.getTableColumns().should('have.length', 6);
  });

  it('verify instance view of the document', () => {
    browsePage.search('Bowman');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getTableViewInstanceIcon().click();
    detailPage.getInstanceView().should('exist');
    detailPage.getDocumentEntity().should('contain', 'Customer');
    detailPage.getDocumentID().should('contain', '203');
    detailPage.getDocumentTimestamp().should('exist');
    detailPage.getDocumentSource().should('contain', 'loadCustomersXML');
    detailPage.getDocumentFileType().should('contain', 'xml');
    detailPage.getDocumentTable().should('exist');
  });

  it('verify source view of the document', () => {
    browsePage.search('Bowman');
    browsePage.getTotalDocuments().should('be.equal', 1);
    browsePage.getTableViewSourceIcon().click();
    detailPage.getSourceView().click();
    detailPage.getDocumentXML().should('exist');
  });

});

describe('xml scenario for All Data option and non-entity detail page', () => {

  //login with valid account and go to /browse page
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    cy.waitUntil(() => browsePage.getExploreButton()).click();
    browsePage.selectEntity('All Data');
  });

  it('verify record view of the XML document in non-entity detail page', () => {
    cy.waitUntil(() => browsePage.getNavigationIconForDocument('/dictionary/first-names.xml')).click();
    browsePage.waitForSpinnerToDisappear();
    detailPageNonEntity.getInstanceView().should('exist');
    detailPageNonEntity.getRecordView().click();
    detailPageNonEntity.getDocumentXML().should('exist');
    detailPageNonEntity.getDocumentUri().should('contain', '/dictionary/first-names.xml');
    detailPageNonEntity.getSourceTable().should('exist');
    detailPageNonEntity.getHistoryTable().should('exist');
    detailPageNonEntity.clickBackButton();
    browsePage.waitForSpinnerToDisappear();
    cy.waitForAsyncRequest();
    browsePage.getSelectedEntity().should('contain', 'All Data');
  });
});
