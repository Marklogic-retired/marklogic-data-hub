FROM gradle:jdk11 as build-stage
RUN mkdir -p /usr/src/explorer
COPY . /usr/src/explorer/
WORKDIR /usr/src/explorer
RUN gradle build -x test

FROM azul/zulu-openjdk-alpine:11
RUN mkdir -p /usr/src/explorer
COPY --from=build-stage /usr/src/explorer/build/libs/*.jar /usr/src/explorer/explorer.jar
WORKDIR /usr/src/explorer
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "explorer.jar"]