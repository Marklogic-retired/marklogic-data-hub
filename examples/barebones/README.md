# Barebones Example

This example shows you the zen of Data Hub Framework. Simply drop a `build.gradle` into a directory with these contents:

build.gradle:
```groovy
plugins {
    // this plugin lets you create properties files
    // for multiple environments... like dev, qa, prod
    id 'net.saliman.properties' version '1.4.6'

    // this is the data hub framework gradle plugin
    // it includes ml-gradle. This plugin is what lets you
    // run DHF (Data Hub Framework) tasks from the
    // command line
    id 'com.marklogic.ml-data-hub' version '2.0.7'
}
```

Next, Initialize your DHF app:

```bash
gradle hubInit
```

Then Bootstrap your DHF app:

```bash
gradle mlDeploy
```

Then Deploy your custom modules:

```bash
gradle mlLoadModules
```

You can use scaffolding commands to configure flows.

```bash
gradle hubCreateInputFlow
gradle hubCreateHarmonizeFlow
```
For a complete list of gradle tasks, check here: [https://github.com/marklogic/marklogic-data-hub/wiki/Gradle-Tasks](https://github.com/marklogic/marklogic-data-hub/wiki/Gradle-Tasks)
