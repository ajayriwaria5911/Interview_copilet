// backend/src/main/java/com/interviewcopilot/config/MongoConfig.java
package com.interviewcopilot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
}