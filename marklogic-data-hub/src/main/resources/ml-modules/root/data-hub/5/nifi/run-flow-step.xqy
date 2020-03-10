xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-run-flow-step($params as map:map)
{
  <processors>
    <id>{sem:uuid-string()}</id>
    <parentGroupId>{map:get($params, "parent-group-id")}</parentGroupId>
    <position>
      <x>{map:get($params, "x")}</x>
      <y>{map:get($params, "y")}</y>
    </position>
    <bundle>
      <artifact>nifi-marklogic-nar</artifact>
      <group>org.apache.nifi</group>
      <version>1.8.0.3</version>
    </bundle>
    <config>
      <bulletinLevel>WARN</bulletinLevel>
      <comments></comments>
      <concurrentlySchedulableTaskCount>1</concurrentlySchedulableTaskCount>
      <descriptors>
        <entry>
          <key>DatabaseClient Service</key>
          <value>
            <identifiesControllerService>org.apache.nifi.marklogic.controller.MarkLogicDatabaseClientService</identifiesControllerService>
            <name>DatabaseClient Service</name>
          </value>
        </entry>
        <entry>
          <key>Extension Name</key>
          <value>
            <name>Extension Name</name>
          </value>
        </entry>
        <entry>
          <key>Requires Input</key>
          <value>
            <name>Requires Input</name>
          </value>
        </entry>
        <entry>
          <key>Method Type</key>
          <value>
            <name>Method Type</name>
          </value>
        </entry>
        <entry>
          <key>Payload Source</key>
          <value>
            <name>Payload Source</name>
          </value>
        </entry>
        <entry>
          <key>Payload Format</key>
          <value>
            <name>Payload Format</name>
          </value>
        </entry>
        <entry>
          <key>Payload</key>
          <value>
            <name>Payload</name>
          </value>
        </entry>
        <entry>
          <key>param:flow-name</key>
          <value>
            <name>param:flow-name</name>
          </value>
        </entry>
        <entry>
          <key>param:options</key>
          <value>
            <name>param:options</name>
          </value>
        </entry>
        <entry>
          <key>param:step</key>
          <value>
            <name>param:step</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>DatabaseClient Service</key>
          <value>{map:get($params, "databaseclient-service-id")}</value>
        </entry>
        <entry>
          <key>Extension Name</key>
          <value>mlRunFlow</value>
        </entry>
        <entry>
          <key>Requires Input</key>
          <value>true</value>
        </entry>
        <entry>
          <key>Method Type</key>
          <value>POST</value>
        </entry>
        <entry>
          <key>Payload Source</key>
          <value>None</value>
        </entry>
        <entry>
          <key>Payload Format</key>
          <value>TEXT</value>
        </entry>
        <entry>
          <key>Payload</key>
        </entry>
        <entry>
          <key>param:flow-name</key>
          <value>{map:get($params, "flow-name")}</value>
        </entry>
        <entry>
          <key>param:options</key>
          {element value {"${optionsJson}"}}
        </entry>
        <entry>
          <key>param:step</key>
          <value>{map:get($params, "step-number")}</value>
        </entry>
      </properties>
      <runDurationMillis>0</runDurationMillis>
      <schedulingPeriod>0 sec</schedulingPeriod>
      <schedulingStrategy>TIMER_DRIVEN</schedulingStrategy>
      <yieldDuration>1 sec</yieldDuration>
    </config>
    <executionNodeRestricted>false</executionNodeRestricted>
    <name>{map:get($params, "name")}</name>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>failure</name>
    </relationships>
    <relationships>
      <autoTerminate>false</autoTerminate>
      <name>success</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.marklogic.processor.ExtensionCallMarkLogic</type>
  </processors>
};
