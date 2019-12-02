package com.marklogic.explorer.integral.tests;

import static com.marklogic.explorer.integral.ValidationCriteria.Operator.*;

import com.marklogic.explorer.integral.AbstractStep.Access;
import com.marklogic.explorer.integral.Step;
import com.marklogic.explorer.integral.Test;
import com.marklogic.explorer.integral.support.IExplorerAccess;
import com.marklogic.explorer.integral.support.IExplorerAccess.*;

/**
 * Level0 tests the simplest use --
 *  - verify that the health endpoint is reachable
 *  - verify that an invalid user/password combination can't login
 *  - verify that a valid user/password combination can login
 */
public class Level0Test extends Test {

  public Level0Test() {
    final var invalidUserPayload = IExplorerAccess.loginPayload("Gina", "Gins");
    final var validUserPayload = IExplorerAccess.loginPayload("ladida", "ladida");

    steps.add(new Step("baby step", "the first thing",false,  "", "", Protocol.HTTP,
       "datahub/actuator/health", Access.GET,"", "UP", IN, false));
   steps.add(new Step("login", "verify an invalid login fails",false, "", "", Protocol.HTTP,
       "datahub/v2/login", Access.POST, invalidUserPayload, 200, NOT_EQ, true));
    steps.add(new Step("login", "verify a secure login",false, "", "", Protocol.HTTP,
        "datahub/v2/login", Access.POST, validUserPayload, 200, EQ, true));
  }

}