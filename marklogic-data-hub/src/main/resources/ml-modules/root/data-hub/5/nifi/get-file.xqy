xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-get-file($params as map:map){
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
      <version>1.9.2</version>
    </bundle>
    <config>
      <bulletinLevel>DEBUG</bulletinLevel>
      <comments></comments>
      <concurrentlySchedulableTaskCount>1</concurrentlySchedulableTaskCount>
      <descriptors>
        <entry>
          <key>Input Directory</key>
          <value>
            <name>Input Directory</name>
          </value>
        </entry>
        <entry>
          <key>File Filter</key>
          <value>
            <name>File Filter</name>
          </value>
        </entry>
        <entry>
          <key>Path Filter</key>
          <value>
            <name>Path Filter</name>
          </value>
        </entry>
        <entry>
          <key>Batch Size</key>
          <value>
            <name>Batch Size</name>
          </value>
        </entry>
        <entry>
          <key>Keep Source File</key>
          <value>
            <name>Keep Source File</name>
          </value>
        </entry>
        <entry>
          <key>Recurse Subdirectories</key>
          <value>
            <name>Recurse Subdirectories</name>
          </value>
        </entry>
        <entry>
          <key>Polling Interval</key>
          <value>
            <name>Polling Interval</name>
          </value>
        </entry>
        <entry>
          <key>Ignore Hidden Files</key>
          <value>
            <name>Ignore Hidden Files</name>
          </value>
        </entry>
        <entry>
          <key>Minimum File Age</key>
          <value>
            <name>Minimum File Age</name>
          </value>
        </entry>
        <entry>
          <key>Maximum File Age</key>
          <value>
            <name>Maximum File Age</name>
          </value>
        </entry>
        <entry>
          <key>Minimum File Size</key>
          <value>
            <name>Minimum File Size</name>
          </value>
        </entry>
        <entry>
          <key>Maximum File Size</key>
          <value>
            <name>Maximum File Size</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>Input Directory</key>
          <value>{map:get($params, "input-directory")}</value>
        </entry>
        <entry>
          <key>File Filter</key>
          <value>.*json</value>
        </entry>
        <entry>
          <key>Path Filter</key>
        </entry>
        <entry>
          <key>Batch Size</key>
          <value>10</value>
        </entry>
        <entry>
          <key>Keep Source File</key>
          <value>true</value>
        </entry>
        <entry>
          <key>Recurse Subdirectories</key>
          <value>true</value>
        </entry>
        <entry>
          <key>Polling Interval</key>
          <value>0 sec</value>
        </entry>
        <entry>
          <key>Ignore Hidden Files</key>
          <value>true</value>
        </entry>
        <entry>
          <key>Minimum File Age</key>
          <value>0 sec</value>
        </entry>
        <entry>
          <key>Maximum File Age</key>
        </entry>
        <entry>
          <key>Minimum File Size</key>
          <value>0 B</value>
        </entry>
        <entry>
          <key>Maximum File Size</key>
        </entry>
      </properties>
      <runDurationMillis>0</runDurationMillis>
      <schedulingPeriod>3600 sec</schedulingPeriod>
      <schedulingStrategy>TIMER_DRIVEN</schedulingStrategy>
      <yieldDuration>1 sec</yieldDuration>
    </config>
    <executionNodeRestricted>false</executionNodeRestricted>
    <name>{map:get($params, "name")}</name>
    <relationships>
      <autoTerminate>false</autoTerminate>
      <name>success</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.processors.standard.GetFile</type>
  </processors>
};
