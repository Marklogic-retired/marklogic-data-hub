# Project Directory Structure for DHF 4.1.x

A DHF 4.1.x project will have the following directory structure after initialization (through QuickStart or the `hubInit` Gradle task).

<details><summary>Show complete directory structure.</summary>
  <pre class="dirtree">
  your-project-root
  ├─ build.gradle
  ├─ gradle.properties
  ├─ gradle-env1.properties
  ├─ ...
  ├─ gradle-envN.properties
  ├─ gradlew
  ├─ gradlew.bat
  ├─ gradle
  │  └─ wrapper
  │     ├─ gradle-wrapper.jar
  │     └─ gradle-wrapper.properties
  ├─ plugins
  │  ├─ entities
  │  │  ├─ entity1
  │  │  │  ├─ input
  │  │  │  │  ├─ inputflow1
  │  │  │  │  │  ├─ content.(sjs|xqy)
  │  │  │  │  │  ├─ headers.(sjs|xqy)
  │  │  │  │  │  ├─ main.(sjs|xqy)
  │  │  │  │  │  └─ triples.(sjs|xqy)
  │  │  │  │  ├─ ...
  │  │  │  │  └─ inputflowN
  │  │  │  └─ harmonize
  │  │  │     ├─ harmonizeflow1
  │  │  │     │  ├─ collector.(sjs|xqy)
  │  │  │     │  ├─ content.(sjs|xqy)
  │  │  │     │  ├─ headers.(sjs|xqy)
  │  │  │     │  ├─ main.(sjs|xqy)
  │  │  │     │  ├─ triples.(sjs|xqy)
  │  │  │     │  └─ writer.(sjs|xqy)
  │  │  │     ├─ ...
  │  │  │     └─ harmonizeflowN
  │  │  ├─ ...
  │  │  └─ entityN
  │  └─ mappings
  │     ├─ mappingName1
  │     │  ├─ mappingName-0.mapping.json
  │     │  ├─ ...
  │     │  └─ mappingName-N.mapping.json
  │     ├─ ...
  │     └─ mappingNameN
  ├─ src
  │  └─ main
  │     ├─ entity-config
  │     │  ├─ final-entity-options.xml
  │     │  ├─ staging-entity-options.xml
  │     │  └─ databases
  │     │     ├─ final-database.json
  │     │     └─ staging-database.json
  │     ├─ hub-internal-config
  │     │  ├─ databases
  │     │  │  ├─ job-database.json
  │     │  │  ├─ staging-database.json
  │     │  │  ├─ staging-schemas-database.json
  │     │  │  └─ staging-triggers-database.json
  │     │  ├─ schemas
  │     │  ├─ security
  │     │  │  ├─ privileges
  │     │  │  │  ├─ dhf-internal-data-hub.json
  │     │  │  │  ├─ dhf-internal-entities.json
  │     │  │  │  ├─ dhf-internal-mappings.json
  │     │  │  │  └─ dhf-internal-trace-ui.json
  │     │  │  ├─ roles
  │     │  │  │  ├─ data-hub-role.json
  │     │  │  │  └─ hub-admin-role.json
  │     │  │  └─ users
  │     │  │     ├─ data-hub-user.json
  │     │  │     └─ hub-admin-user.json
  │     │  ├─ servers
  │     │  │  ├─ job-server.json
  │     │  │  └─ staging-server.json
  │     │  └─ triggers
  │     ├─ ml-config
  │     │  ├─ databases
  │     │  │  ├─ final-database.json
  │     │  │  ├─ final-schemas-database.json
  │     │  │  ├─ final-triggers-database.json
  │     │  │  └─ modules-database.json
  │     │  ├─ entities.layout.json
  │     │  ├─ security
  │     │  │  ├─ privileges
  │     │  │  ├─ roles
  │     │  │  └─ users
  │     │  ├─ servers
  │     │  │  └─ final-server.json
  │     │  └─ triggers
  │     ├─ ml-modules
  │     └─ ml-schemas
  └─ .tmp
  </pre>
</details>


## root

<pre class="dirtree">
  your-project-root
  ├─ build.gradle
  ├─ gradle.properties
  ├─ gradle-env1.properties
  ├─ ...
  ├─ gradle-envN.properties
  ├─ gradlew
  ├─ gradlew.bat
  ├─ gradle
  ├─ plugins
  ├─ src
  └─ .tmp
</pre>

<dl>

<dt>build.gradle</dt>
<dd><span markdown="1">This file enables you to use [Gradle](https://gradle.org/) to configure and manage your data hub instance. See the [Gradle documentation](https://docs.gradle.org/current/userguide/userguide.html).</span></dd>

<dt>gradle.properties</dt>
<dd><span markdown="1">This properties file defines variables needed by the data hub to install and run properly. Use this file to store values that apply to all instances of your data hub.</span></dd>

<dt>gradle-<i>env</i>.properties</dt>
<dd><span markdown="1">DHF determines your project's various environments (e.g.: `dev`, `qa`, `prod`, `local`) based on the existence of override files in your hub project. To create a new environment, simply create a new override file with the environment name after the dash.

**Example:** The `gradle-local.properties` file contains settings that override the variables in `gradle.properties` for your local environment.
</span></dd>

<dt>gradlew, gradlew.bat</dt>
<dd><span markdown="1">These are Unix/Linux and Windows executable files that run the Gradle wrapper in the `gradle` directory.</span></dd>

</dl>


## gradle

<pre class="dirtree">
  gradle
  └─ wrapper
     ├─ gradle-wrapper.jar
     └─ gradle-wrapper.properties
</pre>

This directory contains the Gradle wrapper, which is a custom local version of Gradle, so Gradle doesn't have to be installed separately. The Gradle wrapper is installed when you initialize a new DHF project.


## plugins

<pre class="dirtree">
  plugins
  ├─ entities
  │  ├─ entity1
  │  │  ├─ input
  │  │  │  ├─ inputflow1
  │  │  │  ├─ ...
  │  │  │  └─ inputflowN
  │  │  └─ harmonize
  │  │     ├─ harmonizeflow1
  │  │     ├─ ...
  │  │     └─ harmonizeflowN
  │  ├─ ...
  │  └─ entityN
  └─ mappings
     ├─ mappingName1
     ├─ ...
     └─ mappingNameN
</pre>

This directory contains project-specific server-side modules that are deployed into MarkLogic.

You can add custom server-side files in this directory.

When deployed to MarkLogic `./plugins` is equivalent to the root URI (`/`), so a library module at `./plugins/my-directory/my-lib.xqy` would be loaded into the modules database as `/my-directory/my-lib.xqy`.


### plugins/entities

<pre class="dirtree">
  entities
  ├─ entity1
  │  ├─ input
  │  │  ├─ inputflow1
  │  │  │  ├─ content.(sjs|xqy)
  │  │  │  ├─ headers.(sjs|xqy)
  │  │  │  ├─ main.(sjs|xqy)
  │  │  │  └─ triples.(sjs|xqy)
  │  │  ├─ ...
  │  │  └─ inputflowN
  │  └─ harmonize
  │     ├─ harmonizeflow1
  │     │  ├─ collector.(sjs|xqy)
  │     │  ├─ content.(sjs|xqy)
  │     │  ├─ headers.(sjs|xqy)
  │     │  ├─ main.(sjs|xqy)
  │     │  ├─ triples.(sjs|xqy)
  │     │  └─ writer.(sjs|xqy)
  │     ├─ ...
  │     └─ harmonizeflowN
  ├─ ...
  └─ entityN
</pre>

<dl>

<dt>plugins/entities</dt>
<dd><span markdown="1">This directory contains your entity definitions. An entity is a domain object like Employee or SalesOrder. Each entity directory contains two subdirectories: **input** and **harmonize**. DHF has custom logic to handle the deployment of this directory to MarkLogic.</span>
{% include note-in-list.html type="NOTE" content="The **entities** directory is reserved for data hub use and is treated as a special case by the deploy process." %}
</dd>

<dt>plugins/entities/<i>entity</i>/input</dt>
<dd><span markdown="1">The input subdirectory contains all of the input flows for a given entity. Input flows are responsible for creating an XML or JSON envelope during content ingest. This directory contains one server-side module for each part of the envelope: content, headers, and triples. You may also optionally include a REST directory that contains custom MarkLogic REST extensions related to this input flow.</span></dd>

<dt>plugins/entities/<i>entity</i>/input/content.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for creating the content section of your envelope.</span></dd>

<dt>plugins/entities/<i>entity</i>/input/headers.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for creating the headers section of your envelope.</span></dd>

<dt>plugins/entities/<i>entity</i>/input/main.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for orchestrating your plugins.</span></dd>

<dt>plugins/entities/<i>entity</i>/input/triples.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for creating the triples section of your envelope.</span></dd>

<dt>plugins/entities/<i>entity</i>/harmonize</dt>
<dd><span markdown="1">The harmonize subdirectory contains all of the harmonize flows for a given entity. Harmonize flows are responsible for creating an XML or JSON envelope during content harmonization. This directory contains one server-side module for each part of the envelope: content, headers, and triples. It also contains **collector** and **writer** modules as described below. You may also optionally include a REST directory that contains custom MarkLogic REST extensions that are related to this input flow.</span></dd>

<dt>plugins/entities/<i>entity</i>/harmonize/collector.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for returning a list of things to harmonize. Harmonization is a batch process that operates on one or more items. The returned items should be an array of strings. Each string can have any meaning you like: uri, identifier, sequence number, etc.</span></dd>

<dt>plugins/entities/<i>entity</i>/harmonize/content.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for creating the content section of your envelope.</span></dd>

<dt>plugins/entities/<i>entity</i>/harmonize/headers.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for creating the headers section of your envelope.</span></dd>

<dt>plugins/entities/<i>entity</i>/input/main.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for orchestrating your plugins.</span></dd>

<dt>plugins/entities/<i>entity</i>/harmonize/triples.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for creating the triples section of your envelope.</span></dd>

<dt>plugins/entities/<i>entity</i>/harmonize/writer.(sjs|xqy)</dt>
<dd><span markdown="1">The server-side module (XQuery or JavaScript) responsible for persisting your envelope into MarkLogic.</span></dd>

<dt>plugins/entities/<i>entity</i>/harmonize/REST</dt>
<dd><span markdown="1"><!-- Obsolete? --> Items that used to be here have been moved to `src/main/ml-modules` in DHF 4.x.</span></dd>

</dl>


### plugins/mappings

<pre class="dirtree">
  mappings
  ├─ mapping1
  │  ├─ mapping1-0.mapping.json
  │  ├─ ...
  │  └─ mapping1-N.mapping.json
  ├─ ...
  └─ mappingN
</pre>

This directory contains model-to-model mapping configuration artifacts that can be used to configure an input flow. For details, see [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/).

<dl>

<dt>plugins/mappings/<i>mapping</i></dt>
<dd><span markdown="1">This directory contains all versions of a given model-to-model mapping. The name of the directory is the same as mapping name. For details, see For details, see [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/).</span></dd>

<dt>plugins/mappings/<i>mapping</i>/<i>mapping</i>-<i>version</i>.json</dt>
<dd><span markdown="1">This JSON file is a model-to-model mapping configuration file. QuickStart creates a new version each time you modify a mapping. See [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/).</span></dd>

</dl>


## src/main

<pre class="dirtree">
  src
  └─ main
     ├─ entity-config
     │  └─ databases
     ├─ hub-internal-config
     │  ├─ databases
     │  ├─ schemas
     │  ├─ security
     │  ├─ servers
     │  └─ triggers
     ├─ ml-config
     │  ├─ databases
     │  ├─ entities.layout.json
     │  ├─ security
     │  ├─ servers
     │  └─ triggers
     ├─ ml-modules
     └─ ml-schemas
</pre>

{% include note.html type="NOTE" content="As of DHF 4.1.0, the internal structures of all configuration directories align with that of ml-gradle and should work [as documented in the ml-gradle documentation](https://github.com/marklogic-community/ml-gradle/wiki)." %}


### src/main/entity-config

<pre class="dirtree">
  entity-config
  ├─ final-entity-options.xml
  ├─ staging-entity-options.xml
  └─ databases
     ├─ final-database.json
     └─ staging-database.json
</pre>

This directory contains two options files and two database configuration files for staging and for final. These files can be modified to configure indexes.


### src/main/hub-internal-config

<pre class="dirtree">
  hub-internal-config
  ├─ databases
  │  ├─ job-database.json
  │  ├─ staging-database.json
  │  ├─ staging-schemas-database.json
  │  └─ staging-triggers-database.json
  ├─ schemas
  ├─ security
  │  ├─ privileges
  │  │  ├─ dhf-internal-data-hub.json
  │  │  ├─ dhf-internal-entities.json
  │  │  ├─ dhf-internal-mappings.json
  │  │  └─ dhf-internal-trace-ui.json
  │  ├─ roles
  │  │  ├─ data-hub-role.json
  │  │  └─ hub-admin-role.json
  │  └─ users
  │     ├─ data-hub-user.json
  │     └─ hub-admin-user.json
  ├─ servers
  │  ├─ job-server.json
  │  └─ staging-server.json
  └─ triggers
</pre>

This directory contains subdirectories and JSON files that represent the minimum configuration necessary for DHF to function. **Do not edit anything in this directory.** If you need to override a configuration in this directory, create a file with the same name and directory structure under the [ml-config directory](#src/main/ml-config) and add any properties you'd like to override.

Each of the above JSON files conforms to the MarkLogic REST API for creating the following:
- [databases](https://docs.marklogic.com/REST/PUT/manage/v2/databases/[id-or-name]/properties)
- [privileges](https://docs.marklogic.com/REST/PUT/manage/v2/privileges/[id-or-name]/properties)
- [roles](https://docs.marklogic.com/REST/PUT/manage/v2/roles/[id-or-name]/properties)
- [users](https://docs.marklogic.com/REST/PUT/manage/v2/users/[id-or-name]/properties)
- [servers](https://docs.marklogic.com/REST/PUT/manage/v2/servers/[id-or-name]/properties)

### src/main/ml-config

<pre class="dirtree">
  ml-config
  ├─ databases
  │  ├─ final-database.json
  │  ├─ final-schemas-database.json
  │  ├─ final-triggers-database.json
  │  └─ modules-database.json
  ├─ entities.layout.json
  ├─ security
  │  ├─ privileges
  │  ├─ roles
  │  └─ users
  ├─ servers
  │  └─ final-server.json
  └─ triggers
</pre>

This directory contains additional subdirectories and JSON files used to configure your DHF project. You can add custom modules and transforms, as well as other configuration assets, in this directory.

The following files are found in the `ml-config` directory only:
- `final-database.json`
- `final-schemas-database.json`
- `final-triggers-database.json`
- `modules-database.json`
- `final-server.json`

{% include note.html type="IMPORTANT" content="Starting with DHF 4.1.0, custom triggers must be added to `ml-config/databases/(database name)/triggers`. (In previous versions, triggers were added to `hub-internal-config/triggers` or `ml-config/triggers`.) See [ml-grade Project Layout](https://github.com/marklogic-community/ml-gradle/wiki/Project-layout#database-specific-resources) for more information on triggers." %}


### src/main/ml-modules
This directory is the default ml-gradle location for artifacts to be deployed to the modules database.


### src/main/ml-schemas
This directory contains your project's schemas which are loaded by ml-gradle.


## .tmp

This directory contains temporary hub artifacts.
