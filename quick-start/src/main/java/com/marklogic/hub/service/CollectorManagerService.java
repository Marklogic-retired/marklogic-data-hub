package com.marklogic.hub.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.marklogic.hub.collector.Collector;

@Service
public class CollectorManagerService {

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
