This project provides examples of custom steps to override DHF default
behavior for idempotent processing in an environment where input
documents are frequently updated.

## Scenario

Data is ingested nightly from a variety of disparate sources
(accounting, project management, lead capture, etc.) and wrapped in
envelopes with a timestamp.  THe source documents should not be
changed, except by the ingestion process.

The harmonization flows should also be efficient; there is no need to
rerun a flow none of whose inputs have changed since the previous run.

Possible reasons for not wanting to change the input documents may
include:

- one document may serve as input to more than one flow;

- input sources have no change management, so comparison with
  preceding ingestion is the only way to provide accurate timestamps;
  or

- ingested documents are kept in a temporal store for auditing
  purposes.

## How to install

To try this project out using QuickStart, start with a clean MarkLogic
instance—i.e. without an existing Data hub installation.  Then, you
can either install this project's application via QuickStart or via
Gradle.

### Install via QuickStart

To install via QuickStart, simply start QuickStart and browse to this
project folder.  Use QuickStart to initialize this project and then
deploy the application.

### Install via Gradle

To install via Gradle, first initialize the project:

    ./gradlew -i hubInit

Then modify the `gradle-local.properties` file and either un-comment
the `mlUsername` and `mlPassword` properties and set the password for
your admin user, or set the properties to a different MarkLogic user
that is able to deploy applications.

Then deploy the application:

    ./gradlew -i mlDeploy

Next, start up QuickStart and browse to this project folder and login
to QuickStart.

## How to run the flow

TK