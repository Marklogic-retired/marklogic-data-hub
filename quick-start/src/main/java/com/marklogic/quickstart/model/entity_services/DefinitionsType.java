package com.marklogic.quickstart.model.entity_services;

import java.util.HashMap;
import java.util.Map;

public class DefinitionsType {

    protected Map<String, DefinitionType> definitions;

    public Map<String, DefinitionType> getDefinitions() {
        if (definitions == null) {
            definitions = new HashMap<>();
        }
        return this.definitions;
    }

}
