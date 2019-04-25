In your `build.gradle` file, replace all occurrences of your old DHF version number with `{{ include.ver }}`.

      **Example:** In the `plugins` section and the `dependencies` section,

      ```
      plugins {
          id 'net.saliman.properties' version '1.4.6'
          id 'com.marklogic.ml-data-hub' version '{{ include.ver }}'
      }
      ...
      dependencies {
        compile 'com.marklogic:marklogic-data-hub:{{ include.ver }}'
        compile 'com.marklogic:marklogic-xcc:9.0.6'
      }
      ```