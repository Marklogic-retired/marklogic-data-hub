package com.marklogic.hub.transformers;

import com.marklogic.hub.Transformer;

public class EnvelopeTransformer extends Transformer {

    public EnvelopeTransformer() {
        super();
        this.module = "/com.marklogic.hub/transformers/envelope.xqy";
        this.namespace = "http://marklogic.com/hub-in-a-box/transformers/envelope";
        this.function = "transform";
    }
}
