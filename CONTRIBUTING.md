# Contributing to MarkLogic Data Hub

MarkLogic Data Hub welcomes new contributors. This document will guide you
through the process.

 - [Issues and Bugs](#found-an-issue)
 - [Feature Requests](#want-a-feature)
 - [Developing Data Hub](#developing-data-hub)
 - [Submission Guidelines](#submission-guidelines)


## Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue 
to our [GitHub Issue Tracker][issue tracker]. If you'd like to submit a feature enhancement, please first create an 
issue with your proposed idea so that we can start a discussion about the problem you want to solve and what the best
solution would be.  


## Want a Feature?
You can request a new feature by submitting an issue to our [GitHub Issue Tracker][issue tracker].  If you
would like to implement a new feature then first create a new issue and discuss it with one of our
project maintainers.


## Developing Data Hub 

This section describes how to build and test new features and fixes in Data Hub. This includes changes to the following subprojects in this project:

- the Data Hub library in ./marklogic-data-hub
- the Data Hub Gradle plugin in ./ml-data-hub-plugin
- the web application in ./marklogic-data-hub-central
- the QuickStart web application in ./web

### Prerequisites

You need:

- MarkLogic Server (see [Version Compatibility](https://docs.marklogic.com/datahub/refs/version-compatibility.html) for the correct version)
- Java JDK 9, 10 or 11
- Gradle 5.x or later

### Testing changes to the Data Hub library

The source code for the Data Hub library is in the ./marklogic-data-hub subproject. This project contains hundreds of 
tests, written in JUnit and also written using [marklogic-unit-test](https://github.com/marklogic-community/marklogic-unit-test). 
While developing, you'll create/modify/run tests to verify the changes that you're making. 

To run the tests, you first need to deploy a test instance of Data Hub to MarkLogic. The configuration for this instance
is in the ./marklogic-data-hub/gradle.properties; you can override these values in gradle-local.properties. Verify
that the values for mlSecurityUsername and mlSecurityPassword are correct, as that user will be used to deploy the test
instance of Data Hub. Also, ensure that you do not have a Data Hub instance already deployed to the MarkLogic that you 
will connect to. Then, run the following Gradle task from the root project:

    ./gradlew -i bootstrap
    
After two or three minutes, the bootstrap process will finish, and the test instance of Data Hub will be installed in MarkLogic. 

#### Running tests 

At this point, you could run all the tests, but those can take an hour or more to finish. Instead, running the 
marklogic-unit-test tests is a better way to do a quick sanity check on your deployment:

    ./gradlew testUnit

After running that, you can also access the marklogic-unit-test GUI test runner at http://localhost:8011/test/default.xqy . This 
GUI allows you to run individual tests or sets of tests, which "testUnit" does not yet support. 

If you are looking to change Data Hub code that runs in MarkLogic - i.e. the files under 
./marklogic-data-hub/src/main/resources/ml-modules - consider running the following Gradle task that will 
automatically load files into MarkLogic as you change them:

    ./gradlew -i -PignoreDirty=true mlWatch

The "ignoreDirty" parameters tells the mlWatch task to only load files that are modified once mlWatch starts running. 

If you'd instead like to run the JUnit tests, you can use the Gradle "--tests" feature to run a subset of tests - e.g. 

    ./gradlew test --tests FlowRunnerTest

Or, if you've loaded this project into an IDE such as Intellij, you can simply use the IDE's capabilities for running 
one or more tests at once. 

#### Testing the Data Hub library in another project 

If you wish to make changes to or try out the latest code in the Data Hub Java library (marklogic-data-hub-(version).jar), follow 
these instructions:

1. Publish the Data Hub library and Data Hub Gradle plugin to your local Maven repository (defaults to ~/.m2/repository).

  ```bash
  ./gradlew publishToMavenLocal 
  ```

2. In the build.gradle file for the project that will use the library, add your local Maven repository as a repository if it's not alreaded included:

  ```bash
  repositories {
    mavenLocal()
  }
  ```

3. Assuming that you're using Gradle's java plugin, add the library as a dependency to your project:

  ```bash
  dependencies {
    compile "com.marklogic:marklogic-data-hub:(version)"
  ```

The version is defined in gradle.properties in the marklogic-data-hub root project directory. You can override this if 
desired when publishing to your local Maven repository - e.g.

    ./gradlew publishToMavenLocal -Pversion=myVersion


### Testing changes to the Data Hub Gradle plugin 

The source code for the Data Hub library is in the ./ml-data-hub-plugin subproject. While tests exist for these tasks 
and it's possible to add your own, you may also want to publish a local copy of the Data Hub plugin and test it in 
another project. To do so, follow the steps below. 

1. Publish the Data Hub library and Gradle plugin to your local Maven repository (defaults to ~/.m2/repository).

  ```bash
  ./gradlew publishToMavenLocal
  ```

2. Then add the following to the build.gradle file of the project where you'd like to test your just-published Data Hub 
Gradle plugin:

  ```groovy
  // this goes at the top above the plugins section
  buildscript {
    repositories {
      mavenLocal()
      jcenter()
    }
    dependencies {
      classpath "com.marklogic:ml-data-hub:(the version number you chose)"
    }
  }

  plugins {
     ...
     // comment out this line. It pulls the version from the cloud
     // id 'com.marklogic.ml-data-hub' version '4.0.0'
  }

  // this tells gradle to apply the plugin you included above in the buildscript section
  apply plugin: "com.marklogic.ml-data-hub"
  ```

Your Data Hub project will now be using the Data Hub plugin that you published. 

#### Running tests on the Data Hub plugin

To run the plugin's unit tests, first follow [the instructions above](#Testing-changes-to-the-Data-Hub-library) for 
deploying a test instance of Data Hub to MarkLogic. 

Then, similar to testing the Data Hub library, you can run all of the tests:

    cd ml-data-hub-plugin
    ../gradlew test

Or just run a specific test:

    ../gradlew test --tests CreateEntityTaskTest

### Running and testing marklogic-data-hub-central

See the marklogic-data-hub-central README.md file for more information.

### Running QuickStart from source

The source code for the QuickStart web application is in the ./web subproject. To run and test this locally, begin by 
opening two terminal windows - you'll run the webapp from one, and then the middle tier from the other.

  **Terminal window 1** - This runs the webapp.

      ```bash
      cd web
      ../gradlew bootrun
      ```

  **NOTE:** The progress indicator stops around 90%. This is normal. In Gradle, 100% means it finished running. This stays running indefinitely and thus shows 90%.

      ```
      > Building 90% > :web:bootRun
      ```

  **Terminal window 2** - This runs QuickStart.

      ```
      cd web
      ../gradlew runui
      ```

In a web browser, navigate to [http://localhost:4200](http://localhost:4200) to use the debug version of QuickStart.

If you see several javascript errors, you might have a corrupted `node_modules` directory. Remove it, then run again.

  ```bash
  rm -rf web/node_modules
  ```


## Submission Guidelines


### Submitting an Issue

Before you submit your issue, search the archive to check if your question has been answered.

If your issue appears to be a bug and hasn't been reported, open a new issue.

By not reporting duplicate issues, you help us maximize the time we spend fixing issues and adding new features.

Please fill out the issue template so that your issue can be dealt with quickly.


### Submitting a Pull Request

#### Fork marklogic-data-hub

Fork the project [on GitHub](https://github.com/marklogic/marklogic-data-hub/fork) and clone your copy.

  ```sh
  $ git clone git@github.com:username/marklogic-data-hub.git
  $ cd marklogic-data-hub
  $ git remote add upstream git://github.com/marklogic/marklogic-data-hub.git
  ```

**Important:** Please open an issue in the [issue tracker][] and get your proposed changes pre-approved by at least one of the project maintainers before you start coding. Nothing is more frustrating than seeing your hard work go to waste because your vision does not align with that of the project maintainers.


#### Create a branch for your changes

If you decide to fix something, create a feature branch and start hacking.

**Note:** We use `git flow` and our most recent changes live on the `develop` branch.

  ```sh
  $ git checkout -b my-feature-branch -t origin/develop
  ```


#### Formatting code

We use `[.editorconfig][]` to configure our editors for proper code formatting. If you don't
use a tool that supports editorconfig, be sure to configure your editor to use the settings
equivalent to our .editorconfig file.


#### Commit your changes

Make sure git knows your name and email address:

  ```sh
  $ git config --global user.name "J. Random User"
  $ git config --global user.email "j.random.user@example.com"
  ```

Writing good commit logs is important. A commit log should describe what
changed and why. Follow these guidelines when writing one:

1. The first line should be 50 characters or less and contain a short
   description of the change including the issue number prefixed by a hash (#).
2. Keep the second line blank.
3. Wrap all other lines at 72 columns.

Example of a good commit log:

```
Fixing Issue #123: make the whatchamajigger work in MarkLogic 9

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc.

The body of the commit message can be several paragraphs, and
please do proper word-wrap and keep columns shorter than about
72 characters or so. That way `git log` will show things
nicely even when it is indented.
```

The header line should be meaningful; it is what other people see when they
run `git shortlog` or `git log --oneline`.


#### Rebase your repo

Use `git rebase` (not `git merge`) to sync your work from time to time.

  ```sh
  $ git fetch upstream
  $ git rebase upstream/develop
  ```


#### Test your code

See the sections above on how to test changes to the Data Hub library and/or to the Data Hub Gradle plugin. 

Once your pull request is submitted (see below), MarkLogic's internal CI process will handle running all of the tests
against your branch in a clean environment. Project maintainers will notify you of any failures so that you can 
address them.


#### Push your changes

  ```sh
  $ git push origin my-feature-branch
  ```


#### Agree to the contributor License

Before we can accept and merge your changes, you must sign a [Contributor License Agreement](http://developer.marklogic.com/products/cla). 
You only need to do this once.


#### Submit the pull request

Go to https://github.com/username/marklogic-data-hub and select your feature branch. Click
the 'Pull Request' button and fill out the form.

Pull requests are usually reviewed within a few days. If you get comments
that need to be to addressed, apply your changes in a separate commit and push that to your
feature branch. Post a comment in the pull request afterwards; GitHub does
not send out notifications when you add commits to existing pull requests.

That's it! Thank you for your contribution!


#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-feature-branch
    ```

* Check out the develop branch:

    ```shell
    git checkout develop -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-feature-branch
    ```

* Update your develop with the latest upstream version:

    ```shell
    git pull --ff upstream develop
    ```

[issue tracker]: https://github.com/marklogic/marklogic-data-hub/issues
[.editorconfig]: http://editorconfig.org/
