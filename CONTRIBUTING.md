# Contributing to MarkLogic Data Hub

MarkLogic Data Hub welcomes new contributors. This document will guide you
through the process.

 - [Issues and Bugs](#found-an-issue)
 - [Feature Requests](#want-a-feature)
 - [Building from Source](#building-marklogic-data-hub-from-source)
 - [Submission Guidelines](#submission-guidelines)


## Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue to our [GitHub Issue Tracker][issue tracker]. Even better, you can submit a Pull Request with a fix for the issue you filed.


## Want a Feature?
You can request a new feature by submitting an issue to our [GitHub Issue Tracker][issue tracker].  If you
would like to implement a new feature then first create a new issue and discuss it with one of our
project maintainers.
#####Note: As of version 2.0.3, pull requests will only be accepted for MarkLogic 9. Only critical bug fixes will be accepted for MarkLogic 8 on the legacy 2.0.2 or earlier branches.


## Building MarkLogic Data Hub from Source
Looking to build the code from source? Look no further.


#### Prerequisites
You need:

- MarkLogic Server 9.0-7 or later
- Java JDK 8 or later
- Gradle 4.6 or later
- A decent IDE. (Recommended: IntelliJ)


#### Building from the command line
**WARNING:** _The Data Hub build includes a large number of tests which take a total of approximately 30 minutes. You can skip the tests; however, you must run the tests before submitting changes._

The build script builds ALL the Data Hub deliverables (marklogic-data-hub.jar, marklogic-datahub-<version>.war, and ml-data-hub-plugin for Gradle). To build, run:

```bash
cd /path/to/data-hub-project/
./gradlew build -x test
```


#### Making Changes to the Hub Gradle Plugin

If you are testing a change to the ml-data-hub Gradle plugin or a cutting-edge development version, you might want to use a local copy of the Gradle plugin in your Data Hub project. These situations are rare.

To use a local copy of the Gradle plugin in your Data Hub project, you must tell Gradle to use your local copy instead of the one in the cloud.

1. Publish your Data Hub Plugin to the local Maven repository.

  ```bash
  cd /path/to/data-hub-project/
  ./gradlew publishToMavenLocal
  cd /path/to/data-hub-project/ml-data-hub-plugin
  ./gradlew publishToMavenLocal
  ```

2. In your Data Hub project's `build.gradle` file, enter the local version:

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

3. To run the plugin's unit tests, navigate to the ml-data-hub-plugin directory, then do the following:

  a. Run all unit tests

    ../gradlew test


  b. Run one unit test

    ../gradlew -Dtest.single=CreateEntityTask test


**Note**: This change goes in a Data Hub project's `build.gradle`. Not the Data Hub source code's build.gradle.


#### Running QuickStart from Source

1. Install the prerequisites.

2. Open two terminal windows.

  **Terminal window 1** - This runs the webapp.

      ```bash
      cd /path/to/data-hub-project
      ./gradlew bootrun
      ```

  **NOTE:** The progress indicator stops around 90%. This is normal. In Gradle, 100% means it finished running. This stays running indefinitely and thus shows 90%.

      ```
      > Building 90% > :web:bootRun
      ```

  **Terminal window 2** - This runs QuickStart.

      ```
      cd /path/to/data-hub-project
      ./gradlew runui
      ```

In a web browser, navigate to [http://localhost:4200](http://localhost:4200) to use the debug version of QuickStart.


### Troubleshooting

If the `gradle runui` command fails, try the following to troubleshoot.


#### Do you have Gradle 3.4 or newer?

Using gradle directly:
  ```
  gradle -v
  ```
or if you are using the wrapper:
  ```
  ./gradlew -v
  ```

If your gradle wrapper is older than `3.4`:
  ```
  gradle wrapper --gradle-version 3.4
  ```


#### Are you on the develop branch?

_Hint: You should be._

To check:
  ```bash
  git branch
  ```

To switch to the develop branch:
  ```bash
  git checkout develop
  ```


#### Do you have the latest code?

  Better make sure...


##### If you cloned from the github.com/marklogic/marklogic-data-hub repo:

  ```bash
  git pull origin develop
  ```

##### If you forked then cloned your fork:

  1. Make sure you have the upstream files:

      ```bash
      $ git remote add upstream git://github.com/marklogic/marklogic-data-hub.git
      ```

  2. Fetch the upstream files:

      ```bash
      git fetch upstream develop
      ```

  3. Merge it:

      ```bash
      git rebase upstream/develop
      ```

#### Remove the `web/node_modules` directory.

If you see several javascript errors, you might have a corrupted `node_modules` directory. Remove it then run again.

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

- Run the JUnit tests.

  ```sh
  $ ./gradlew test
  ```

- To run a single test:

  ```sh
  $ ./gradlew -Dtest.single=TestName test
  ```

- For best results, do not include the final word test. For example, suppose you want to run FlowRunnerTest:

  ```sh
  $ ./gradlew -Dtest.single=FlowRunner test
  ```

- To run the QuickStart end-to-end tests, you need Node.js 8.9.1 or later and run:
  ```jshelllanguage
  gradlew bootrun
  cd web
  npm install
  npm install -g protractor
  npm run webdriver-update
  npm run e2e
  ```
*Note: For end-to-end (e2e) tests, Data Hub must be running and so must a MarkLogic instance with available appservers for the ports 8010-8014.*

You can run the e2e tests from Intellij or another IDE to perform fullstack debugging. To do so, add a run/debug
task that runs the script "e2e". Make sure to add a 'before launch' task as folows: `npm run "webdriver-update"`.

**IMPORTANT: All submitted patches must pass ALL tests.**


#### Push your changes

  ```sh
  $ git push origin my-feature-branch
  ```


#### Agree to the contributor License

Before we can accept and merge your changes, you must sign a [Contributor License Agreement](http://developer.marklogic.com/products/cla). You only need to do this once.


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
