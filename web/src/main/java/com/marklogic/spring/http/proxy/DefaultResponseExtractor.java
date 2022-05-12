package com.marklogic.spring.http.proxy;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.client.ResponseExtractor;

/**
 * Default implementation that writes the body of the client response to the servlet response and also copies certain
 * headers over.
 */
public class DefaultResponseExtractor implements ResponseExtractor<Void> {

    protected Logger logger = LoggerFactory.getLogger(getClass());

    private HttpServletResponse httpResponse;
    private String[] headerNamesToCopy;

    public DefaultResponseExtractor(HttpServletResponse httpResponse, String... headerNamesToCopy) {
        this.httpResponse = httpResponse;
        this.headerNamesToCopy = headerNamesToCopy;
    }

    @Override
    public Void extractData(ClientHttpResponse response) throws IOException {
        copyHeaders(httpResponse, response);
        InputStream body = response.getBody();
        if (body != null) {
            if (logger.isDebugEnabled()) {
                logger.debug("Copying the client HTTP response body to the servlet HTTP response");
            }
            FileCopyUtils.copy(response.getBody(), httpResponse.getOutputStream());
        } else if (logger.isDebugEnabled()) {
            logger.debug("No body in the client HTTP response, so not copying anything to the servlet HTTP response");
        }

        httpResponse.setStatus(response.getRawStatusCode());

        return null;
    }

    protected void copyHeaders(HttpServletResponse httpResponse, ClientHttpResponse response) {
        if (headerNamesToCopy != null) {
            for (String name : headerNamesToCopy) {
                List<String> values = response.getHeaders().get(name);
                if (values != null) {
                    if (logger.isDebugEnabled()) {
                        logger.debug(String.format("Setting servlet HTTP header '%s' to '%s'", name, values));
                    }
                    for (String value : values) {
                        httpResponse.addHeader(name, value);
                    }
                }
            }
        }
    }

}
