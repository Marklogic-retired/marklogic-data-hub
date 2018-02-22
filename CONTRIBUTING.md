# Contributing to MarkLogic Data Hub

MarkLogic Data Hub welcomes new contributors. This document will guide you
through the process.

 - [Issues and Bugs](#found-an-issue)
 - [Feature Requests](#want-a-feature)
 - [Building from Source](#building-the-framework-from-source)
 - [Submission Guidelines](#submission-guidelines)
 
## Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue to our [GitHub Issue Tracker][issue tracker]. Even better you can submit a Pull Request
with a fix for the issue you filed.

## Want a Feature?
You can request a new feature by submitting an issue to our [GitHub Issue Tracker][issue tracker].  If you
would like to implement a new feature then first create a new issue and discuss it with one of our
project maintainers.
#####Note: as of DHF 2.0.3, pull requests will only be accepted for MarkLogic 9. Only critical bug fixes will be accepted for MarkLogic 8 on the legacy 2.0.2 or earlier branches.

## Building the Framework from Source
Looking to build the code from source? Look no further.

#### Prerequisites
You need these to get started

- MarkLogic 9.0-nightly or 9.0-5+
- Java 8 JDK
- Gradle (3.4 or greater)
- A decent IDE. IntelliJ is nice.

#### Symlinking to MarkLogic
The 3.0 release of DHF will ship its xqy and sjs code within MarkLogic.
To run in development mode against MarkLogic you will need:
`MarkLogic 9.0-2018-02-14 or greater`

If you wish to make code changes to the xqy or sjs files within DHF you will need to symlink your source code into the /MarkLogic install dir so that MarkLogic serves up your files instead of the ones bundled in the nightly.

In Linux or Mac, run the following:

```bash
ln -s /path/to/your/dhf/code/marklogic-data-hub/src/server-side \
  /path/to/MarkLogic/Modules/MarkLogic/data-hub-framework
```

In Windows, run a Command Prompt as Admin, then execute the following:

```bash
cd \path\to\MarkLogic\Modules\MarkLogic
mklink /D data-hub-framework \path\to\your\dhf\code\marklogic-data-hub\src\server-side
```

#### Building from the command line
**First, a warning.** _The DHF has a ton of tests and they take a very long time to run. Considering you might not want to invest 30 minutes to wait for tests these instructions will show you how to skip the tests._

**Do you need to do this?** - only if you are wanting to build the entire DHF final products (marklogic-data-hub.jar, quickstart.war, and ml-data-hub-plugin for gradle)

Simply run this command:

```bash
cd /path/to/data-hub-project/
./gradlew build -x test
```

#### Making Changes to the Hub Gradle Plugin

This is for when you really want to use a local copy of the Gradle Plugin in your Data Hub Framework Project. Perhaps you are testing out a change to the ml-data-hub Gradle plugin or you have a cutting edge development version. There are very few valid reasons for you to do this.

Still here? Seems you really want to use a local copy of the Gradle Plugin in your Data Hub Framework Project. Here's how to tell Gradle to use your local copy instead of the one living up on the Cloud.

First you must publish your Data Hub Plugin to the local maven repository.

```bash
cd /path/to/data-hub-project/
./gradlew publishToMavenLocal
cd /path/to/data-hub-project/ml-data-hub-plugin
./gradlew publishToMavenLocal
```

Then in your DHF project's build.gradle file you will need to use the local version:
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
   // id 'com.marklogic.ml-data-hub' version '2.0.4'
}

// this tells gradle to apply the plugin you included above in the buildscript section
apply plugin: "com.marklogic.ml-data-hub"
```

To run the plugin's unit tests, cd to the ml-data-hub-plugin directory, then:

Run all unit tests

    ../gradlew test


Run one unit test

    ../gradlew -Dtest.single=CreateEntityTask test


**Note**: This change goes in a DHF project's build.gradle. Not the DHF source code's build.gradle.

#### Running the QuickStart UI from source
Make sure you have the prerequisites installed.

You will need to open two terminal windows.

**Terminal window 1** - This runs the webapp.
```bash
cd /path/to/data-hub-project
./gradlew bootrun
```

**BE AWARE** There will be a progress indicator that stops around 90%. This is normal. In gradle land, 100% means it finished running. This stays running indefinitely and thus shows 90%.

```
> Building 90% > :quick-start:bootRun
```

**Terminal window 2** - This runs the Quickstart UI
```
cd /path/to/data-hub-project
./gradlew runui
```

Now open your browser to [http://localhost:4200](http://localhost:4200) to use the debug version of the Quickstart UI.

### Troubleshooting
Did the `gradle runui` command fail for you? Here's a quick checklist to troubleshoot.

#### Do you have Gradle 3.4 or newer?
Using straight up gradle:
```
gradle -v
```
or if you are using the wrapper:
```
./gradlew -v
```
If your gradle wrapper is older than `3.4` then do this:
```
gradle wrapper --gradle-version 3.4
```
#### Are you on the develop branch?
_hint: you should be_  
Check like so:
```bash
git branch
```

To switch to the develop branch:
```bash
git checkout develop
```

#### Do you have the latest code?
Better make sure...

##### You clone from the github.com/marklogic-community/marklogic-data-hub repo

```bash
git pull origin develop
```
##### Your forked then cloned your fork
Make sure you have the upstream set:
```bash
$ git remote add upstream git://github.com/marklogic-community/marklogic-data-hub.git
```

Then fetch the upstream:
```bash
git fetch upstream develop
```

Now merge it in:
```bash
git rebase upstream/develop
```

#### Try removing the `quick-start/node_modules` directory.  
If you are seeing a bunch of javascript errors you might have a messed up node_modules directory. Try to remove it then run again.

```bash
rm -rf quick-start/node_modules
```

## Submission Guidelines

### Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues. Please fill out the issue template so that your issue can be dealt with quickly.

### Submitting a Pull Request

#### Fork marklogic-data-hub

Fork the project [on GitHub](https://github.com/marklogic-community/marklogic-data-hub/fork) and clone
your copy.

```sh
$ git clone git@github.com:username/marklogic-data-hub.git
$ cd marklogic-data-hub
$ git remote add upstream git://github.com/marklogic-community/marklogic-data-hub.git
```

We ask that you open an issue in the [issue tracker][] and get agreement from
at least one of the project maintainers before you start coding.

Nothing is more frustrating than seeing your hard work go to waste because
your vision does not align with that of a project maintainer.

#### Create a branch for your changes

Okay, so you have decided to fix something. Create a feature branch
and start hacking. **Note** that we use git flow and thus our most recent changes live on the develop branch.

```sh
$ git checkout -b my-feature-branch -t origin/develop
```

#### Formatting code

We use [.editorconfig][] to configure our editors for proper code formatting. If you don't
use a tool that supports editorconfig be sure to configure your editor to use the settings
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
   description of the change including the Issue number prefixed by a hash (#).
2. Keep the second line blank.
3. Wrap all other lines at 72 columns.

A good commit log looks like this:

```
Fixing Issue #123: make the whatchamajigger work in MarkLogic 8

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc etc.

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

Make sure the JUnit tests pass.

```sh
$ ./gradlew test
```

If you want to run a single test:

```sh
$ ./gradlew -Dtest.single=TestName test
```

for best results don't include the final word Test. Example:
Say you want to run FlowRunnerTest.

```sh
$ ./gradlew -Dtest.single=FlowRunner test
```

If you want to run just the Quick-Start UI End to End tests, you will need nodejs 8.9.1 or later installed:
```jshelllanguage
gradlew bootrun
cd quick-start
npm install
npm install -g protractor
npm run webdriver-update
npm run e2e 
```
*Note for e2e tests, the datahub must be running and so must a MarkLogic instance with appservers for 8010-8014 free.*

For those that want to run the E2E tests from Intellij or another IDE to fullstack debug you can have add a run/debug
task that runs the script "e2e". Make sure to add a 'before launch' task as folows: npm run "webdriver-update".


**Make sure that all tests pass. Please, do not submit patches that fail.**

#### Push your changes

```sh
$ git push origin my-feature-branch
```

#### Agree to the contributor License

Before we can merge your changes, you need to sign a [Contributor License Agreement](http://developer.marklogic.com/products/cla). You only need to do this once.

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

[issue tracker]: https://github.com/marklogic-community/marklogic-data-hub/issues
[.editorconfig]: http://editorconfig.org/
