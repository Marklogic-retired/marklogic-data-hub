package com.marklogic.quickstart.listeners;

import com.fasterxml.jackson.databind.JsonNode;

public interface ValidateListener {
    public void onValidate(JsonNode validation);
}
