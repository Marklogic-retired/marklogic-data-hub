package com.marklogic.spring.batch.hub;

import com.marklogic.hub.collector.Collector;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.support.SynchronizedItemStreamReader;

import java.util.Map;
import java.util.Vector;

public class CollectorReader extends SynchronizedItemStreamReader<String> {

    private Collector collector;

    private Vector<String> results;

    private Map<String, Object> options;

    public CollectorReader(Collector collector, Map<String, Object> options) {
        this.collector = collector;
        this.options = options;
    }

    @Override
    public void open(ExecutionContext executionContext) {
        if (collector != null) {
            this.results = collector.run(options);
        }
        else {
            this.results = new Vector<>();
        }

        executionContext.putInt("totalItems", this.results.size());
    }

    @Override
    public String read() {
        String result = null;

        try {
            result = this.results.remove(0);
        }
        catch(ArrayIndexOutOfBoundsException e) {

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
