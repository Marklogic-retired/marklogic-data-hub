When building/compiling this project via Gradle, include -Pskipui= so that the core DHF project - ./marklogic-data-hub - 
does not build its trace-ui UI code, which is not needed for this project - e.g.:

    ../gradlew clean compileJava -Pskipui=
