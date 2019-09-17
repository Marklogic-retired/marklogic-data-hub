package com.marklogic.hub.explorer.unittest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.explorer.model.Document;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.service.SearchService;
import com.marklogic.hub.explorer.util.SearchUtil;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class SearchServiceTest {

  @Mock
  SearchUtil mockSearchUtil;

  @InjectMocks
  SearchService searchServiceMock;

  private SearchQuery mockQuery;
  private Document mockDocument;

  @Before
  public void setUpDocs() {
    // Create Facet Map
    List<String> facetValues = Arrays.asList("220", "350");
    Map<String, List<String>> facets = new HashMap<>();
    facets.put("Price", facetValues);

    // Create Search Query object
    mockQuery = new SearchQuery();
    mockQuery.setEntityNames(Arrays.asList("Order", "Product"));
    mockQuery.setFacets(facets);
    mockQuery.setQuery("Laptop");
    mockQuery.setPageLength(10);
    mockQuery.setStart(1);

    // Create Document object
    mockDocument = new Document();
    mockDocument.setContent("{\"content\":\"This is a sample json document content\"}");
    Map<String,String> metadata = new HashMap<>();
    metadata.put("createdOn", "2019-09-13T14:28:34.513434-07:00");
    metadata.put("createdBy", "flowDeveloper");
    mockDocument.setMetaData(metadata);
  }

  @Test
  public void testSearch() {
    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchUtil.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithEmptyFacets() {
    // Setting facets to be empty map
    mockQuery.setFacets(new HashMap<>());

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchUtil.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithEmptyEntities() {
    // Setting entities list to be empty
    mockQuery.setEntityNames(new ArrayList<>());

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchUtil.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithNullFacets() {
    // Setting facets to be null
    mockQuery.setFacets(null);

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchUtil.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testSearchWithNullEntities() {
    // Setting entities list to be null
    mockQuery.setEntityNames(null);

    StringHandle mockHandle = new StringHandle("This is some sample search data");
    when(mockSearchUtil.search(mockQuery)).thenReturn(mockHandle);
    StringHandle resultHandle = searchServiceMock.search(mockQuery);
    assertTrue(resultHandle.get().equals(mockHandle.get()));
  }

  @Test
  public void testGetDocument() {
    String mockDocUri = "/example.json";
    when(mockSearchUtil.getDocument(mockDocUri)).thenReturn(mockDocument);
    System.out.println(mockDocument.getContent());
    Document actualDoc = searchServiceMock.getDocument(mockDocUri);
    System.out.println(actualDoc.getContent());
    assertTrue(actualDoc.getContent().equals(mockDocument.getContent()));
    assertTrue(actualDoc.getMetaData().equals(mockDocument.getMetaData()));
  }

  @Test
  public void testGetNonExistingDocument() {
    String fakeDocUri = "/example1.json";
    when(mockSearchUtil.getDocument(fakeDocUri)).thenThrow(ResourceNotFoundException.class);
    Document actualDoc = searchServiceMock.getDocument(fakeDocUri);
    assertTrue(actualDoc == null);
  }

}
