package com.marklogic.hub.util.json;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.OutputStream;

public class JSONSerializer {
    private static Logger logger = LoggerFactory.getLogger(JSONSerializer.class);

    final OutputStream out;

    public JSONSerializer(OutputStream out) {
        this.out = out;
    }

    public void serialize(Object val) throws IOException {
        String stringToSer = JSONObject.writeValueAsString(val);
        if (StringUtils.isNotEmpty(stringToSer)) {
            out.write(stringToSer.getBytes());
            out.close();
        }
    }
}
