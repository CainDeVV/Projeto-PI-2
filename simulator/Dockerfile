
FROM amazoncorretto:21-alpine-jdk

WORKDIR /app
COPY SimuladorApp.java .
RUN javac SimuladorApp.java

CMD ["java", "SimuladorApp"]