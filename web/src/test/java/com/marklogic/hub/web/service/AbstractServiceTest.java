package com.marklogic.hub.web.service;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.web.WebApplication;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

@ContextConfiguration(classes = {WebApplication.class})
@WebAppConfiguration
public class AbstractServiceTest extends AbstractHubCoreTest {

}
