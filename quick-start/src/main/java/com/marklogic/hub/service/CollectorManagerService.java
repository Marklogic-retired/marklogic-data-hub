package com.marklogic.hub.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.marklogic.hub.collector.Collector;

@Service
public class CollectorManagerService {

	private static final Logger LOGGER = LoggerFactory.getLogger(CollectorManagerService.class);

	public List<Collector> getCollectors() {
        return null;
    }

    public void installCollector(Collector collector) {

    }

    public void uninstallCollector(String collectorName) {

    }

    public List<String> runCollector(Collector collector) {
        return null;
    }



}
