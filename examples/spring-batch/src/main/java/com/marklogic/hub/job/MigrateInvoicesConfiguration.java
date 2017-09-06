package com.marklogic.hub.job;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.PropertySource;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration()
@Import(SqlDbToHubJobConfig.class)
@PropertySource(value = "file:job.properties")
public class MigrateInvoicesConfiguration {

    @Bean
    public DataSource dataSource(
        @Value("${jdbc.driver:null}") String jdbcDriverClassName,
        @Value("${jdbc.url:null}") String jdbcUrl,
        @Value("${jdbc.username:sa}") String username,
        @Value("${jdbc.password:sa}") String password

    ) {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(jdbcDriverClassName);
        dataSource.setUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }
}
