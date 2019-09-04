package com.marklogic.hub.explorer.web;

import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

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

}
