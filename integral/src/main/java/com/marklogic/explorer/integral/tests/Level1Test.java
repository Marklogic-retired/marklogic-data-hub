package com.marklogic.explorer.integral.tests;

import static com.marklogic.explorer.integral.ValidationCriteria.Operator.EQ;
import static com.marklogic.explorer.integral.ValidationCriteria.Operator.IN;

import com.marklogic.explorer.integral.AbstractStep.Access;
import com.marklogic.explorer.integral.AppConfig;
import com.marklogic.explorer.integral.Step;
import com.marklogic.explorer.integral.Test;
import com.marklogic.explorer.integral.support.ExplorerAccess;
import com.marklogic.explorer.integral.support.ExplorerAccess.Protocol;

/**
 * Level1 tests entity access
 *  - verify that an analyst can see models
 *  - verify that an architect can see models
 *  - verify that requesting a nonexistent entity returns nothing
 *
 *  Note that this test must preserve state
 */
public class Level1Test extends Test {

  public Level1Test() {
    final var architectPayload = ExplorerAccess.loginPayload(AppConfig.arch, AppConfig.architectPassword);
    final var analystPayload = ExplorerAccess.loginPayload(AppConfig.analyst, AppConfig.analystPassword);
    // this test needs to preserve client state
    steps.add(new Step("analyst login", "verify an analyst can login",true, "", "", Protocol.HTTP,
        "datahub/v2/login", Access.POST, analystPayload, 200, EQ, true));
    steps.add(new Step("analyst access", "verify an analyst can see entities",true, "", "", Protocol.HTTP,
        "datahub/v2/models", Access.GET, "", "PropertyData", IN, false));
    steps.add(new Step("architect login", "verify an architect can login",true, "", "", Protocol.HTTP,
        "datahub/v2/login", Access.POST, architectPayload, 200, EQ, true));
    steps.add(new Step("architect access", "verify an architect can see entities",true, "", "", Protocol.HTTP,
        "datahub/v2/models", Access.GET, "", "PropertyData", IN, false));
  }
}
