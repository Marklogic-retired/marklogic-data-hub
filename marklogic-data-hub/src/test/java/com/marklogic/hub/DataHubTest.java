/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

import com.marklogic.mgmt.admin.AdminManager;
import org.custommonkey.xmlunit.XMLUnit;
import org.easymock.EasyMockRule;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.springframework.web.client.ResourceAccessException;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;

public class DataHubTest extends HubTestBase {
    @Rule
    public EasyMockRule mocks = new EasyMockRule(this);

    @Mock
    private AdminManager am;

    @TestSubject
    private DataHub dh = new DataHub(getHubConfig());

    @BeforeClass
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
    }

    @Before
    public void beforeTests() {
        dh.setAdminManager(am);
    }

    @Test(expected = ServerValidationException.class)
    public void testValidateServerPriorTo8withDot() throws ServerValidationException {
        expect(am.getServerVersion()).andStubReturn("7.0-6.6");
        replay(am);
        dh.validateServer();
    }

    @Test(expected = ServerValidationException.class)
    public void testValidateServerPriorTo8sansDot() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("7.0");
        replay(am);
        dh.validateServer();
    }

    @Test(expected = ServerValidationException.class)
    public void testValidateServerPriorTo804() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("8.0-3.4");
        replay(am);
        dh.validateServer();
    }

    @Test
    public void testValidateServer804() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("8.0-4");
        replay(am);
        dh.validateServer();
    }

    @Test
    public void testValidateServerBeyond804() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("8.0-5");
        replay(am);
        dh.validateServer();
    }

    @Test
    public void testValidateServerBeyond804WithDot() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("8.0-5.2");
        replay(am);
        dh.validateServer();
    }

    @Test
    public void testValidateServe8nightly() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("8.0-20160719");
        replay(am);
        dh.validateServer();
    }

    @Test
    public void testValidateServer9nightly() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("9.0-20160719");
        replay(am);
        dh.validateServer();
    }

    @Test
    public void testValidateServer9() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("9.0");
        replay(am);
        dh.validateServer();
    }

    @Test
    public void testValidateServerBeyond9() throws ServerValidationException {
        expect(am.getServerVersion()).andReturn("9.0-2");
        replay(am);
        dh.validateServer();
    }

    @Test(expected = ServerValidationException.class)
    public void testValidateInvalidServer() throws ServerValidationException {
        expect(am.getServerVersion()).andThrow(new ResourceAccessException("oops"));
        replay(am);
        dh.validateServer();
    }
}
