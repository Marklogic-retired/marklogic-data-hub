package com.marklogic.spring.batch.hub;

import java.util.ArrayList;
import java.util.List;

import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.ItemStreamReader;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;

import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.collector.Collector;

public class CollectorReader extends LoggingObject implements ItemStreamReader<String> {

    private Collector collector;

    private List<String> results;

    private int index = 0;

    public CollectorReader(Collector collector) {
        this.collector = collector;
    }

    @Override
    public void open(ExecutionContext executionContext) throws ItemStreamException {
        if (collector != null) {
            this.results = collector.run();
        }
        else {
            this.results = new ArrayList<>();
        }
    }

    @Override
    public String read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
        String result = null;

        if (results.size() > this.index) {
            result = this.results.get(this.index);
            index++;
        }

        return result;
    }

    @Override
    public void update(ExecutionContext executionContext) throws ItemStreamException {
    }

    @Override
    public void close() throws ItemStreamException {
    }

}
