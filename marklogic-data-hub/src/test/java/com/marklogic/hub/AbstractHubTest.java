package com.marklogic.hub;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Adding this so that a class can subclass HubTestBase without having to define the same two Spring annotations
 * over and over. Plan is to move a lot of classes to under this so they don't duplicate the annotations.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public abstract class AbstractHubTest extends HubTestBase {

}
