package com.marklogic.hub.explorer.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;


public class ExplorerUtil {

  public static Properties getPropertiesFromClassPath(String fileName) throws IOException {
    InputStream input = ExplorerUtil.class.getClassLoader().getResourceAsStream(fileName);
    Properties prop = new Properties();
    if(input != null) {
      prop.load(input);
    }
    return prop;
  }
}
