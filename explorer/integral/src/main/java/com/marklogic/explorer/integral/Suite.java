package com.marklogic.explorer.integral;

import java.util.List;

/**
 * Suite.java
 * @author dbrown
 *
 * A suite is an ordered list of Tests.
 * Note that every test in a suite uses the same user/password combination
 * This means that tests can be repeated, once for a user with permissions
 * and once for a user without them.
 */
public class Suite {

  final private String name;
  final private  String description;
  final private Iterable<Test> tests;

  public Suite(String name, String description, List<Test> tests) {
    this.name = name;
    this.description = description;
    this.tests = tests;
  }

  /**
   * runTests causes the tests in the suite to be run
   * "report" accumulates output from the testss
   */
  public String runTests(StringBuilder report) {
    report.append("Running Suite: ").append(name).append(" ").append(description);
    tests.forEach(test -> test.runTests(report));
    report.append("End Suite");
    return report.toString();
  }
}