xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-merge-content-process($params as map:map)
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
          <key>Merge Strategy</key>
          <value>
            <name>Merge Strategy</name>
          </value>
        </entry>
        <entry>
          <key>Merge Format</key>
          <value>
            <name>Merge Format</name>
          </value>
        </entry>
        <entry>
          <key>Attribute Strategy</key>
          <value>
            <name>Attribute Strategy</name>
          </value>
        </entry>
        <entry>
          <key>Correlation Attribute Name</key>
          <value>
            <name>Correlation Attribute Name</name>
          </value>
        </entry>
        <entry>
          <key>mergecontent-metadata-strategy</key>
          <value>
            <name>mergecontent-metadata-strategy</name>
          </value>
        </entry>
        <entry>
          <key>Minimum Number of Entries</key>
          <value>
            <name>Minimum Number of Entries</name>
          </value>
        </entry>
        <entry>
          <key>Maximum Number of Entries</key>
          <value>
            <name>Maximum Number of Entries</name>
          </value>
        </entry>
        <entry>
          <key>Minimum Group Size</key>
          <value>
            <name>Minimum Group Size</name>
          </value>
        </entry>
        <entry>
          <key>Maximum Group Size</key>
          <value>
            <name>Maximum Group Size</name>
          </value>
        </entry>
        <entry>
          <key>Max Bin Age</key>
          <value>
            <name>Max Bin Age</name>
          </value>
        </entry>
        <entry>
          <key>Maximum number of Bins</key>
          <value>
            <name>Maximum number of Bins</name>
          </value>
        </entry>
        <entry>
          <key>Delimiter Strategy</key>
          <value>
            <name>Delimiter Strategy</name>
          </value>
        </entry>
        <entry>
          <key>Header File</key>
          <value>
            <name>Header File</name>
          </value>
        </entry>
        <entry>
          <key>Footer File</key>
          <value>
            <name>Footer File</name>
          </value>
        </entry>
        <entry>
          <key>Demarcator File</key>
          <value>
            <name>Demarcator File</name>
          </value>
        </entry>
        <entry>
          <key>Compression Level</key>
          <value>
            <name>Compression Level</name>
          </value>
        </entry>
        <entry>
          <key>Keep Path</key>
          <value>
            <name>Keep Path</name>
          </value>
        </entry>
        <entry>
          <key>Tar Modified Time</key>
          <value>
            <name>Tar Modified Time</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>Merge Strategy</key>
          <value>Bin-Packing Algorithm</value>
        </entry>
        <entry>
          <key>Merge Format</key>
          <value>Binary Concatenation</value>
        </entry>
        <entry>
          <key>Attribute Strategy</key>
          <value>Keep Only Common Attributes</value>
        </entry>
        <entry>
          <key>Correlation Attribute Name</key>
        </entry>
        <entry>
          <key>mergecontent-metadata-strategy</key>
          <value>Do Not Merge Uncommon Metadata</value>
        </entry>
        <entry>
          <key>Minimum Number of Entries</key>
          <value>1</value>
        </entry>
        <entry>
          <key>Maximum Number of Entries</key>
          <value>1000</value>
        </entry>
        <entry>
          <key>Minimum Group Size</key>
          <value>0 B</value>
        </entry>
        <entry>
          <key>Maximum Group Size</key>
        </entry>
        <entry>
          <key>Max Bin Age</key>
        </entry>
        <entry>
          <key>Maximum number of Bins</key>
          <value>5</value>
        </entry>
        <entry>
          <key>Delimiter Strategy</key>
          <value>Filename</value>
        </entry>
        <entry>
          <key>Header File</key>
        </entry>
        <entry>
          <key>Footer File</key>
        </entry>
        <entry>
          <key>Demarcator File</key>
        </entry>
        <entry>
          <key>Compression Level</key>
          <value>1</value>
        </entry>
        <entry>
          <key>Keep Path</key>
          <value>false</value>
        </entry>
        <entry>
          <key>Tar Modified Time</key>
          {element value {"${file.lastModifiedTime"}}
        </entry>
      </properties>
      <runDurationMillis>0</runDurationMillis>
      <schedulingPeriod>0 sec</schedulingPeriod>
      <schedulingStrategy>TIMER_DRIVEN</schedulingStrategy>
      <yieldDuration>1 sec</yieldDuration>
    </config>
    <executionNodeRestricted>false</executionNodeRestricted>
    <name>Wait for step to complete</name>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>failure</name>
    </relationships>
    <relationships>
      <autoTerminate>false</autoTerminate>
      <name>merged</name>
    </relationships>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>original</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.processors.standard.MergeContent</type>
  </processors>
};

