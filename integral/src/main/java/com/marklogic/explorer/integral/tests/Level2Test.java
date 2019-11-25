package com.marklogic.explorer.integral.tests;

import static com.marklogic.explorer.integral.ValidationCriteria.Operator.EQ;
import static com.marklogic.explorer.integral.ValidationCriteria.Operator.IN;
import static com.marklogic.explorer.integral.support.JsonUtils.toJson;

import com.marklogic.explorer.integral.AbstractStep.Access;
import com.marklogic.explorer.integral.AppConfig;
import com.marklogic.explorer.integral.Step;
import com.marklogic.explorer.integral.Test;
import com.marklogic.explorer.integral.data.SearchQuery;
import com.marklogic.explorer.integral.support.ExplorerAccess;
import com.marklogic.explorer.integral.support.ExplorerAccess.Protocol;
import java.util.Arrays;

/**
 * Level2Test tests document access
 *  - verify that an analyst can see models
 *  - verify that requesting a nonexistent entity returns nothing
 *  - verify that an architect cannot see models
 */
public class Level2Test extends Test {


  public Level2Test() {
    final var architectPayload = ExplorerAccess.loginPayload(AppConfig.arch, AppConfig.architectPassword);
    final var analystPayload = ExplorerAccess.loginPayload(AppConfig.analyst, AppConfig.analystPassword);

    final var query = new SearchQuery();
    query.setQuery("alpakka");
    query.setEntityNames(Arrays.asList("PropertyData"));
    query.setPageLength(10);
    query.setStart(1);
    query.setFacets(null);
    final var queryText = toJson(query);
    // this test needs to preserve client state
    steps.add(new Step("analyst login", "verify an analyst can login", true, "", "", Protocol.HTTP,
        "datahub/v2/login", Access.POST, analystPayload, 200, EQ, true));
    steps.add(new Step("analyst access", "verify an analyst can see documents", true, "", "",
        Protocol.HTTP,
        "datahub/v2/search", Access.POST, queryText, "alpakka", IN, false));
    steps.add(
        new Step("architect login", "verify an architect can login", true, "", "", Protocol.HTTP,
            "datahub/v2/login", Access.POST, architectPayload, 200, EQ, true));
    steps.add(new Step("architect access", "verify an architect cannot see documents", true, "", "",
        Protocol.HTTP,
        "datahub/v2/search", Access.POST, "", 400, IN, true));
  }
}