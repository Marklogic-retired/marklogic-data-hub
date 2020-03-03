package com.marklogic.explorer.integral;

import java.net.http.HttpClient;

/**
 * StepResult is a container that holds the result of a Step
 * Its utility lies in the fact that there is implicit state
 * required in order to do much of anything in MarkLogic and
 * that's reflected in the back end.  Generally, this means
 * that since the backend doesn't maintain state for a client,
 * the client needs to maintain its own state rather than
 * login for each transaction.
 *
 * StepResult, then, holds not only the result values but
 * also the stateful client.
 */
public class StepResult {

  public final HttpClient client;
  public final int rc;
  public final StringBuilder results;

  public StepResult(HttpClient client, int rc, StringBuilder results) {
    this.client = client;
    this.rc = rc;
    this.results = results;
  }

}
