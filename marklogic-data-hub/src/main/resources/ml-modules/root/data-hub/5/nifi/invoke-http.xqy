xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

declare function build-invoke-http-processor($params as map:map)
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
          <key>HTTP Method</key>
          <value>
            <name>HTTP Method</name>
          </value>
        </entry>
        <entry>
          <key>Remote URL</key>
          <value>
            <name>Remote URL</name>
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
          <key>Connection Timeout</key>
          <value>
            <name>Connection Timeout</name>
          </value>
        </entry>
        <entry>
          <key>Read Timeout</key>
          <value>
            <name>Read Timeout</name>
          </value>
        </entry>
        <entry>
          <key>Include Date Header</key>
          <value>
            <name>Include Date Header</name>
          </value>
        </entry>
        <entry>
          <key>Follow Redirects</key>
          <value>
            <name>Follow Redirects</name>
          </value>
        </entry>
        <entry>
          <key>Attributes to Send</key>
          <value>
            <name>Attributes to Send</name>
          </value>
        </entry>
        <entry>
          <key>Basic Authentication Username</key>
          <value>
            <name>Basic Authentication Username</name>
          </value>
        </entry>
        <entry>
          <key>Basic Authentication Password</key>
          <value>
            <name>Basic Authentication Password</name>
          </value>
        </entry>
        <entry>
          <key>proxy-configuration-service</key>
          <value>
            <identifiesControllerService>org.apache.nifi.proxy.ProxyConfigurationService
            </identifiesControllerService>
            <name>proxy-configuration-service</name>
          </value>
        </entry>
        <entry>
          <key>Proxy Host</key>
          <value>
            <name>Proxy Host</name>
          </value>
        </entry>
        <entry>
          <key>Proxy Port</key>
          <value>
            <name>Proxy Port</name>
          </value>
        </entry>
        <entry>
          <key>Proxy Type</key>
          <value>
            <name>Proxy Type</name>
          </value>
        </entry>
        <entry>
          <key>invokehttp-proxy-user</key>
          <value>
            <name>invokehttp-proxy-user</name>
          </value>
        </entry>
        <entry>
          <key>invokehttp-proxy-password</key>
          <value>
            <name>invokehttp-proxy-password</name>
          </value>
        </entry>
        <entry>
          <key>Put Response Body In Attribute</key>
          <value>
            <name>Put Response Body In Attribute</name>
          </value>
        </entry>
        <entry>
          <key>Max Length To Put In Attribute</key>
          <value>
            <name>Max Length To Put In Attribute</name>
          </value>
        </entry>
        <entry>
          <key>Digest Authentication</key>
          <value>
            <name>Digest Authentication</name>
          </value>
        </entry>
        <entry>
          <key>Always Output Response</key>
          <value>
            <name>Always Output Response</name>
          </value>
        </entry>
        <entry>
          <key>Trusted Hostname</key>
          <value>
            <name>Trusted Hostname</name>
          </value>
        </entry>
        <entry>
          <key>Add Response Headers to Request</key>
          <value>
            <name>Add Response Headers to Request</name>
          </value>
        </entry>
        <entry>
          <key>Content-Type</key>
          <value>
            <name>Content-Type</name>
          </value>
        </entry>
        <entry>
          <key>send-message-body</key>
          <value>
            <name>send-message-body</name>
          </value>
        </entry>
        <entry>
          <key>Use Chunked Encoding</key>
          <value>
            <name>Use Chunked Encoding</name>
          </value>
        </entry>
        <entry>
          <key>Penalize on "No Retry"</key>
          <value>
            <name>Penalize on "No Retry"</name>
          </value>
        </entry>
        <entry>
          <key>use-etag</key>
          <value>
            <name>use-etag</name>
          </value>
        </entry>
        <entry>
          <key>etag-max-cache-size</key>
          <value>
            <name>etag-max-cache-size</name>
          </value>
        </entry>
      </descriptors>
      <executionNode>ALL</executionNode>
      <lossTolerant>false</lossTolerant>
      <penaltyDuration>30 sec</penaltyDuration>
      <properties>
        <entry>
          <key>HTTP Method</key>
          <value>{map:get($params, "http-method")}</value>
        </entry>
        <entry>
          <key>Remote URL</key>
          <value>{map:get($params, "remote-url")}</value>
        </entry>
        <entry>
          <key>SSL Context Service</key>
        </entry>
        <entry>
          <key>Connection Timeout</key>
          <value>5 secs</value>
        </entry>
        <entry>
          <key>Read Timeout</key>
          <value>15 secs</value>
        </entry>
        <entry>
          <key>Include Date Header</key>
          <value>True</value>
        </entry>
        <entry>
          <key>Follow Redirects</key>
          <value>True</value>
        </entry>
        <entry>
          <key>Attributes to Send</key>
        </entry>
        <entry>
          <key>Basic Authentication Username</key>
          <value>{map:get($params, "basic-authentication-username")}</value>
        </entry>
        <entry>
          <key>Basic Authentication Password</key>
        </entry>
        <entry>
          <key>proxy-configuration-service</key>
        </entry>
        <entry>
          <key>Proxy Host</key>
        </entry>
        <entry>
          <key>Proxy Port</key>
        </entry>
        <entry>
          <key>Proxy Type</key>
          <value>http</value>
        </entry>
        <entry>
          <key>invokehttp-proxy-user</key>
        </entry>
        <entry>
          <key>invokehttp-proxy-password</key>
        </entry>
        <entry>
          <key>Put Response Body In Attribute</key>
        </entry>
        <entry>
          <key>Max Length To Put In Attribute</key>
          <value>256</value>
        </entry>
        <entry>
          <key>Digest Authentication</key>
          <value>{map:get($params, "digest-authentication")}</value>
        </entry>
        <entry>
          <key>Always Output Response</key>
          <value>false</value>
        </entry>
        <entry>
          <key>Trusted Hostname</key>
        </entry>
        <entry>
          <key>Add Response Headers to Request</key>
          <value>false</value>
        </entry>
        <entry>
          <key>Content-Type</key>
          {element value {"${mime.type}"}}
        </entry>
        <entry>
          <key>send-message-body</key>
          <value>true</value>
        </entry>
        <entry>
          <key>Use Chunked Encoding</key>
          <value>false</value>
        </entry>
        <entry>
          <key>Penalize on "No Retry"</key>
          <value>false</value>
        </entry>
        <entry>
          <key>use-etag</key>
          <value>false</value>
        </entry>
        <entry>
          <key>etag-max-cache-size</key>
          <value>10MB</value>
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
      <autoTerminate>true</autoTerminate>
      <name>Failure</name>
    </relationships>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>No Retry</name>
    </relationships>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>Original</name>
    </relationships>
    <relationships>
      <autoTerminate>false</autoTerminate>
      <name>Response</name>
    </relationships>
    <relationships>
      <autoTerminate>true</autoTerminate>
      <name>Retry</name>
    </relationships>
    <state>STOPPED</state>
    <style/>
    <type>org.apache.nifi.processors.standard.InvokeHTTP</type>
  </processors>
};
