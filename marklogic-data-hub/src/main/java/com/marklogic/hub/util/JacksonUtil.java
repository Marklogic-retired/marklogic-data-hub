package com.marklogic.hub.util;

import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

/**
 * Contains convenience methods for when working with the com.fasterxml.jackson library.
 */
public abstract class JacksonUtil {

    /**
     * Convenient for print JSON nodes with arrays that have potentially many values, such that seeing them all on
     * one line would be very difficult to read.
     *
     * @return
     */
    public static ObjectWriter newWriterWithSeparateLinesForArrayValues() {
        ObjectMapper mapper = new ObjectMapper();
        DefaultPrettyPrinter printer = new DefaultPrettyPrinter();
        printer.indentArraysWith(DefaultIndenter.SYSTEM_LINEFEED_INSTANCE);
        mapper.setDefaultPrettyPrinter(printer);
        return mapper.writerWithDefaultPrettyPrinter();
    }
}
