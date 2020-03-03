/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.explorer.model.DocSearchQueryInfo.FacetData;
import com.marklogic.hub.explorer.model.Document;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.util.SearchHelper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.platform.runner.JUnitPlatform;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@RunWith(JUnitPlatform.class)
@ExtendWith(MockitoExtension.class)
public class SearchServiceTest {

  @Mock
  SearchHelper mockSearchHelper;

  @InjectMocks
  SearchService searchServiceMock;

  private SearchQuery mockQuery;
  private Document mockDocument;
  private Optional<Document> mockOptional;

  @BeforeEach
  public void setUpDocs() {
    // Create Facet Map
    FacetData priceFacetData = new FacetData();
    priceFacetData.setDataType("int");
    priceFacetData.setStringValues(Arrays.asList("220", "350"));

    Map<String, FacetData> facets = new HashMap<>();
    facets.put("Price", priceFacetData);

    // Create Search Query object
    mockQuery = new SearchQuery();
    mockQuery.getQuery().setEntityNames(Arrays.asList("Order", "Product"));
    mockQuery.getQuery().setFacets(facets);
    mockQuery.getQuery().setSearchStr("Laptop");
    mockQuery.setPageLength(10);
    mockQuery.setStart(1);

    // Create Document object
    String content = "{\"content\":\"This is a sample json document content\"}";
    Map<String, String> metadata = new HashMap<>();
    metadata.put("createdOn", "2019-09-13T14:28:34.513434-07:00");
    metadata.put("createdBy", "flowDeveloper");
    mockDocument = new Document(content, metadata);
    mockOptional = Optional.ofNullable(mockDocument);
  }

  @Test
  public void testSearch() {
    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchHelper.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithDates() {
    // Create Facet Map
    FacetData dateFacetData = new FacetData();
    dateFacetData.setDataType("date");
    dateFacetData.setStringValues(Arrays.asList("2019-09-15", "2019-10-10"));

    mockQuery.getQuery().getFacets().put("createdOnRange", dateFacetData);

    StringHandle mockHandle = new StringHandle("This is some sample search data with in date "
        + "range");
    when(mockSearchHelper.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithEmptyFacets() {
    // Setting facets to be empty map
    mockQuery.getQuery().setFacets(new HashMap<>());

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchHelper.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithEmptyEntities() {
    // Setting entities list to be empty
    mockQuery.getQuery().setEntityNames(new ArrayList<>());

    StringHandle mockHandle = new StringHandle();
    when(mockSearchHelper.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get() == mockHandle.get());
    assertNull(resultHandle.get());
  }

  @Test
  public void testSearchWithNullFacets() {
    // Setting facets to be null
    mockQuery.getQuery().setFacets(null);

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchHelper.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithNullEntities() {
    // Setting entities list to be null
    mockQuery.getQuery().setEntityNames(null);

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchHelper.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithSingleJobId() {
    FacetData jobFacetData = new FacetData();
    jobFacetData.setDataType("string");
    jobFacetData.setStringValues(Arrays.asList("custom-job-id-1", "custom-job-id-2"));

    mockQuery.getQuery().getFacets().put("createdByJobRange", jobFacetData);

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchHelper.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testGetDocument() {
    String mockDocUri = "/example.json";
    when(mockSearchHelper.getDocument(mockDocUri)).thenReturn(mockOptional);
    Optional<Document> actualDoc = searchServiceMock.getDocument(mockDocUri);
    assertTrue(actualDoc.get().getContent().equals(mockOptional.get().getContent()));
    assertTrue(actualDoc.get().getMetaData().equals(mockOptional.get().getMetaData()));
  }

  @Test
  public void testGetXMLDocument() {
    String mockDocUri = "/example.xml";
    String content = "<envelope><instance><info><title>Order</title><version>0.0.1</version></info>"
        + "<Order><OrderID>10249</OrderID><CustomerID>TOMSP</CustomerID></Order></instance></envelope>";
    Map<String, String> metadata = new HashMap<>();
    metadata.put("createdOn", "2019-09-13T14:28:34.513434-07:00");
    metadata.put("createdBy", "flowDeveloper");
    mockDocument = new Document(content, metadata);
    mockOptional = Optional.ofNullable(mockDocument);

    when(mockSearchHelper.getDocument(mockDocUri)).thenReturn(mockOptional);
    Optional<Document> actualDoc = searchServiceMock.getDocument(mockDocUri);
    assertTrue(actualDoc.get().getContent().equals(mockOptional.get().getContent()));
    assertTrue(actualDoc.get().getMetaData().equals(mockOptional.get().getMetaData()));
  }

  @Test
  public void testGetNonExistingDocument() {
    String fakeDocUri = "/example1.json";
    when(mockSearchHelper.getDocument(fakeDocUri)).thenReturn(Optional.empty());
    Optional<Document> actualDoc = searchServiceMock.getDocument(fakeDocUri);
    assertTrue(!actualDoc.isPresent());
  }
}
