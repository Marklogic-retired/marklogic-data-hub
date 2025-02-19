package com.marklogic.hub.central;

import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;

/**
 * Configures the /swagger-ui/ endpoint via springfox. For assistance with configuring Spring MVC controller
 * methods, see examples of existing controllers. Can also check the docs at https://springfox.github.io/springfox/docs/current/ ,
 * though searching for help via stackoverflow has generally been more helpful.
 */
@Configuration
@Profile("dev")
public class SwaggerConfig implements WebMvcConfigurer {

    public SwaggerConfig() {
        LoggerFactory.getLogger(getClass()).info("SwaggerConfig is enabled; can access docs at /swagger-ui/");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.
                addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/springfox-swagger-ui/")
                .resourceChain(false);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/swagger-ui/")
                .setViewName("forward:/swagger-ui/index.html");
    }

    @Bean
    public Docket swaggerUiConfiguration() {

        return new Docket(DocumentationType.SWAGGER_2)
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.marklogic.hub.central.controllers"))
            .apis(RequestHandlerSelectors.withClassAnnotation(Controller.class))
            .paths(PathSelectors.any())
            .build()
            .apiInfo(new ApiInfoBuilder()
                .title("Hub Central API")
                .build()
            );
    }
}
