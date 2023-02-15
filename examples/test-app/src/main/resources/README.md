The selfsigned.jks file in this directory is used for enabling SSL in the ReverseProxyServer program. It is a simple
PKCS12 keystore with a single self-signed certificate in it named "selfsigned". A copy of that certificate is stored
in this directory as well with the name "selfsigned-cert.pem".

To import the selfsigned certificate into your JVM truststore, run the following command, replacing "changeit" with 
the correct password for your JVM's jssecacerts or cacerts file (check your JVM's jre/lib/security file to see which 
one exists; also note that "changeit" may be correct since that's the default password for a cacerts file):

    keytool -importcert -file selfsigned-cert.pem -alias selfsigned -storepass changeit

