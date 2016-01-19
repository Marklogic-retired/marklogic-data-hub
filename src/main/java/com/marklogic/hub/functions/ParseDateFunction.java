package com.marklogic.hub.functions;

import com.marklogic.hub.Function;

public class ParseDateFunction extends Function {
    public String format;

    public ParseDateFunction(String format) {
        super("parseDate");
        this.format = format;
    }
}
