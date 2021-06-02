/*
 * Copyright 2012-2021 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.central;

import com.marklogic.hub.central.auth.SessionMonitorInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Autowired
    private SimpMessagingTemplate template;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**/*")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(new PathResourceResolver() {
                @Override
                protected Resource getResource(String resourcePath, Resource location)
                    throws IOException {
                    Resource requestedResource = location.createRelative(resourcePath);
                    return requestedResource.exists() && requestedResource.isReadable() ? requestedResource
                        : new ClassPathResource("static/index.html");
                }
            });
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SessionMonitorInterceptor(template));
    }

    /**
     * We need this since we are using a StreamingResponseBody for asynchronous request processing in the csv
     * export feature. StreamingResponseBody by default uses a SimpleAsyncTaskExecutor which does not reuse threads,
     * as a result, its advisable to provide our own TaskExecutor.
     * Also, this allows us to configure the Default Timeout which at this point is 10 minutes.
     * @param configurer
     */
    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        final ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();

        // Setting core pool size to 10 since we aren't expecting more than 5~10 concurrent users.
        // If all threads are busy and a request comes in then that request is queued.
        taskExecutor.setCorePoolSize(10);

        // Setting the max pool size, also to 10 makes this a fixed sized thread pool.
        taskExecutor.setMaxPoolSize(10);
        taskExecutor.initialize();

        // Setting the default timeout value to 10 minutes since that aligns with the request timeout value of MarkLogic server
        configurer.setDefaultTimeout(600000)
            .setTaskExecutor(taskExecutor);
    }
}
