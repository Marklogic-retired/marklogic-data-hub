package com.marklogic.spring.batch.hub;

import com.marklogic.hub.collector.Collector;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.support.SynchronizedItemStreamReader;

import java.util.Vector;

public class CollectorReader extends SynchronizedItemStreamReader<String> {

    private Collector collector;

    private Vector<String> results;

    public CollectorReader(Collector collector) {
        this.collector = collector;
    }

    @Override
    public void open(ExecutionContext executionContext) {
        if (collector != null) {
            this.results = collector.run();
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
