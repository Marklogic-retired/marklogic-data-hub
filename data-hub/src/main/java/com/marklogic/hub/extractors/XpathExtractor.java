package com.marklogic.hub.extractors;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.marklogic.hub.Extractor;
import com.marklogic.hub.Function;

@JsonInclude(Include.NON_NULL)
public class XpathExtractor extends Extractor {
    public String path;
    public String dst;

    public ArrayList<Function> functions = null;

    public XpathExtractor() {
        this(null, null);
    }

    public XpathExtractor(String path, String dst) {
        this.type = "xpath";
        this.path = path;
        this.dst = dst;
    }

    public void addFunction(Function function) {
        if (null == functions) {
            functions = new ArrayList<Function>();
        }

        functions.add(function);
    }
}
