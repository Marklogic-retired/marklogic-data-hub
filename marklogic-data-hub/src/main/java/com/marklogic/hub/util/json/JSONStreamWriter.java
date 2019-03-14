package com.marklogic.hub.util.json;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.OutputStream;

public class JSONStreamWriter {
    private static Logger logger = LoggerFactory.getLogger(JSONStreamWriter.class);

    final OutputStream out;

    public JSONStreamWriter(OutputStream out) {
        this.out = out;
    }

    public void write(Object val) throws IOException {
        String stringToSer = JSONObject.writeValueAsString(val);
        if (StringUtils.isNotEmpty(stringToSer)) {
            out.write(stringToSer.getBytes());
            out.close();
        }
    }
}
