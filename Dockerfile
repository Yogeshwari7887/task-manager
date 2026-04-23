# -------- Build stage --------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy backend sources
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src

# Build Spring Boot jar
RUN mvn -f backend/pom.xml clean package -DskipTests

# -------- Run stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/backend/target/task-manager-1.0.0.jar app.jar

# Railway injects PORT at runtime
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
