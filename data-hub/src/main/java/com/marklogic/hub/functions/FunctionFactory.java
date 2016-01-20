package com.marklogic.hub.functions;

import com.marklogic.hub.Function;
import com.marklogic.hub.functions.ParseDateFunction;

public class FunctionFactory {

    public static Function newParseDate(String format) {
        return new ParseDateFunction(format);
    }
}
