xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-log-attribute-processor($params as map:map) as element(processors)
{
  <processors>
    <id>{sem:uuid-string()}</id>
    <parentGroupId>{map:get($params, "parent-group-id")}</parentGroupId>
    <position>
      <x>{map:get($params, "x")}</x>
      <y>{map:get($params, "y")}</y>
    </position>
    <bundle>
      <artifact>nifi-standard-nar</artifact>
      <group>org.apache.nifi</group>
      <version>1.9.1</version>
    </bundle>
    <config>
      <bulletinLevel>DEBUG</bulletinLevel>
      <comments></comments>
      <concurrentlySchedulableTaskCount>1</concurrentlySchedulableTaskCount>
      <descriptors>
        <entry>
          <key>Log Level</key>
          <value>
            <name>Log Level</name>
          </value>
        </entry>
        <entry>
          <key>Log Payload</key>
          <value>
            <name>Log Payload</name>
          </value>
        </entry>
        <entry>
          <key>Attributes to Log</key>
          <value>
            <name>Attributes to Log</name>
          </value>
        </entry>
        <entry>
          <key>attributes-to-log-regex</key>
          <value>
            <name>attributes-to-log-regex</name>
          </value>
        </entry>
        <entry>
          <key>Attributes to Ignore</key>
          <value>
            <name>Attributes to Ignore</name>
          </value>
        </entry>
        <entry>
          <key>attributes-to-ignore-regex</key>
          <value>
            <name>attributes-to-ignore-regex</name>
          </value>
        </entry>
        <entry>
          <key>Log prefix</key>
          <value>
            <name>Log prefix</name>
          </value>
        </entry>
        <entry>
          <key>character-set</key>
          <value>
            <name>character-set</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>Log Level</key>
          <value>info</value>
        </entry>
        <entry>
          <key>Log Payload</key>
          <value>{map:get($params, "log-payload")}</value>
        </entry>
        <entry>
          <key>Attributes to Log</key>
        </entry>
        <entry>
          <key>attributes-to-log-regex</key>
          <value>{map:get($params, "attributes-to-log")}</value>
        </entry>
        <entry>
          <key>Attributes to Ignore</key>
        </entry>
        <entry>
          <key>attributes-to-ignore-regex</key>
        </entry>
        <entry>
          <key>Log prefix</key>
        </entry>
        <entry>
          <key>character-set</key>
          <value>UTF-8</value>
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
      <name>success</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.processors.standard.LogAttribute</type>
  </processors>
};
