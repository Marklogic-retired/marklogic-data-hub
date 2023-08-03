package com.marklogic.hub.central.controllers;

import com.marklogic.hub.central.CloudParameters;
import com.marklogic.hub.central.HttpSessionHubClientProvider;
import com.marklogic.hub.central.HubCentral;
import com.marklogic.hub.impl.HubConfigImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class SinglePageAppController extends BaseController implements ErrorController {

    @Autowired
    HubCentral hubCentral;

    @Autowired
    HttpSessionHubClientProvider hubClientProvider;

    @Autowired
    Environment environment;


    /**
     * Used when running HC as an executable war file; not used when running it locally for development purposes, as the
     * local Node server handles this route instead.
     *
     * @return
     */
    @RequestMapping(value = {"/"})
    public String index(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
        if(environment.getProperty("mlAuthentication").equalsIgnoreCase("cloud")) {
            Map<String, String> headers = Collections.list(httpServletRequest.getHeaderNames()).stream()
                .collect(Collectors.toMap(h -> h, httpServletRequest::getHeader));
            CloudParameters.updateCloudParameters(headers);
            createHubConfigurations(headers.getOrDefault("mlCloudApiKey".toLowerCase(), ""));
            addCookiesToResponse(httpServletResponse);
        }
        return "forward:index.html";
    }

    private void createHubConfigurations(String cloudApikey) {
        HubConfigImpl hubClientConfig = hubCentral.newHubConfig(cloudApikey);
        hubClientProvider.setHubClientConfig(hubClientConfig);
        hubClientProvider.setHubClientDelegate(hubClientConfig.newHubClient());
    }

    private void addCookiesToResponse(HttpServletResponse response) {
        response.addCookie(new Cookie("mlHcBasePath", CloudParameters.HC_BASE_PATH));
        response.addCookie(new Cookie("mlAuthentication", CloudParameters.AUTHENTICATION_TYPE));
    }
}
