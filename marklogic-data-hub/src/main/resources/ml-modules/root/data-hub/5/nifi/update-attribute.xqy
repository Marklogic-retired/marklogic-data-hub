xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-update-attribute($params as map:map)
{
  <processors>
    <id>{sem:uuid-string()}</id>
    <parentGroupId>{map:get($params, "parent-group-id")}</parentGroupId>
    <position>
      <x>{map:get($params, "x")}</x>
      <y>{map:get($params, "y")}</y>
    </position>
    <bundle>
      <artifact>nifi-update-attribute-nar</artifact>
      <group>org.apache.nifi</group>
      <version>1.9.2</version>
    </bundle>
    <config>
      <bulletinLevel>DEBUG</bulletinLevel>
      <comments></comments>
      <concurrentlySchedulableTaskCount>1</concurrentlySchedulableTaskCount>
      <descriptors>
        <entry>
          <key>Delete Attributes Expression</key>
          <value>
            <name>Delete Attributes Expression</name>
          </value>
        </entry>
        <entry>
          <key>Store State</key>
          <value>
            <name>Store State</name>
          </value>
        </entry>
        <entry>
          <key>Stateful Variables Initial Value</key>
          <value>
            <name>Stateful Variables Initial Value</name>
          </value>
        </entry>
        <entry>
          <key>canonical-value-lookup-cache-size</key>
          <value>
            <name>canonical-value-lookup-cache-size</name>
          </value>
        </entry>
        <entry>
          <key>marklogic.uri</key>
          <value>
            <name>marklogic.uri</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>Delete Attributes Expression</key>
        </entry>
        <entry>
          <key>Store State</key>
          <value>Do not store state</value>
        </entry>
        <entry>
          <key>Stateful Variables Initial Value</key>
        </entry>
        <entry>
          <key>canonical-value-lookup-cache-size</key>
          <value>100</value>
        </entry>
        <entry>
          <key>marklogic.uri</key>
          {element value{"/" || map:get($params, "flow-name") || "/" || map:get($params, "step-name") || "/${filename}"}}
        </entry>
      </properties>
      <runDurationMillis>0</runDurationMillis>
      <schedulingPeriod>0 sec</schedulingPeriod>
      <schedulingStrategy>TIMER_DRIVEN</schedulingStrategy>
      <yieldDuration>1 sec</yieldDuration>
    </config>
    <executionNodeRestricted>false</executionNodeRestricted>
    <name>Set marklogic.uri attribute</name>
    <relationships>
      <autoTerminate>false</autoTerminate>
      <name>success</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.processors.attributes.UpdateAttribute</type>
  </processors>
};

