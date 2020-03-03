package com.marklogic.explorer.integral.suites;

import java.util.List;

import com.marklogic.explorer.integral.Suite;
import com.marklogic.explorer.integral.Test;

public class BasicTestSuite extends Suite {

  public BasicTestSuite(String name, String description, List<Test> tests) {
    super(name, description, tests);
  }
}
