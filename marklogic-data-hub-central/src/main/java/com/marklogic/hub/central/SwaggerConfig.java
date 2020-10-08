package com.marklogic.hub.central;

import com.fasterxml.classmate.ResolvedType;
import com.fasterxml.classmate.TypeResolver;
import com.marklogic.hub.central.controllers.EntitySearchController;
import com.marklogic.hub.central.controllers.MappingController;
import com.marklogic.hub.central.controllers.ModelController;
import com.marklogic.hub.central.controllers.steps.IngestionStepController;
import com.marklogic.hub.central.controllers.steps.MappingStepController;
import com.marklogic.hub.central.controllers.steps.MatchingStepController;
import com.marklogic.hub.central.controllers.steps.MergingStepController;
import com.marklogic.hub.central.schemas.*;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Configures the swagger-ui.html endpoint via springfox. For assistance with configuring Spring MVC controller
 * methods, see examples of existing controllers. Can also check the docs at https://springfox.github.io/springfox/docs/current/ ,
 * though searching for help via stackoverflow has generally been more helpful.
 */
@Configuration
@EnableSwagger2
@Profile("dev")
public class SwaggerConfig {

    public SwaggerConfig() {
        LoggerFactory.getLogger(getClass()).info("SwaggerConfig is enabled; can access docs at /swagger-ui.html");
    }

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

    /**
     * Define all resolved types in this class. Note that for any endpoint that returns a List, you can make a subclass
     * of ArrayList that is bound to a particular type, but you must define that type in this method. See existing
     * controllers for examples of this.
     * <p>
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
                EntitySearchController.HubMetadata.class,
                FlowSchema.class,
                IngestionStepController.IngestionSteps.class,
                MappingController.MappingArtifact.class,
                MappingStepController.class,
                MappingStepController.MappingSteps.class,
                MatchingStepController.class,
                MatchingStepController.MatchingSteps.class,
                MergingStepController.class,
                MergingStepController.MergingSteps.class,
                ModelController.CreateModelInput.class,
                ModelController.LatestJobInfo.class,
                ModelController.ModelReferencesInfo.class,
                ModelController.UpdateModelInput.class,
                ModelDefinitions.class,
                ModelDescriptor.class,
                PrimaryEntityType.class,
                StepSchema.class
        ).map(type -> typeResolver.resolve(type)).collect(Collectors.toList());
    }
}
