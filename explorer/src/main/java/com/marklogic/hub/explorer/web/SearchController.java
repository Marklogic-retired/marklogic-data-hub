package com.marklogic.hub.explorer.web;

import com.marklogic.hub.explorer.model.Document;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/v2/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public String search(@RequestBody SearchQuery searchQuery) {
        return searchService.search(searchQuery).get();
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Document> search(@RequestParam String docUri) {
        Document doc = searchService.getDocument(docUri);
        HttpHeaders headers = new HttpHeaders();

        if(doc == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if(doc.getContent().startsWith("<")) {
            headers.setContentType(MediaType.APPLICATION_XML);
        } else {
            headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
        }
        return new ResponseEntity<>(doc, headers, HttpStatus.OK);
    }

}
