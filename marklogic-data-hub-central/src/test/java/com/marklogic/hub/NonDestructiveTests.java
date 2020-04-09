package com.marklogic.hub;

import org.junit.platform.runner.JUnitPlatform;
import org.junit.platform.suite.api.ExcludeTags;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.runner.RunWith;

/**
 * Run this test suite when e.g. testing in an IDE, where you don't want to run any tests that are destructive to your
 * test environment, which would require you to reinstall the test DH instance.
 */
@RunWith(JUnitPlatform.class)
@SelectPackages({"com.marklogic.hub.curation.controllers", "com.marklogic.hub.central"})
@ExcludeTags("Destructive")
public class NonDestructiveTests {
}
