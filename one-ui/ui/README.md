# Data Hub Curation UI

## Running the UI

You will need the 5.2-SNAPSHOT of Data Hub from the `epic/DHFPROD-3764` branch in your local Maven repo.
 
In marklogic-data-hub project directory:
 ```
git checkout epic/DHFPROD-3764
./gradlew build -x test -Pskipui=true
./gradlew publishToMavenLocal -Pskipui=true
 ```

In one-ui/spring-boot project directory:
 ```
./gradlew build -x test
./gradlew bootRun
 ```

Go to: http://localhost:8080/