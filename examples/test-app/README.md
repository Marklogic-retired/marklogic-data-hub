This is an ml-gradle project to run the reverse proxy on a http port and https 443 port

## Running the reverse proxy

This project also includes a Gradle task for running a reverse proxy server using [Undertow](https://undertow.io/). 
This is intended to support testing the use of a "base path" parameter with the Java Client and to also do a reasonable
job of emulating how MarkLogic Cloud works. 

Note - the reverse proxy server only supports basic authentication, not digest authentication. Thus, you need to ensure
that any MarkLogic app server that you proxy requests to supports either "digestbasic" or "basic" for authentication. 
That includes your Admin, Manage, and App-Services app servers.

To run the server, run the following:

    ./gradlew runBlockingReverseProxyServer

By default, this will listen on port 8020 and proxy requests based on the mapping that it logs when the server is 
started up.

To emulate how MarkLogic Cloud works, run the following (you can use `runBlock` as an abbreviation, Gradle will figure 
out what you mean):

    sudo ./gradlew runBlock -PrpsHttpsPort=443

This will result in the server listening for HTTPS requests on port 443; sudo is required since this listens to a port
under 1024. 

You can also specify custom mappings via the Gradle task. For example, if you have a MarkLogic app server listening on 
port 8123 and you want to associate a path of "/my/custom/server" to it, you can do:

    ./gradlew runBlock -PrpsCustomMappings=/my/custom/server,8123

The selfsigned.jks file in the src/main/resources directory is used for enabling SSL in the ReverseProxyServer program. It is a simple PKCS12 keystore with a single self-signed certificate in it named "selfsigned". A copy of that certificate is stored
in this directory as well with the name "selfsigned-cert.pem".

To import the selfsigned certificate into your JVM truststore, run the following command, replacing "changeit" with 
the correct password for your JVM's jssecacerts or cacerts file (check your JVM's jre/lib/security file to see which 
one exists; also note that "changeit" may be correct since that's the default password for a cacerts file):

    keytool -importcert -file selfsigned-cert.pem -alias selfsigned -storepass changeit

The certificate will be added to the cacerts keystore in your jvm. Make sure this jvm and the jvm used by gradle are the same   