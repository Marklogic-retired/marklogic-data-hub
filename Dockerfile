FROM gradle:jdk11 as build-stage
RUN mkdir /app
COPY . /app/
WORKDIR /app
RUN gradle build -x test

FROM azul/zulu-openjdk-alpine:11
RUN mkdir /app
COPY --from=build-stage /app/build/libs/*.jar /app/explorer.jar
WORKDIR /app
EXPOSE 8080 8443
ENTRYPOINT ["java", "-jar", "explorer.jar"]