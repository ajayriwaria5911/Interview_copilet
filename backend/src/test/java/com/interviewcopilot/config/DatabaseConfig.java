// backend/src/main/java/com/interviewcopilot/config/DatabaseConfig.java
package com.interviewcopilot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.interviewcopilot.repository")
public class DatabaseConfig {
    // Spring Boot auto-configures DataSource from application.yml
    // This class enables JPA repositories and transaction management explicitly
}