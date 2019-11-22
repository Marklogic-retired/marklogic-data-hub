xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-put-marklogic($params as map:map)
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
      <bulletinLevel>DEBUG</bulletinLevel>
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
          <key>Batch Size</key>
          <value>
            <name>Batch Size</name>
          </value>
        </entry>
        <entry>
          <key>Thread Count</key>
          <value>
            <name>Thread Count</name>
          </value>
        </entry>
        <entry>
          <key>Collections</key>
          <value>
            <name>Collections</name>
          </value>
        </entry>
        <entry>
          <key>Format</key>
          <value>
            <name>Format</name>
          </value>
        </entry>
        <entry>
          <key>Job ID</key>
          <value>
            <name>Job ID</name>
          </value>
        </entry>
        <entry>
          <key>Job Name</key>
          <value>
            <name>Job Name</name>
          </value>
        </entry>
        <entry>
          <key>MIME type</key>
          <value>
            <name>MIME type</name>
          </value>
        </entry>
        <entry>
          <key>Permissions</key>
          <value>
            <name>Permissions</name>
          </value>
        </entry>
        <entry>
          <key>Server Transform</key>
          <value>
            <name>Server Transform</name>
          </value>
        </entry>
        <entry>
          <key>Temporal Collection</key>
          <value>
            <name>Temporal Collection</name>
          </value>
        </entry>
        <entry>
          <key>URI Attribute Name</key>
          <value>
            <name>URI Attribute Name</name>
          </value>
        </entry>
        <entry>
          <key>URI Prefix</key>
          <value>
            <name>URI Prefix</name>
          </value>
        </entry>
        <entry>
          <key>URI Suffix</key>
          <value>
            <name>URI Suffix</name>
          </value>
        </entry>
        <entry>
          <key>trans:flow-name</key>
          <value>
            <name>trans:flow-name</name>
          </value>
        </entry>
        <entry>
          <key>trans:step</key>
          <value>
            <name>trans:step</name>
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
          <key>Batch Size</key>
          <value>{map:get($params, "batch-size")}</value>
        </entry>
        <entry>
          <key>Thread Count</key>
          <value>{map:get($params, "thread-count")}</value>
        </entry>
        <entry>
          <key>Collections</key>
          <value>{map:get($params, "collections")}</value>
        </entry>
        <entry>
          <key>Format</key>
        </entry>
        <entry>
          <key>Job ID</key>
        </entry>
        <entry>
          <key>Job Name</key>
        </entry>
        <entry>
          <key>MIME type</key>
        </entry>
        <entry>
          <key>Permissions</key>
          <value>rest-reader,read,rest-writer,update</value>
        </entry>
        <entry>
          <key>Server Transform</key>
          <value>mlRunIngest</value>
        </entry>
        <entry>
          <key>Temporal Collection</key>
        </entry>
        <entry>
          <key>URI Attribute Name</key>
          <value>marklogic.uri</value>
        </entry>
        <entry>
          <key>URI Prefix</key>
        </entry>
        <entry>
          <key>URI Suffix</key>
        </entry>
        <entry>
          <key>trans:flow-name</key>
          <value>{map:get($params, "flow-name")}</value>
        </entry>
        <entry>
          <key>trans:step</key>
          <value>1</value>
        </entry>
      </properties>
      <runDurationMillis>0</runDurationMillis>
      <schedulingPeriod>0 sec</schedulingPeriod>
      <schedulingStrategy>TIMER_DRIVEN</schedulingStrategy>
      <yieldDuration>1 sec</yieldDuration>
    </config>
    <executionNodeRestricted>false</executionNodeRestricted>
    <name>Ingest into MarkLogic</name>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>batch_success</name>
    </relationships>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>failure</name>
    </relationships>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>success</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.marklogic.processor.PutMarkLogic</type>
  </processors>
};
