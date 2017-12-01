package com.marklogic.hub;

import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;

public interface ComboListener {
    void onCombo(CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType);
}
