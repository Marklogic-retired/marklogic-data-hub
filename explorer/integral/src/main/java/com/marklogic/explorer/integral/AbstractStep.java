package com.marklogic.explorer.integral;

public class AbstractStep {
  public enum Access { GET, POST };

  public String composeServer(String base, String port) {
    return base + ((port.equals("80") || port.equals("443")) ? "" : ":"+port);
  }
}
