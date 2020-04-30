/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.central;

import com.fasterxml.classmate.ResolvedType;
import com.fasterxml.classmate.TypeResolver;
import com.marklogic.hub.central.controllers.*;
import com.marklogic.hub.central.schemas.*;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.filter.CommonsRequestLoggingFilter;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * The Hub Central application does not autowire any beans defined in Data Hub core. This is done to avoid any
 * dependency on a Spring-managed HubConfig instance, which combines both application-wide configuration and
 * user-specific authentication information. HubConfig also depends on a HubProject, which does not exist in
 * Hub Central.
 * <p>
 * Hub Central beans should depend on HubClient instead, as Hub Central is expected to have a session-scoped
 * implementation of this interface.
 */
@SpringBootApplication
@EnableSwagger2
@ComponentScan(basePackages = "com.marklogic.hub.central")
public class Application {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }

    /**
     * Configures the swagger-ui.html endpoint via springfox. For assistance with configuring Spring MVC controller
     * methods, see examples of existing controllers. Can also check the docs at https://springfox.github.io/springfox/docs/current/ ,
     * though searching for help via stackoverflow has generally been more helpful.
     *
     * @param typeResolver Needed to define definition classes that can be referenced by endpoints in ApiImplicitParam
     *                     annotations
     * @return
     */
    @Bean
    public Docket swaggerUiConfiguration(TypeResolver typeResolver) {
        final List<ResolvedType> resolvedTypes = getResolvedTypes(typeResolver);

        return new Docket(DocumentationType.SWAGGER_2)
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.marklogic.hub.central.controllers"))
            .apis(RequestHandlerSelectors.withClassAnnotation(Controller.class))
            .paths(PathSelectors.any())
            .build()
            /**
             * As documented at https://github.com/springfox/springfox/issues/2609 , we can create Java classes to
             * serve as documentation for endpoints that accept a JsonNode as their request body. Those classes must be
             * referenced here and then can be reference by their simple class name.
             */
            .additionalModels(resolvedTypes.get(0), resolvedTypes.subList(1, resolvedTypes.size()).toArray(new ResolvedType[]{}))
            .apiInfo(new ApiInfoBuilder()
                .title("Hub Central API")
                .build()
            );
    }

    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeClientInfo(true);
        filter.setIncludeQueryString(true);
        return filter;
    }

    /**
     * Copied from https://karl.run/2018/05/07/kotlin-spring-boot-react/ - ensures that for a single page application,
     * any non-root route is routed back to "/".
     *
     * @return
     */
    @Bean
    public ConfigurableServletWebServerFactory webServerFactory() {
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        // All errors should go to the index page
        Set<ErrorPage> errorPages = factory.getErrorPages();
        Stream.of(HttpStatus.values()).forEach((httpStatus -> {
            int statusValue = httpStatus.value();
            if (statusValue >= 400) {
                errorPages.add(new ErrorPage(HttpStatus.valueOf(statusValue), "/error"));
            }
        }));
        factory.getErrorPages().add(new ErrorPage(Throwable.class, "/error"));
        return factory;
    }

    /**
     * Define all resolved types in this class. Note that for any endpoint that returns a List, you can make a subclass
     * of ArrayList that is bound to a particular type, but you must define that type in this method. See existing
     * controllers for examples of this.
     *
     * Note as well that when using ApiImplicitParam on a parameter with the RequestBody annotation, that parameter must
     * be the first parameter in the method declaration. Otherwise, the ApiImplicitParam will not be associated with the
     * RequestBody.
     *
     * @param typeResolver
     * @return
     */
    private List<ResolvedType> getResolvedTypes(TypeResolver typeResolver) {
        return Stream.of(
            EntitySearchController.FacetValues.class,
            EntitySearchController.FacetValuesQuery.class,
            EntitySearchController.IndexMinMaxQuery.class,
            EntitySearchController.SavedQueryRequest.class,
            EntitySearchController.SavedQueries.class,
            FlowController.Flows.class,
            FlowSchema.class,
            FlowController.Steps.class,
            FlowController.StepSchema.class,
            LoadDataController.LoadDataArtifact.class,
            LoadDataController.LoadDataArtifacts.class,
            MappingController.MappingArtifacts.class,
            MappingController.MappingArtifact.class,
            MatchingController.MatchingArtifact.class,
            MatchingController.MatchingArtifacts.class,
            ModelController.CreateModelInput.class,
            ModelController.LatestJobInfo.class,
            ModelDefinitions.class,
            ModelDescriptor.class,
            PrimaryEntityType.class,
            StepSettingsSchema.class
        ).map(type -> typeResolver.resolve(type)).collect(Collectors.toList());
    }
}
