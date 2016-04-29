package com.marklogic.hub.web.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.service.CollectorManagerService;

@Controller
@RequestMapping("/collectors")
public class CollectorManagerController extends BaseController {

	@Autowired
	private CollectorManagerService collectorManagerService;

	private Map<String, Collector> collectorsMap;

	@RequestMapping(method = RequestMethod.GET)
	@ResponseBody
	public List<Collector> getCollectors() {
		List<Collector> collectors = collectorManagerService.getCollectors();
		this.updateCollectorsMap(collectors);
        return collectors;
    }

    private void updateCollectorsMap(List<Collector> collectors) {
    	collectorsMap = new LinkedHashMap<>();
    	for (Collector collector : collectors) {
    		collectorsMap.put(collector.getType().toString(), collector);
		}
	}

    @RequestMapping(value = "/{type}/install", method = RequestMethod.POST)
	public void installCollector(@PathVariable String type) {
    	Collector collector = this.findCollector(type);
    	collectorManagerService.installCollector(collector);
    }

    private Collector findCollector(String type) {
		return collectorsMap.get(type);
	}

    @RequestMapping(value = "/{collectorName}/install", method = RequestMethod.POST)
	public void uninstallCollector(@PathVariable String collectorName) {
    	collectorManagerService.uninstallCollector(collectorName);
    }

    @RequestMapping(value = "/{type}/run", method = RequestMethod.POST)
    public void runCollector(@PathVariable String type) {
    	Collector collector = this.findCollector(type);
        collectorManagerService.runCollector(collector);
    }

}
