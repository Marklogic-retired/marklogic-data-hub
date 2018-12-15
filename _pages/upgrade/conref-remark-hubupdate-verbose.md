Running the `hubUpdate` task with the `-i` option (info mode) displays specifically what the task does, including configuration settings that changed.

  <details><summary><b>Example:</b> A verbose report.</summary>
    <pre>
    Upgrading entity-config dir
    Upgrading hub-internal-config dir
    Processing /your-project-root/hub-internal-config/databases/job-database.json
    Setting "schema-database" to "%%mlStagingSchemasDbName%%"
    Setting "triggers-database" to "%%mlStagingTriggersDbName%%"
    Adding path range indexes to job-database.json
    Writing /your-project-root/hub-internal-config/databases/job-database.json to /your-project-root/src/main/hub-internal-config/databases/job-database.json
    Processing /your-project-root/hub-internal-config/databases/final-database.json
    Setting "schema-database" to "%%mlFinalSchemasDbName%%"
    Setting "triggers-database" to "%%mlFinalTriggersDbName%%"
    Writing /your-project-root/hub-internal-config/databases/final-database.json to /your-project-root/src/main/ml-config/databases/final-database.json
    Processing /your-project-root/hub-internal-config/databases/staging-database.json
    Setting "schema-database" to "%%mlStagingSchemasDbName%%"
    Setting "triggers-database" to "%%mlStagingTriggersDbName%%"
    Writing /your-project-root/hub-internal-config/databases/staging-database.json to /your-project-root/src/main/hub-internal-config/databases/staging-database.json
    Writing /your-project-root/hub-internal-config/databases/modules-database.json to /your-project-root/src/main/ml-config/databases/modules-database.json
    Processing /your-project-root/hub-internal-config/servers/job-server.json
    Setting "url-rewriter" to "/data-hub/4/tracing/tracing-rewriter.xml"
    Writing /your-project-root/hub-internal-config/servers/job-server.json to /your-project-root/src/main/hub-internal-config/servers/job-server.json
    Writing /your-project-root/hub-internal-config/servers/final-server.json to /your-project-root/src/main/ml-config/servers/final-server.json
    Processing /your-project-root/hub-internal-config/servers/staging-server.json
    Setting "url-rewriter" to "/data-hub/4/rest-api/rewriter.xml"
    Setting "error-handler" to "/data-hub/4/rest-api/error-handler.xqy"
    Writing /your-project-root/hub-internal-config/servers/staging-server.json to /your-project-root/src/main/hub-internal-config/servers/staging-server.json
    Upgrading user-config dir
    </pre>
  </details>