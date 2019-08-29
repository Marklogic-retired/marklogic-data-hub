xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-database-client-service($params as map:map)
{
  <controllerServices>
    <id>{sem:uuid-string()}</id>
    <parentGroupId>{map:get($params, "parent-group-id")}</parentGroupId>
    <bundle>
      <artifact>nifi-marklogic-nar</artifact>
      <group>org.apache.nifi</group>
      <version>1.8.0.3</version>
    </bundle>
    <comments></comments>
    <descriptors>
      <entry>
        <key>Host</key>
        <value>
          <name>Host</name>
        </value>
      </entry>
      <entry>
        <key>Port</key>
        <value>
          <name>Port</name>
        </value>
      </entry>
      <entry>
        <key>Load Balancer</key>
        <value>
          <name>Load Balancer</name>
        </value>
      </entry>
      <entry>
        <key>Security Context Type</key>
        <value>
          <name>Security Context Type</name>
        </value>
      </entry>
      <entry>
        <key>Username</key>
        <value>
          <name>Username</name>
        </value>
      </entry>
      <entry>
        <key>Password</key>
        <value>
          <name>Password</name>
        </value>
      </entry>
      <entry>
        <key>Database</key>
        <value>
          <name>Database</name>
        </value>
      </entry>
      <entry>
        <key>External name</key>
        <value>
          <name>External name</name>
        </value>
      </entry>
      <entry>
        <key>SSL Context Service</key>
        <value>
          <identifiesControllerService>org.apache.nifi.ssl.SSLContextService</identifiesControllerService>
          <name>SSL Context Service</name>
        </value>
      </entry>
      <entry>
        <key>Client Authentication</key>
        <value>
          <name>Client Authentication</name>
        </value>
      </entry>
    </descriptors>
    <name>DatabaseClient-STAGING</name>
    <persistsState>false</persistsState>
    <properties>
      <entry>
        <key>Host</key>
        {element value{"${host}"}}
      </entry>
      <entry>
        <key>Port</key>
        <value>8010</value>
      </entry>
      <entry>
        <key>Load Balancer</key>
        <value>false</value>
      </entry>
      <entry>
        <key>Security Context Type</key>
        <value>DIGEST</value>
      </entry>
      <entry>
        <key>Username</key>
        <value>{map:get($params, "username")}</value>
      </entry>
      <entry>
        <key>Password</key>
      </entry>
      <entry>
        <key>Database</key>
        <value>data-hub-STAGING</value>
      </entry>
      <entry>
        <key>External name</key>
      </entry>
      <entry>
        <key>SSL Context Service</key>
      </entry>
      <entry>
        <key>Client Authentication</key>
      </entry>
    </properties>
    <state>ENABLED</state>
    <type>org.apache.nifi.marklogic.controller.DefaultMarkLogicDatabaseClientService</type>
  </controllerServices>
};


