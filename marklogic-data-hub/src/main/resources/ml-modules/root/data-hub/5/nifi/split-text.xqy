xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-split-text-processor($params as map:map)
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
          <key>Line Split Count</key>
          <value>
            <name>Line Split Count</name>
          </value>
        </entry>
        <entry>
          <key>Maximum Fragment Size</key>
          <value>
            <name>Maximum Fragment Size</name>
          </value>
        </entry>
        <entry>
          <key>Header Line Count</key>
          <value>
            <name>Header Line Count</name>
          </value>
        </entry>
        <entry>
          <key>Header Line Marker Characters</key>
          <value>
            <name>Header Line Marker Characters</name>
          </value>
        </entry>
        <entry>
          <key>Remove Trailing Newlines</key>
          <value>
            <name>Remove Trailing Newlines</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>Line Split Count</key>
          <value>{map:get($params, "line-split-count")}</value>
        </entry>
        <entry>
          <key>Maximum Fragment Size</key>
        </entry>
        <entry>
          <key>Header Line Count</key>
          <value>0</value>
        </entry>
        <entry>
          <key>Header Line Marker Characters</key>
        </entry>
        <entry>
          <key>Remove Trailing Newlines</key>
          <value>true</value>
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
      <autoTerminate>true</autoTerminate>
      <name>original</name>
    </relationships>
    <relationships>
      <autoTerminate>false</autoTerminate>
      <name>splits</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.processors.standard.SplitText</type>
  </processors>
};

