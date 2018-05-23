/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.Installer;
import com.marklogic.hub.util.MlcpRunner;
import com.marklogic.hub.validate.EntitiesValidator;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.platform.runner.JUnitPlatform;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompare;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.skyscreamer.jsonassert.JSONCompareResult;
import org.w3c.dom.Document;

import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowBuilder;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.*;

interface CreateFlowListener {
    void onFlowCreated(CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, String srcDir, Path flowDir, boolean useEs);
}

class Tuple<X, Y> {
    public final X x;
    public final Y y;
    public Tuple(X x, Y y) {
        this.x = x;
        this.y = y;
    }
}

class FinalCounts {
    public int stagingCount;
    public int finalCount;
    public int tracingCount;
    public int jobCount;
    public int completedCount;
    public int failedCount;
    public int jobSuccessfulEvents;
    public int jobFailedEvents;
    public int jobSuccessfulBatches;
    public int jobFailedBatches;
    public String jobStatus;
    public String optionsFile = "options-test";

    public FinalCounts(
        int stagingCount, int finalCount, int tracingCount, int jobCount, int completedCount, int failedCount,
        int jobSuccessfulEvents, int jobFailedEvents, int jobSuccessfulBatches, int jobFailedBatches, String jobStatus)
    {
        this.stagingCount = stagingCount;
        this.finalCount = finalCount;
        this.tracingCount = tracingCount;
        this.jobCount = jobCount;
        this.completedCount = completedCount;
        this.failedCount = failedCount;
        this.jobSuccessfulEvents = jobSuccessfulEvents;
        this.jobFailedEvents = jobFailedEvents;
        this.jobSuccessfulBatches = jobSuccessfulBatches;
        this.jobFailedBatches = jobFailedBatches;
        this.jobStatus = jobStatus;
    }
}

@RunWith(JUnitPlatform.class)
public class EndToEndFlowTests extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 500;
    private static final int BATCH_SIZE = 10;
    private FlowManager flowManager;
    private DataMovementManager stagingDataMovementManager;
    private DataMovementManager finalDataMovementManager;

    private boolean installDocsFinished = false;
    private boolean installDocsFailed = false;
    private String installDocError;

    private Scaffolding scaffolding;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().installHubOnce();
    }

    @AfterAll
    public static void teardown() {
        new Installer().uninstallHub();
    }

    private static boolean isSetup = false;
    @BeforeEach
    public void setupEach() {
        if (isSslRun() || isCertAuth()) {
            sslSetup();
        }

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        createProjectDir();

        enableTracing();
        enableDebugging();

        // the following block only needs to be run once, but there's lots of non-static methods
        // in it, hence a boolean static flag.
        if (!isSetup) {
            isSetup = true;
            scaffolding = Scaffolding.create(projectDir.toString(), finalClient);
            scaffolding.createEntity(ENTITY);

            scaffoldFlows("scaffolded");

            createFlows("with-error", (codeFormat, dataFormat, flowType, srcDir, flowDir, useES) -> {
                copyFile(srcDir + "main-" + flowType.toString() + "." + codeFormat.toString(), flowDir.resolve("main." + codeFormat.toString()));
                if (useES) {
                    copyFile(srcDir + "es-content-" + flowType.toString() + "-" + dataFormat.toString() + "." + codeFormat.toString(), flowDir.resolve("content." + codeFormat.toString()));
                    copyFile(srcDir + "es-headers" + "." + codeFormat.toString(), flowDir.resolve("headers." + codeFormat.toString()));
                    copyFile(srcDir + "es-triples" + "." + codeFormat.toString(), flowDir.resolve("triples." + codeFormat.toString()));
                    copyFile(srcDir + "es-writer" + "." + codeFormat.toString(), flowDir.resolve("writer." + codeFormat.toString()));
                }
                copyFile(srcDir + "extra-plugin." + codeFormat.toString(), flowDir.resolve("extra-plugin." + codeFormat.toString()));
            });

            createFlows("extra-plugin", (codeFormat, dataFormat, flowType, srcDir, flowDir, useES) -> {
                copyFile(srcDir + "main-" + flowType.toString() + "." + codeFormat.toString(), flowDir.resolve("main." + codeFormat.toString()));
                copyFile(srcDir + "extra-plugin." + codeFormat.toString(), flowDir.resolve("extra-plugin." + codeFormat.toString()));
            });

            allCombos((codeFormat, dataFormat, flowType, useEs) -> {
                if (codeFormat.equals(CodeFormat.XQUERY)) {
                    createFlow("triples-array", codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs2) -> {
                        copyFile(srcDir + "triples-json-array.xqy", flowDir.resolve("triples.xqy"));
                    });
                }
            });

            allCombos((codeFormat, dataFormat, flowType, useEs) -> {
                createFlow("has a space ", codeFormat, dataFormat, flowType, useEs, null);
            });

            // create some flows in a format that pre-dates the 2.0 flow format with properties files
            allCombos((codeFormat, dataFormat, flowType, useEs) -> {
                createLegacyFlow("legacy", codeFormat, dataFormat, flowType, useEs);
            });

            flowManager = FlowManager.create(getHubConfig());
            List<String> legacyFlows = flowManager.getLegacyFlows();
            assertEquals(8, legacyFlows.size(), String.join("\n", legacyFlows));
            assertEquals(8, flowManager.updateLegacyFlows("2.0.0").size()); // don't change this value
            assertEquals(0, flowManager.getLegacyFlows().size());

            // flows from DHF 1.x
            allCombos((codeFormat, dataFormat, flowType, useEs) -> {
                createLegacyFlow("1x-legacy", codeFormat, dataFormat, flowType, useEs);
            });

            // verify that all of the legacy flows get detected
            // update all of the legacy flows to tne new format
            // verify that the legacy flows were updated. there should be no more legacy flows (0)
            legacyFlows = flowManager.getLegacyFlows();
            assertEquals(8, legacyFlows.size(), String.join("\n", legacyFlows));
            assertEquals(8, flowManager.updateLegacyFlows("1.1.5").size());
            assertEquals(0, flowManager.getLegacyFlows().size());


            // create some flows in a format that pre-dates the 3.0 sjs enhancement
            allCombos((codeFormat, dataFormat, flowType, useEs) -> {
                create2xFlow("2x-before-3x", codeFormat, dataFormat, flowType, useEs);
            });

            // verify that all of the legacy flows get detected
            // update all of the legacy flows to tne new format
            // verify that the legacy flows were updated. there should be no more legacy flows (0)
            legacyFlows = flowManager.getLegacyFlows();
            assertEquals(4, legacyFlows.size(), String.join("\n", legacyFlows));
            assertEquals(4, flowManager.updateLegacyFlows("2.0.0").size());
            assertEquals(0, flowManager.getLegacyFlows().size());

            installUserModules(getHubConfig(), true);

            stagingDataMovementManager = stagingClient.newDataMovementManager();
            finalDataMovementManager = finalClient.newDataMovementManager();
        }
    }


    private JsonNode validateUserModules() {
        EntitiesValidator ev = EntitiesValidator.create(getHubConfig().newStagingManageClient());
        return ev.validateAll();
    }

    @TestFactory
    public List<DynamicTest> generateTests() {
        DataHub dataHub = getDataHub();
        List<DynamicTest> tests = new ArrayList<>();

        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            // we don't need to worry about legacy tests and ES
            // so skip creating them if the flag is on
            if (useEs) {
                return;
            }
            String prefix = "legacy";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
            	if(! isSslRun() && !isCertAuth()) {
            		tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaMlcp(prefix, useEs ? "-es" : "", stagingClient, codeFormat, dataFormat, useEs, options, finalCounts);
                    }));

                    tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(0, 1, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaMlcp(prefix, useEs ? "-es" : "", finalClient, codeFormat, dataFormat, useEs, options, finalCounts);
                    }));
            	}
                tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaREST(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, true, options, finalCounts);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaDMSDK(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, true, options, finalCounts);
                }));
            }
            else {
                Map<String, Object> options = new HashMap<>();
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " wait Reverse Dbs", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE * 2, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE/BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, finalClient, HubConfig.DEFAULT_STAGING_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " no-wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE + 1, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE/BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, false);
                }));
            }
        });


        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "has a space ";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
            	if(!isSslRun() && !isCertAuth()) {
            		tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaMlcp(prefix, useEs ? "-es" : "", stagingClient, codeFormat, dataFormat, useEs, options, finalCounts);
                    }));
            	}
                tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaREST(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, false, options, finalCounts);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaDMSDK(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, false, options, finalCounts);
                }));
            }
            else {
                Map<String, Object> options = new HashMap<>();
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE/BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
            }
        });

        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            // we don't need to worry about legacy tests and ES
            // so skip creating them if the flag is on
            if (useEs) {
                return;
            }
            String prefix = "1x-legacy";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
            	if(! isSslRun() && !isCertAuth()) {
            		tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaMlcp(prefix, useEs ? "-es" : "", stagingClient, codeFormat, dataFormat, useEs, options, finalCounts);
                    }));

                    tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(0, 1, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaMlcp(prefix, useEs ? "-es" : "", finalClient, codeFormat, dataFormat, useEs, options, finalCounts);
                    }));
            	}
                tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaREST(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, true, options, finalCounts);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaDMSDK(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, true, options, finalCounts);
                }));
            }
            else {
                Map<String, Object> options = new HashMap<>();
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " wait Reverse Dbs", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE * 2, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, finalClient, HubConfig.DEFAULT_STAGING_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " no-wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE + 1, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, false);
                }));
            }
        });

        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "extra-plugin";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
              	if(!isSslRun() && !isCertAuth()) {
            			tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                           Map<String, Object> options = new HashMap<>();
                           options.put("extraPlugin", true);
                           FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                           testInputFlowViaMlcp(prefix, useEs ? "-es" : "", stagingClient, codeFormat, dataFormat, useEs, options, finalCounts);
                       }));
                }
                tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("extraPlugin", true);
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaREST(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, false, options, finalCounts);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("extraPlugin", true);
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaDMSDK(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, false, options, finalCounts);
                }));
            }
            else {
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("extraPlugin", true);
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE/BATCH_SIZE, 0, "FINISHED");
                    finalCounts.optionsFile = "options-extra";
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));

                tests.add(DynamicTest.dynamicTest(flowName + " extra error", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("extraPlugin", true);
                    options.put("extraGoBoom", true);
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, (TEST_SIZE - 1) * 2, TEST_SIZE + 1, 1, TEST_SIZE - 1, 1, TEST_SIZE - 1, 1, TEST_SIZE/BATCH_SIZE, 0, "FINISHED_WITH_ERRORS");
                    testHarmonizeFlowWithFailedMain(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts);
                }));
            }
        });

        Path entityDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY);

        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "scaffolded";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
               	if(!isSslRun() && !isCertAuth()) {
                    tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaMlcp(prefix, useEs ? "-es" : "", stagingClient, codeFormat, dataFormat, useEs, options, finalCounts);
                    }));
            	}
                tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaREST(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, true, options, finalCounts);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
                    testInputFlowViaDMSDK(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, true, options, finalCounts);
                }));
            }
            else {
                Map<String, Object> options = new HashMap<>();
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " wait Reverse DBs", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " no-wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
            }
        });

        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "triples-array";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (codeFormat.equals(CodeFormat.XQUERY)) {
                if (flowType.equals(FlowType.INPUT)) {
                	if(!isSslRun() && !isCertAuth()) {
                		tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                            Map<String, Object> options = new HashMap<>();
                            FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                            testInputFlowViaMlcp(prefix, useEs ? "-es" : "", stagingClient, codeFormat, dataFormat, useEs, options, finalCounts);
                        }));
                	}
                    tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaREST(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, false, options, finalCounts);
                    }));
                    tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaDMSDK(prefix, useEs ? "-es" : "", codeFormat, dataFormat, useEs, false, options, finalCounts);
                    }));
                } else {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    tests.add(DynamicTest.dynamicTest(flowName, () -> {
                        testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                    }));
                }
            }
        });

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "with-error";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
                for (String plugin : new String[] { "main", "content", "headers", "triples"}) {
                    Map<String, Object> options = new HashMap<>();
                    options.put(plugin + "GoBoom", true);
                    if(!isSslRun() && !isCertAuth()) {
                        // TODO
                        // THIS code should be turned back on when MLCP 9.0-5 is released.
                        // There is currently a bug in MLCP that doesn't work when an sjs transform
                        // throws an error when only 1 single document is being processed.
//                    tests.add(DynamicTest.dynamicTest(flowName + ": " + plugin + " error MLCP", () -> {
//                        // bug #49274 in mlcp causes 15 retries
//                        // so we get 15 traces
//
//                        FinalCounts finalCounts = new FinalCounts(0, 0, 1, 1, 0, 0, 0, 0, 0, 0, "FAILED");
//                        testInputFlowViaMlcp(prefix, "-2", stagingClient, codeFormat, dataFormat, useEs, options, finalCounts);
//                    }));
                    }

                    tests.add(DynamicTest.dynamicTest(flowName + ": " + plugin + " error REST", () -> {
                        FinalCounts finalCounts = new FinalCounts(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FAILED");
                        testInputFlowViaREST(prefix, "-2", codeFormat, dataFormat, useEs, true, options, finalCounts);
                    }));
                    tests.add(DynamicTest.dynamicTest(flowName + ": " + plugin + " error DMSDK", () -> {
                        FinalCounts finalCounts = new FinalCounts(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FAILED");
                        testInputFlowViaDMSDK(prefix, "-2", codeFormat, dataFormat, useEs, true, options, finalCounts);
                    }));
                }
            }
            else {
                tests.add(DynamicTest.dynamicTest(flowName + ": collector error", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("collectorGoBoom", true);
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, 0, 1, 1, 0, 0, 0, 0, 0, 0, "FAILED");
                    testHarmonizeFlowWithFailedMain(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts);
                }));

                FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE - 1, 1, TEST_SIZE - 1, 1, TEST_SIZE/BATCH_SIZE, 0, "FINISHED_WITH_ERRORS");
                for (String plugin : new String[] { "main", "content", "headers", "triples", "writer"}) {
                    tests.add(DynamicTest.dynamicTest(flowName + ": " + plugin + " error", () -> {
                        Map<String, Object> options = new HashMap<>();
                        options.put(plugin + "GoBoom", true);
                        if (useEs) {
                            finalCounts.finalCount = TEST_SIZE - 1;
                        }
                        else {
                            finalCounts.finalCount = (TEST_SIZE - 1) * 2;
                        }
                        testHarmonizeFlowWithFailedMain(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts);
                    }));
                }
            }
        }));

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "validation-no-errors";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                // clear out the previous flows from above
                FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                createFlow(prefix, codeFormat, dataFormat, flowType, useEs, null);
                dataHub.clearUserModules();
                installUserModules(getHubConfig(), true);

                JsonNode actual = validateUserModules();

                String expected = "{\"errors\":{}}";
                JSONAssert.assertEquals(expected, toJsonString(actual), true);

                Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                FileUtils.deleteDirectory(flowDir.toFile());
            }));
        }));

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "validation-content-errors";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                // clear out the previous flows from above
                FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                createFlow(prefix, codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs1) -> {
                    copyFile(srcDir + "content-syntax-error." + codeFormat1.toString(), flowDir.resolve("content." + codeFormat1.toString()));
                });
                dataHub.clearUserModules();
                installUserModules(getHubConfig(), true);
                JsonNode actual = validateUserModules();

                if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"content\":{\"msg\":\"JS-JAVASCRIPT: =-00=--\\\\8\\\\sthifalkj;; -- Error running JavaScript request: SyntaxError: Unexpected token =\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/content.sjs\",\"line\":18,\"column\":0}}}}}";
                    String actualStr = toJsonString(actual);
                    assertJsonEqual(expected, actualStr, true);
                }
                else {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"content\":{\"msg\":\"XDMP-UNEXPECTED: (err:XPST0003) Unexpected token syntax error, unexpected Function_, expecting $end\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/content.xqy\",\"line\":8,\"column\":0}}}}}";
                    JSONAssert.assertEquals(expected, toJsonString(actual), true);
                }

                Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                FileUtils.deleteDirectory(flowDir.toFile());
            }));
        }));

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "validation-headers-errors";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                // clear out the previous flows from above
                FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                createFlow(prefix, codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs1) -> {
                    copyFile(srcDir + "headers-syntax-error." + codeFormat.toString(), flowDir.resolve("headers." + codeFormat.toString()));
                });
                dataHub.clearUserModules();
                installUserModules(getHubConfig(), true);
                JsonNode actual = validateUserModules();
                if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"headers\":{\"msg\":\"JS-JAVASCRIPT: =-00=--\\\\8\\\\sthifalkj;; -- Error running JavaScript request: SyntaxError: Unexpected token =\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/headers.sjs\",\"line\":16,\"column\":2}}}}}";
                    String actualStr = toJsonString(actual);
                    assertJsonEqual(expected, actualStr, true);
                }
                else {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"headers\":{\"msg\":\"XDMP-UNEXPECTED: (err:XPST0003) Unexpected token syntax error, unexpected Function_, expecting $end\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/headers.xqy\",\"line\":30,\"column\":0}}}}}";
                    JSONAssert.assertEquals(expected, toJsonString(actual), true);
                }

                Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                FileUtils.deleteDirectory(flowDir.toFile());
            }));
        }));

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "validation-triples-errors";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                // clear out the previous flows from above
                FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                createFlow(prefix, codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs1) -> {
                    copyFile(srcDir + "triples-syntax-error." + codeFormat.toString(), flowDir.resolve("triples." + codeFormat.toString()));
                });
                dataHub.clearUserModules();
                installUserModules(getHubConfig(), true);
                JsonNode actual = validateUserModules();
                if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"triples\":{\"msg\":\"JS-JAVASCRIPT: =-00=--\\\\8\\\\sthifalkj;; -- Error running JavaScript request: SyntaxError: Unexpected token =\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/triples.sjs\",\"line\":16,\"column\":2}}}}}";
                    String actualStr = toJsonString(actual);
                    assertJsonEqual(expected, actualStr, true);
                }
                else {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"triples\":{\"msg\":\"XDMP-UNEXPECTED: (err:XPST0003) Unexpected token syntax error, unexpected Function_, expecting $end\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/triples.xqy\",\"line\":36,\"column\":0}}}}}";
                    JSONAssert.assertEquals(expected, toJsonString(actual), true);
                }

                Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                FileUtils.deleteDirectory(flowDir.toFile());
            }));
        }));

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "validation-main-errors";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                // clear out the previous flows from above
                FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                createFlow(prefix, codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs1) -> {
                    copyFile(srcDir + "main-syntax-error." + codeFormat.toString(), flowDir.resolve("main." + codeFormat.toString()));
                });
                dataHub.clearUserModules();
                installUserModules(getHubConfig(), true);
                JsonNode actual = validateUserModules();
                String expected;
                if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                    expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"main\":{\"msg\":\"JS-JAVASCRIPT: =-00=--\\\\8\\\\sthifalkj;; -- Error running JavaScript request: SyntaxError: Unexpected token =\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/main.sjs\",\"line\":43,\"column\":2}}}}}";
                }
                else {
                    expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"main\":{\"msg\":\"XDMP-UNEXPECTED: (err:XPST0003) Unexpected token syntax error, unexpected Function_, expecting $end\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/main.xqy\",\"line\":69,\"column\":0}}}}}";
                }
                JSONAssert.assertEquals(expected, toJsonString(actual), true);

                Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                FileUtils.deleteDirectory(flowDir.toFile());
            }));
        }));


        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            if (flowType.equals(FlowType.HARMONIZE)) {
                String prefix = "validation-collector-errors";
                String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
                tests.add(DynamicTest.dynamicTest(flowName, () -> {
                    // clear out the previous flows from above
                    FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                    FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                    createFlow(prefix, codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs1) -> {
                        copyFile(srcDir + "collector-syntax-error." + codeFormat.toString(), flowDir.resolve("collector." + codeFormat.toString()));
                    });
                    dataHub.clearUserModules();
                    installUserModules(getHubConfig(), true);
                    JsonNode actual = validateUserModules();
                    if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                        String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"collector\":{\"msg\":\"JS-JAVASCRIPT: =-00=--\\\\8\\\\sthifalkj;; -- Error running JavaScript request: SyntaxError: Unexpected token =\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/collector.sjs\",\"line\":13,\"column\":2}}}}}";
                        String actualStr = toJsonString(actual);
                        JSONCompareResult result = JSONCompare.compareJSON(expected, actualStr, JSONCompareMode.STRICT);
                        if (result.failed()) {
                            throw new AssertionError(result.getMessage());
                        }

                    } else {
                        String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"collector\":{\"msg\":\"XDMP-UNEXPECTED: (err:XPST0003) Unexpected token syntax error, unexpected Function_, expecting $end\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/collector.xqy\",\"line\":27,\"column\":0}}}}}";
                        JSONAssert.assertEquals(expected, toJsonString(actual), true);
                    }

                    Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                    FileUtils.deleteDirectory(flowDir.toFile());
                }));
            }
        }));

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            if (flowType.equals(FlowType.HARMONIZE)) {
                String prefix = "validation-writer-errors";
                String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
                tests.add(DynamicTest.dynamicTest(flowName, () -> {
                    // clear out the previous flows from above
                    FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                    FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                    createFlow(prefix, codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs1) -> {
                        copyFile(srcDir + "writer-syntax-error." + codeFormat.toString(), flowDir.resolve("writer." + codeFormat.toString()));
                    });
                    dataHub.clearUserModules();
                    installUserModules(getHubConfig(), true);
                    JsonNode actual = validateUserModules();
                    String expected;
                    if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                        expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"writer\":{\"msg\":\"JS-JAVASCRIPT: =-00=--\\\\8\\\\sthifalkj;; -- Error running JavaScript request: SyntaxError: Unexpected token =\",\"uri\":\"/entities/e2eentity/harmonize/" + flowName + "/writer.sjs\",\"line\":15,\"column\":2}}}}}";
                    } else {
                        expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"writer\":{\"msg\":\"XDMP-UNEXPECTED: (err:XPST0003) Unexpected token syntax error, unexpected Function_, expecting $end\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/writer.xqy\",\"line\":39,\"column\":0}}}}}";
                    }
                    JSONAssert.assertEquals(expected, toJsonString(actual), true);

                    Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                    FileUtils.deleteDirectory(flowDir.toFile());
                }));
            }
        }));


        return tests;
    }

    private String getFlowName(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs) {
        return prefix + "-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString() + (useEs ? "-es" : "" );
    }

    private void createLegacyFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs) {

        if (useEs) {
            return;
        }
        String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
        Path flowDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY).resolve(flowType.toString()).resolve(flowName);

        if (flowType.equals(FlowType.HARMONIZE)) {
            flowDir.resolve("collector").toFile().mkdirs();
            flowDir.resolve("writer").toFile().mkdirs();
        }
        flowDir.resolve("content").toFile().mkdirs();
        flowDir.resolve("headers").toFile().mkdirs();
        flowDir.resolve("triples").toFile().mkdirs();

        String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
        if (flowType.equals(FlowType.HARMONIZE)) {
            copyFile(srcDir + "collector." + codeFormat.toString(), flowDir.resolve("collector/collector." + codeFormat.toString()));
            copyFile(srcDir + "writer-legacy." + codeFormat.toString(), flowDir.resolve("writer/writer." + codeFormat.toString()));
        }

        if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
            copyFile(srcDir + "headers." + codeFormat.toString(), flowDir.resolve("headers/headers." + codeFormat.toString()));
        }
        else {
            copyFile(srcDir + "headers-" + dataFormat.toString() + "." + codeFormat.toString(), flowDir.resolve("headers/headers." + codeFormat.toString()));
        }
        copyFile(srcDir + "content-" + flowType.toString() + "." + codeFormat.toString(), flowDir.resolve("content/content." + codeFormat.toString()));
        copyFile(srcDir + "triples." + codeFormat.toString(), flowDir.resolve("triples/triples." + codeFormat.toString()));

        copyFile("e2e-test/legacy-" + dataFormat.toString() + ".xml", flowDir.resolve("" + flowName + ".xml"));
    }

    private void create2xFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs) {

        if (useEs) {
            return;
        }
        String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
        Path flowDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY).resolve(flowType.toString()).resolve(flowName);

        flowDir.toFile().mkdirs();

        String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
        if (flowType.equals(FlowType.HARMONIZE)) {
            copyFile(srcDir + "collector." + codeFormat.toString(), flowDir.resolve("collector." + codeFormat.toString()));
            copyFile(srcDir + "writer-legacy." + codeFormat.toString(), flowDir.resolve("writer." + codeFormat.toString()));
        }

        if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
            copyFile(srcDir + "headers." + codeFormat.toString(), flowDir.resolve("headers." + codeFormat.toString()));
        }
        else {
            copyFile(srcDir + "headers-" + dataFormat.toString() + "." + codeFormat.toString(), flowDir.resolve("headers." + codeFormat.toString()));
        }
        copyFile(srcDir + "content-" + flowType.toString() + "." + codeFormat.toString(), flowDir.resolve("content." + codeFormat.toString()));
        copyFile(srcDir + "triples." + codeFormat.toString(), flowDir.resolve("triples." + codeFormat.toString()));
        copyFile(srcDir + "main-" + flowType.toString() + "-2x." + codeFormat.toString(), flowDir.resolve("main." + codeFormat.toString()));

        Flow flow = FlowBuilder.newFlow()
            .withEntityName(ENTITY)
            .withName(flowName)
            .withType(flowType)
            .withCodeFormat(codeFormat)
            .withDataFormat(dataFormat)
            .build();

        try {
            FileWriter fw = new FileWriter(flowDir.resolve(flowName + ".properties").toFile());
            flow.toProperties().store(fw, "");
            fw.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void scaffoldFlows(String prefix) {
        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            scaffoldFlow(prefix, codeFormat, dataFormat, flowType, useEs);
        }));
    }

    private void scaffoldFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs) {
        Path entityDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY);
        if (useEs) {
            copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
            installUserModules(getHubConfig(), true);
        }

        String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
        scaffolding.createFlow(ENTITY, flowName, flowType, codeFormat, dataFormat, useEs);

        if (useEs) {
            String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
            Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
            copyFile(srcDir + "es-content-" + flowType.toString() + "-" + dataFormat.toString() + "." + codeFormat.toString(), flowDir.resolve("content." + codeFormat.toString()));
        }
    }

    private void createFlows(String prefix, CreateFlowListener listener) {
        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            createFlow(prefix, codeFormat, dataFormat, flowType, useEs, listener);
        }));
    }

    private void createFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs, CreateFlowListener listener) {
        String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
        Path entityDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY);
        Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);

        if (useEs) {
            copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
            installUserModules(getHubConfig(), true);
        }

        scaffolding.createFlow(ENTITY, flowName, flowType, codeFormat, dataFormat, useEs);

        String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
        if (flowType.equals(FlowType.HARMONIZE)) {
            copyFile(srcDir + "collector." + codeFormat.toString(), flowDir.resolve("collector." + codeFormat.toString()));
            copyFile(srcDir + "writer." + codeFormat.toString(), flowDir.resolve("writer." + codeFormat.toString()));
        }

        if (useEs) {
            copyFile(srcDir + "es-content-" + flowType.toString() + "-" + dataFormat.toString() + "." + codeFormat.toString(), flowDir.resolve("content." + codeFormat.toString()));
        }
        else {
            if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                copyFile(srcDir + "headers." + codeFormat.toString(), flowDir.resolve("headers." + codeFormat.toString()));
            } else {
                copyFile(srcDir + "headers-" + dataFormat.toString() + "." + codeFormat.toString(), flowDir.resolve("headers." + codeFormat.toString()));
            }

            copyFile(srcDir + "content-" + flowType.toString() + "." + codeFormat.toString(), flowDir.resolve("content." + codeFormat.toString()));
            copyFile(srcDir + "triples." + codeFormat.toString(), flowDir.resolve("triples." + codeFormat.toString()));
        }

        if (listener != null) {
            listener.onFlowCreated(codeFormat, dataFormat, flowType, srcDir, flowDir, useEs);
        }
    }

    private void copyFile(String srcDir, Path dstDir) {
        FileUtil.copy(getResourceStream(srcDir), dstDir.toFile());
    }

    private void installDocs(DataFormat dataFormat, String collection, DatabaseClient srcClient, boolean useEs) {
        DataMovementManager mgr = srcClient.newDataMovementManager();

        WriteBatcher writeBatcher = mgr.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4)
            .onBatchSuccess(batch -> installDocsFinished = true)
            .onBatchFailure((batch, failure) -> {
                failure.printStackTrace();
                installDocError = failure.getMessage();
                installDocsFailed = true;
            });

        installDocsFinished = false;
        installDocsFailed = false;
        mgr.startJob(writeBatcher);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add(collection);
        String filename = "staged";
        if (useEs) {
            filename = "input/input-es";
        }
        StringHandle handle = new StringHandle(getResource("e2e-test/" + filename + "." + dataFormat.toString()));
        String dataFormatString = dataFormat.toString();
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + "." + dataFormatString, metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
        assertTrue(installDocsFinished, "Doc install not finished");
        assertFalse(installDocsFailed, "Doc install failed: " + installDocError);

        if (srcClient.getDatabase().equals(HubConfig.DEFAULT_STAGING_NAME)) {
            assertEquals(TEST_SIZE, getStagingDocCount(collection));
            assertEquals(0, getFinalDocCount(collection));
        }
        else {
            assertEquals(TEST_SIZE, getFinalDocCount(collection));
            assertEquals(0, getStagingDocCount(collection));
        }
    }

    private void testInputFlowViaMlcp(String prefix, String fileSuffix, DatabaseClient databaseClient, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs, Map<String, Object> options, FinalCounts finalCounts) throws InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.INPUT, useEs);

        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());
        assertEquals(0, getJobDocCount());

        Flow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);
        String inputPath = getResourceFile("e2e-test/input/input" + fileSuffix + "." + dataFormat.toString()).getAbsolutePath();
        String basePath = getResourceFile("e2e-test/input").getAbsolutePath();
        String OS = System.getProperty("os.name").toLowerCase();
        String optionString;
        JsonNode mlcpOptions;
        try {
        	if (OS.indexOf("win") >= 0) {
        		optionString = toJsonString(options).replace("\"", "\\\\\\\"");
        	}
        	else {
        		optionString = toJsonString(options).replace("\"", "\\\"");
        	}
            String optionsJson =
                "{" +
                    "\"input_file_path\":\"" + inputPath.replace("\\", "\\\\\\\\") + "\"," +
                    "\"input_file_type\":\"\\\"documents\\\"\"," +
                    "\"output_collections\":\"\\\"" + ENTITY + "\\\"\"," +
                    "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                    "\"output_uri_replace\":\"\\\"" + basePath.replace("\\", "/").replaceAll("^([A-Za-z]):", "/$1:") + ",''\\\"\"," +
                    "\"document_type\":\"\\\"" + dataFormat.toString() + "\\\"\",";
            if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                optionsJson +=
                    "\"transform_module\":\"\\\"/MarkLogic/data-hub-framework/transforms/mlcp-flow-transform.sjs\\\"\"," +
                    "\"transform_function\":\"transform\",";
            }
            else {
                optionsJson +=
                    "\"transform_module\":\"\\\"/MarkLogic/data-hub-framework/transforms/mlcp-flow-transform.xqy\\\"\"," +
                    "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\",";
            }
            optionsJson +=
                "\"transform_param\":\"entity-name=" + ENTITY + ",flow-name=" + flowName + ",options=" + optionString + "\"" +
                "}";
            mlcpOptions = new ObjectMapper().readTree(optionsJson);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    MlcpRunner mlcpRunner = new MlcpRunner(null, "com.marklogic.hub.util.MlcpMain", getHubConfig(), flow, databaseClient, mlcpOptions, null);
        mlcpRunner.start();
        try {
            mlcpRunner.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        logger.error(mlcpRunner.getProcessOutput());

        // wait for completion
        Thread.sleep(2000);
        int stagingCount = getStagingDocCount();
        int finalCount = getFinalDocCount();
        int tracingCount = getTracingDocCount();
        int jobsCount = getJobDocCount();

        assertEquals(finalCounts.stagingCount, stagingCount);
        assertEquals(finalCounts.finalCount, finalCount);
        // most currently failing tests are cause of trace.
        assertEquals(finalCounts.tracingCount, tracingCount);
        assertEquals(finalCounts.jobCount, jobsCount);

        if (databaseClient.getDatabase().equals(HubConfig.DEFAULT_STAGING_NAME) && finalCounts.stagingCount == 1) {
            String filename = "final";
            if (useEs && prefix.equals("triples-array")) {
                filename = "input/input-es-trips";
            }
            else if (useEs) {
                filename = "es";
            }
            else if (prefix.equals("scaffolded")) {
                filename = "staged";
            }
            else if (prefix.equals("1x-legacy")) {
                filename = "1x";
            }
            if (dataFormat.equals(DataFormat.JSON)) {
                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
                String actual = stagingDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
                assertJsonEqual(expected, actual, false);
            } else {
                Document expected = getXmlFromResource("e2e-test/" + filename + "." + dataFormat.toString());
                Document actual = stagingDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new DOMHandle()).get();
                assertXMLEqual(expected, actual);
            }
        }
        else if (databaseClient.getDatabase().equals(HubConfig.DEFAULT_FINAL_NAME) && finalCounts.finalCount == 1) {
            String filename = "final";
            if (prefix.equals("scaffolded")) {
                filename = "staged";
            }
            else if (prefix.equals("1x-legacy")) {
                filename = "1x";
            }
            if (dataFormat.equals(DataFormat.JSON)) {
                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
                String actual = finalDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
                assertJsonEqual(expected, actual, false);
            } else {
                Document expected = getXmlFromResource("e2e-test/" + filename + "." + dataFormat.toString());
                Document actual = finalDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new DOMHandle()).get();
                assertXMLEqual(expected, actual);
            }
        }

        // inspect the job json
        JsonNode node = jobDocMgr.read("/jobs/" + mlcpRunner.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        assertEquals(mlcpRunner.getJobId(), node.get("jobId").asText());
        assertEquals(finalCounts.jobSuccessfulEvents, node.get("successfulEvents").asInt());
        assertEquals(finalCounts.jobFailedEvents, node.get("failedEvents").asInt());
        assertEquals(finalCounts.jobSuccessfulBatches, node.get("successfulBatches").asInt());
        assertEquals(finalCounts.jobFailedBatches, node.get("failedBatches").asInt());
        assertEquals(finalCounts.jobStatus, node.get("status").asText());
    }

    private void testInputFlowViaREST(String prefix, String fileSuffix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs, boolean passJobId, Map<String, Object> options, FinalCounts finalCounts) {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.INPUT, useEs);

        int stagingCount = getStagingDocCount();
        int finalCount = getFinalDocCount();
        int tracingCount = getTracingDocCount();
        int jobsCount = getJobDocCount();

        assertEquals(0, stagingCount);
        assertEquals(0, finalCount);
        assertEquals(0, tracingCount);
        assertEquals(0, jobsCount);

        String transform = codeFormat.equals(CodeFormat.JAVASCRIPT) ? "ml:sjsInputFlow" : "ml:inputFlow";
        ServerTransform serverTransform = new ServerTransform(transform);
        if (passJobId) {
            serverTransform.addParameter("job-id", UUID.randomUUID().toString());
        }
        serverTransform.addParameter("entity-name", ENTITY);
        serverTransform.addParameter("flow-name", flowName);
        String optionString = toJsonString(options);
        serverTransform.addParameter("options", optionString);
        FileHandle handle = new FileHandle(getResourceFile("e2e-test/input/input" + fileSuffix + "." + dataFormat.toString()));
        Format format = null;
        switch (dataFormat) {
            case XML:
                format = Format.XML;
                break;

            case JSON:
                format = Format.JSON;
                break;
        }
        handle.setFormat(format);

        try {
            stagingDocMgr.write("/input" + fileSuffix + "." + dataFormat.toString(), handle, serverTransform);
            if (finalCounts.stagingCount == 0) {
                fail("Should have thrown an exception.");
            }
        }
        catch(FailedRequestException e) {

        }

        stagingCount = getStagingDocCount();
        finalCount = getFinalDocCount();
        tracingCount = getTracingDocCount();
        jobsCount = getJobDocCount();

        assertEquals(finalCounts.stagingCount, stagingCount);
        assertEquals(finalCounts.finalCount, finalCount);
        assertEquals(finalCounts.tracingCount, tracingCount);
        assertEquals(finalCounts.jobCount, jobsCount);

        if (finalCounts.stagingCount == 1) {
            String filename = "final";
            if (useEs && prefix.equals("triples-array")) {
                filename = "input/input-es-trips";
            }
            else if (useEs) {
                filename = "es";
            }
            else if (prefix.equals("scaffolded")) {
                filename = "staged";
            }
            else if (prefix.equals("1x-legacy")) {
                filename = "1x";
            }
            if (dataFormat.equals(DataFormat.JSON)) {
                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
                String actual = stagingDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
                assertJsonEqual(expected, actual, false);
            } else {
                Document expected = getXmlFromResource("e2e-test/" + filename + "." + dataFormat.toString());
                Document actual = stagingDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new DOMHandle()).get();
                assertXMLEqual(expected, actual);
            }
        }
    }

    private void testInputFlowViaDMSDK(String prefix, String fileSuffix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs, boolean passJobId, Map<String, Object> options, FinalCounts finalCounts) {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.INPUT, useEs);
        int stagingCount = getStagingDocCount();
        int finalCount = getFinalDocCount();
        int tracingCount = getTracingDocCount();
        int jobsCount = getJobDocCount();

        assertEquals(0, stagingCount);
        assertEquals(0, finalCount);
        assertEquals(0, tracingCount);
        assertEquals(0, jobsCount);

        String transform = codeFormat.equals(CodeFormat.JAVASCRIPT) ? "ml:sjsInputFlow" : "ml:inputFlow";
		ServerTransform serverTransform = new ServerTransform(transform);
        if (passJobId) {
            serverTransform.addParameter("job-id", UUID.randomUUID().toString());
        }
        serverTransform.addParameter("entity-name", ENTITY);
        serverTransform.addParameter("flow-name", flowName);
        String optionString = toJsonString(options);
        serverTransform.addParameter("options", optionString);
        FileHandle handle = new FileHandle(getResourceFile("e2e-test/input/input" + fileSuffix + "." + dataFormat.toString()));
        Format format = null;
        switch (dataFormat) {
            case XML:
                format = Format.XML;
                break;

            case JSON:
                format = Format.JSON;
                break;
        }
        handle.setFormat(format);

        WriteBatcher batcher = stagingDataMovementManager.newWriteBatcher();
        batcher.withBatchSize(1).withTransform(serverTransform);
        batcher.onBatchSuccess(batch -> {
		}).onBatchFailure((batch, throwable) -> {
			throwable.printStackTrace();
		});
        stagingDataMovementManager.startJob(batcher);
        batcher.add("/input" + fileSuffix + "." + dataFormat.toString(), handle);
        batcher.flushAndWait();

        stagingCount = getStagingDocCount();
        finalCount = getFinalDocCount();
        tracingCount = getTracingDocCount();
        jobsCount = getJobDocCount();

        assertEquals(finalCounts.stagingCount, stagingCount);
        assertEquals(finalCounts.finalCount, finalCount);
        assertEquals(finalCounts.tracingCount, tracingCount);
        assertEquals(finalCounts.jobCount, jobsCount);

        if (finalCounts.stagingCount == 1) {
            String filename = "final";
            if (useEs && prefix.equals("triples-array")) {
                filename = "input/input-es-trips";
            }
            else if (useEs) {
                filename = "es";
            }
            else if (prefix.equals("scaffolded")) {
                filename = "staged";
            }
            else if (prefix.equals("1x-legacy")) {
                filename = "1x";
            }
            if (dataFormat.equals(DataFormat.JSON)) {
                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
                String actual = stagingDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
                assertJsonEqual(expected, actual, false);
            } else {
                Document expected = getXmlFromResource("e2e-test/" + filename + "." + dataFormat.toString());
                Document actual = stagingDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new DOMHandle()).get();
                assertXMLEqual(expected, actual);
            }
        }
    }

    private Tuple<FlowRunner, JobTicket> runHarmonizeFlow(
        String flowName, DataFormat dataFormat,
        Vector<String> completed, Vector<String> failed,
        Map<String, Object> options,
        DatabaseClient srcClient, String destDb,
        boolean useEs, boolean waitForCompletion)
    {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());
        assertEquals(0, getJobDocCount());

        installDocs(dataFormat, ENTITY, srcClient, useEs);

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .withOptions(options)
            .withSourceClient(srcClient)
            .withDestinationDatabase(destDb)
            .onItemComplete((String jobId, String itemId) -> {
               completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
               failed.add(itemId);
            });

        JobTicket jobTicket = flowRunner.run();
        if (waitForCompletion) {
            flowRunner.awaitCompletion();
        }
        else {
            try {
                flowRunner.awaitCompletion(2, TimeUnit.MILLISECONDS);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        return new Tuple<>(flowRunner, jobTicket);
    }

    private void testHarmonizeFlow(
        String prefix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs,
        Map<String, Object> options, DatabaseClient srcClient, String destDb,
        FinalCounts finalCounts, boolean waitForCompletion) throws InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.HARMONIZE, useEs);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Tuple<FlowRunner, JobTicket> tuple = runHarmonizeFlow(flowName, dataFormat, completed, failed, options, srcClient, destDb, useEs, waitForCompletion);

        if (waitForCompletion) {
            // takes a little time to run.
            Thread.sleep(2000);
            int stagingCount = getStagingDocCount();
            int finalCount = getFinalDocCount();
            int tracingCount = getTracingDocCount();
            int jobsCount = getJobDocCount();

            assertEquals(finalCounts.stagingCount, stagingCount);
            assertEquals(finalCounts.finalCount, finalCount);
            assertEquals(finalCounts.tracingCount, tracingCount);
            assertEquals(finalCounts.jobCount, jobsCount);

            assertEquals(finalCounts.completedCount, completed.size());
            assertEquals(finalCounts.failedCount, failed.size());

            GenericDocumentManager mgr = finalDocMgr;
            if (destDb.equals(HubConfig.DEFAULT_STAGING_NAME)) {
                mgr = stagingDocMgr;
            }

            String filename = "final";
            if (useEs && prefix.equals("triples-array")) {
                filename = "input/input-es-trips";
            }

            else if (useEs == true && !prefix.equals("legacy")) {
                filename = "es";
            }
            else if (prefix.equals("scaffolded")) {
                filename = "staged";
            }
            else if (prefix.equals("1x-legacy")) {
                filename = "1x";
            }
            if (dataFormat.equals(DataFormat.XML)) {
                Document expected = getXmlFromResource("e2e-test/" + filename + ".xml");
                for (int i = 0; i < TEST_SIZE; i+=10) {
                    Document actual = mgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
                    assertXMLEqual(expected, actual);
                }
            } else {
                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
                for (int i = 0; i < TEST_SIZE; i+=10) {
                    String actual = mgr.read("/input-" + i + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
                    assertJsonEqual(expected, actual, false);
                }
            }

            // inspect the job json
            JsonNode node = jobDocMgr.read("/jobs/" + tuple.y.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
            assertEquals(tuple.y.getJobId(), node.get("jobId").asText());
            assertEquals(finalCounts.jobSuccessfulEvents, node.get("successfulEvents").asInt());
            assertEquals(finalCounts.jobFailedEvents, node.get("failedEvents").asInt());
            assertEquals(finalCounts.jobSuccessfulBatches, node.get("successfulBatches").asInt());
            assertEquals(finalCounts.jobFailedBatches, node.get("failedBatches").asInt());
            assertEquals(finalCounts.jobStatus, node.get("status").asText());

            if (!prefix.equals("scaffolded") && !useEs) {
                if (codeFormat.equals(CodeFormat.XQUERY)) {
                    Document optionsActual = mgr.read("/options-test-1.xml").next().getContent(new DOMHandle()).get();
                    Document optionsExpected = getXmlFromResource("e2e-test/" + finalCounts.optionsFile + ".xml");
                    assertXMLEqual(optionsExpected, optionsActual);
                } else {
                    String optionsExpected = getResource("e2e-test/" + finalCounts.optionsFile + ".json");
                    String optionsActual = mgr.read("/options-test-1.json").next().getContent(new StringHandle()).get();
                    assertJsonEqual(optionsExpected, optionsActual, false);
                }
            }
        }
        else {
            assertNotEquals(TEST_SIZE, getFinalDocCount());
            tuple.x.awaitCompletion();
        }
    }

    private void testHarmonizeFlowWithFailedMain(
        String prefix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs,
        Map<String, Object> options, DatabaseClient srcClient, String destDb,
        FinalCounts finalCounts)
    {
        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.HARMONIZE, useEs);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Tuple<FlowRunner, JobTicket> tuple = runHarmonizeFlow(flowName, dataFormat, completed, failed, options, srcClient, destDb, useEs, true);

        int stagingCount = getStagingDocCount();
        int finalCount = getFinalDocCount();
        int tracingCount = getTracingDocCount();
        int jobsCount = getJobDocCount();

        assertEquals(finalCounts.stagingCount, stagingCount);
        assertEquals(finalCounts.finalCount, finalCount);
        assertEquals(finalCounts.tracingCount, tracingCount);
        assertEquals(finalCounts.jobCount, jobsCount);

        assertEquals(finalCounts.completedCount, completed.size());
        assertEquals(finalCounts.failedCount, failed.size());

        // inspect the job json
        JsonNode node = jobDocMgr.read("/jobs/" + tuple.y.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        assertEquals(tuple.y.getJobId(), node.get("jobId").asText());
        assertEquals(finalCounts.jobSuccessfulEvents, node.get("successfulEvents").asInt());
        assertEquals(finalCounts.jobFailedEvents, node.get("failedEvents").asInt());
        assertEquals(finalCounts.jobSuccessfulBatches, node.get("successfulBatches").asInt());
        assertEquals(finalCounts.jobFailedBatches, node.get("failedBatches").asInt());
        assertEquals(finalCounts.jobStatus, node.get("status").asText());
   }
}
