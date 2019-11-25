package com.marklogic.explorer.integral;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

/** AppConfig is a simple interface to configuration data */
public class AppConfig {

  // Pre-populated values (because they're used often)
  //public static Config config = ConfigFactory.load("my_app.conf");
  public static Config config = ConfigFactory.load();

  public static String server = config.getString("explorer.server");
  public static String port = config.getString("explorer.port");

  public static String  analyst = config.getString("explorer.analyst");
  public static String  analystPassword = config.getString("explorer.analyst_password");

  public static String  arch = config.getString("explorer.arch");
  public static String  architectPassword = config.getString("explorer.arch_password");

}
