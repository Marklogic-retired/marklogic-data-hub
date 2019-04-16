In your `build.gradle` file, replace all occurrences of your old DHF version number with `4.3.0`.

    **Example:** In the `plugins` section and the `dependencies` section,

      ```
      plugins {
          id 'net.saliman.properties' versi Dn '1.4.6'
          id 'com.marklogic.ml-data-hub' version '4.3.0'
      }
      ...
      dependencies {
        compile 'com.marklogic:marklogic-data-hub:4.3.0'
        compile 'com.marklogic:marklogic-xcc:9.0.6'
      }
      ```