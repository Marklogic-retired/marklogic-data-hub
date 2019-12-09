xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-options-json-processor($params as map:map)
{
  <processors>
    <id>{sem:uuid-string()}</id>
    <parentGroupId>{map:get($params, "parent-group-id")}</parentGroupId>
    <position>
      <x>{map:get($params, "x")}</x>
      <y>{map:get($params, "y")}</y>
    </position>
    <bundle>
      <artifact>nifi-scripting-nar</artifact>
      <group>org.apache.nifi</group>
      <version>1.9.1</version>
    </bundle>
    <config>
      <bulletinLevel>DEBUG</bulletinLevel>
      <comments></comments>
      <concurrentlySchedulableTaskCount>1</concurrentlySchedulableTaskCount>
      <descriptors>
        <entry>
          <key>Script Engine</key>
          <value>
            <name>Script Engine</name>
          </value>
        </entry>
        <entry>
          <key>Script File</key>
          <value>
            <name>Script File</name>
          </value>
        </entry>
        <entry>
          <key>Script Body</key>
          <value>
            <name>Script Body</name>
          </value>
        </entry>
        <entry>
          <key>Module Directory</key>
          <value>
            <name>Module Directory</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>Script Engine</key>
          <value>ECMAScript</value>
        </entry>
        <entry>
          <key>Script File</key>
        </entry>
        <entry>
          <key>Script Body</key>
          <value><![CDATA[
var flowFile = session.get();
if (flowFile != null) {
  var StreamCallback =  Java.type("org.apache.nifi.processor.io.StreamCallback")
  var IOUtils = Java.type("org.apache.commons.io.IOUtils")
  var StandardCharsets = Java.type("java.nio.charset.StandardCharsets")
  var optionsJson;
  flowFile = session.write(flowFile, new StreamCallback(function(inputStream, outputStream) {
    var text = IOUtils.toString(inputStream, StandardCharsets.UTF_8);
    var newObj = {"uris": text.split("\n")};
    optionsJson = JSON.stringify(newObj, null, '\t');
    outputStream.write(optionsJson.getBytes(StandardCharsets.UTF_8));
  }));
  flowFile = session.putAttribute(flowFile, "optionsJson", optionsJson);
  session.transfer(flowFile, REL_SUCCESS)
}]]>
          </value>
        </entry>
        <entry>
          <key>Module Directory</key>
        </entry>
      </properties>
      <runDurationMillis>0</runDurationMillis>
      <schedulingPeriod>0 sec</schedulingPeriod>
      <schedulingStrategy>TIMER_DRIVEN</schedulingStrategy>
      <yieldDuration>1 sec</yieldDuration>
    </config>
    <executionNodeRestricted>false</executionNodeRestricted>
    <name>Build options JSON with URIs</name>
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
    <type>org.apache.nifi.processors.script.ExecuteScript</type>
  </processors>
};
