package com.marklogic.explorer.integral;

import java.net.http.HttpClient;
import java.util.Optional;

import com.marklogic.explorer.integral.ValidationCriteria.Operator;
import com.marklogic.explorer.integral.support.ExplorerAccess;
import com.marklogic.explorer.integral.support.ExplorerAccess.Protocol;

/**
 * Step.java
 *
 * @author dbrown
 * A Step is a name, definition, a url with parameters, and a desired result.
 */
public class Step extends AbstractStep {
  // getters are evil -- these are final so there is no danger in exposing the values
  public final String name;
  public final String definition;
  public final Boolean needsAuth;
  public final String stepUser;
  public final String stepPassword;
  public final Protocol protocol;
  public final String endpoint;  // e.g. "datahub/v2/models"
  public final Access access;
  public final String payload;  // may be null iff access is GET
  public final Object desiredResult;
  public final Operator op;
  public final boolean statusOnly;

  public Step(String name, String definition, Boolean needsAuth,  String stepUser, String stepPassword,
      Protocol protocol, String endpoint, Access access,
      String payload, Object desired, Operator op, boolean statusOnly) {
    this.name = name;
    this.definition = definition;
    this.stepUser = stepUser;
    this.stepPassword = stepPassword;
    this.needsAuth = needsAuth;
    this.protocol = protocol;
    this.endpoint = endpoint;
    this.access = access;
    this.payload = payload;
    this.desiredResult = desired;
    this.op = op;
    this.statusOnly = statusOnly;
  }

  /**
   * run runs the step and writes its results using the writer specified in results..
   * The return code is 0 if no error detected and non-zero otherwise.
   */
  @SuppressWarnings("unchecked")
  StepResult run(Optional<HttpClient> clientOption, ExplorerAccess net, StringBuilder results) {
    results.append("\n\nStep: ").append(name).append("\n").append(definition).append("\n");
    var client = clientOption.isPresent()
        ? clientOption.get()
        : needsAuth
           ? net.secureClient(stepUser, stepPassword)
           : net.simpleClient();
    var response =
        access == Access.GET
            ? net.get(client, net.composeAddress(protocol, AppConfig.server, endpoint))
            : net.post(client,
                net.composeAddress(protocol, AppConfig.server, endpoint),
                payload == null ? "" : payload);
    var criteria = statusOnly
        ? new ValidationCriteria(op, (Comparable)desiredResult, (Comparable)response.statusCode())
        : new ValidationCriteria<>(op, (Comparable)desiredResult, (Comparable)(response.body()));
    if (criteria.satisfies()) {
      results.append(" PASS ");
      return new StepResult(client, 0, results);
    } else {
      results.append(" FAIL ");
      return new StepResult(client, 1, results);
    }
  }
}