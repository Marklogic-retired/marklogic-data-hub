package com.marklogic.explorer.integral;

/*
 * IntegralApp.java
 * Copyright (C) 2019 MarkLogic Corp.  All rights reserved.
 *
 * @author dbrown
 *
 * IntegralApp is the driver program of the Integral integrated backend test system.
 */

import static java.lang.System.out;

import com.marklogic.explorer.integral.suites.BasicTestSuite;
import com.marklogic.explorer.integral.tests.Level0Test;
import com.marklogic.explorer.integral.tests.Level1Test;
import com.marklogic.explorer.integral.tests.Level2Test;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

/**
 * IntegralApp is the main program for the testing system
 */
public class IntegralApp {

  public static void main(String [] args) {
    Stream.of(args).forEach(a -> out.println("arg: "+a));
    StringBuilder results = new StringBuilder();
    var testSuite = new BasicTestSuite("Basic Tests", "The fundamental tests",
        List.of(new Level0Test(), new Level1Test(), new Level2Test()));
    var report = testSuite.runTests(results);
    if (AppConfig.config.hasPath("explorer.ofile")) {

      try (var writer = new FileWriter(AppConfig.config.getString("explorer.ofile"))) {
        writer.write(report);
      } catch (IOException e) {
        out.println(">>>> error writing file: "+e.getMessage());
        out.println(report);
      }
    } else {
      out.println(report);
    }
  }
}
