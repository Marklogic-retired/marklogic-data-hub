package com.marklogic.explorer.integral.suites;

import com.marklogic.explorer.integral.Suite;
import com.marklogic.explorer.integral.Test;
import java.util.List;

public class BasicTestSuite extends Suite {

  public BasicTestSuite(String name, String description, List<Test> tests) {
    super(name, description, tests);
  }
}
