package com.marklogic.explorer.integral;

import com.marklogic.explorer.integral.support.ExplorerAccess;
import java.net.http.HttpClient;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class Test {

  public final List<Step> steps = new ArrayList<Step>();

  public Test() {

  }

  public String runTests(StringBuilder report) {
    ExplorerAccess runner = new ExplorerAccess();

    Optional<HttpClient> clientOption = Optional.empty();
    //steps.forEach(step -> runTest(clientOption, runner, step, report));
    // needing to maintain state is a pain..
    for (Step step : steps) {
      var result = runTest((clientOption), runner, step, report);
      clientOption = Optional.ofNullable(result.client);
    }
    return report.toString();
  }

  private StepResult runTest(Optional<HttpClient> clientOption,  ExplorerAccess runner,  Step step, StringBuilder report) {
    StepResult result = step.run(clientOption, runner, report);
    report.append("\nEnd of Step\n");
    return result;
  }
}