/*
 * Copyright (c) 2020 MarkLogic Corporation
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
package com.marklogic.hub_integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.*;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.legacy.validate.EntitiesValidator;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.MlcpRunner;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompare;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.skyscreamer.jsonassert.JSONCompareResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.w3c.dom.Document;

import javax.xml.transform.TransformerException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
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

// TestFactory doesn't play nice with support for parallel tests yet, so forcing same thread execution
@Execution(ExecutionMode.SAME_THREAD)
public class EndToEndFlowTests extends AbstractHubCoreTest {

    private static final String ENTITY = "e2eentity";
    private static final int TEST_SIZE = 500;
    private static final int BATCH_SIZE = 10;

    @Autowired
    LegacyFlowManager flowManager;
    DataMovementManager flowRunnerDataMovementManager;

    private boolean installDocsFinished = false;
    private boolean installDocsFailed = false;
    private String installDocError;

    @Autowired
    Scaffolding scaffolding;

    private EntitiesValidator ev = null;
    private DatabaseClient flowRunnerClient;

    @BeforeEach
    public void setupEach() {
        runAsFlowDeveloper();
        enableTracing();
        enableDebugging();

        runAsFlowOperator();
        flowRunnerClient = getHubClient().getStagingClient();

        runAsDataHubDeveloper();
        flowRunnerDataMovementManager = flowRunnerClient.newDataMovementManager();

        scaffolding.createEntity(ENTITY);

        installUserModules(runAsFlowDeveloper(), true);
    }

    private JsonNode validateUserModules() {
        if (ev == null) {
            ev = EntitiesValidator.create(getHubClient().getStagingClient());
        }
        return ev.validateAll();
    }


    @TestFactory
    public List<DynamicTest> generateHasASpaceTests() {
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
           createFlow("has a space ", codeFormat, dataFormat, flowType, useEs, null);
        });
        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "has a space ";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
            	tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                    testInputFlowViaMlcp(prefix, useEs ? "-es" : "", flowRunnerClient, codeFormat, dataFormat, useEs, options, finalCounts);
                }));
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
            } else {
                Map<String, Object> options = new HashMap<>();
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
            }
        });
        return tests;
    }

    @TestFactory
    public List<DynamicTest> generateExtraPluginTests() {
        createFlows("extra-plugin", (codeFormat, dataFormat, flowType, srcDir, flowDir, useES) -> {
            copyFile(srcDir + "main-" + flowType.toString() + "." + codeFormat.toString(), flowDir.resolve("main." + codeFormat.toString()));
            copyFile(srcDir + "extra-plugin." + codeFormat.toString(), flowDir.resolve("extra-plugin." + codeFormat.toString()));
        });

        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "extra-plugin";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
            	tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("extraPlugin", true);
                    options.put("secondOption", "secondValue");
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                    testInputFlowViaMlcp(prefix, useEs ? "-es" : "", flowRunnerClient, codeFormat, dataFormat, useEs, options, finalCounts);
                }));
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
            } else {
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("extraPlugin", true);
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    finalCounts.optionsFile = "options-extra";
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));

                tests.add(DynamicTest.dynamicTest(flowName + " extra error", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("extraPlugin", true);
                    options.put("extraGoBoom", true);
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, (TEST_SIZE - 1) * 2, TEST_SIZE + 1, 1, TEST_SIZE - 1, 1, TEST_SIZE - 1, 1, TEST_SIZE / BATCH_SIZE, 0, "FINISHED_WITH_ERRORS");
                    testHarmonizeFlowWithFailedMain(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts);
                }));
            }
        });
        return tests;
    }

    @TestFactory
    public List<DynamicTest> generateScaffoldedTests() {
        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            scaffoldFlow("scaffolded", codeFormat, dataFormat, flowType, useEs);
        }));

        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "scaffolded";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
            	tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                    Map<String, Object> options = new HashMap<>();
                    FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                    testInputFlowViaMlcp(prefix, useEs ? "-es" : "", flowRunnerClient, codeFormat, dataFormat, useEs, options, finalCounts);
                }));
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
            } else {
                Map<String, Object> options = new HashMap<>();
                tests.add(DynamicTest.dynamicTest(flowName + " wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " wait Reverse DBs", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));
                tests.add(DynamicTest.dynamicTest(flowName + " no-wait", () -> {
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE / BATCH_SIZE, 0, "FINISHED");
                    testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                }));

                // test big size to expose timing issues
                // we only need 1 test to expose tbe bug
                // https://github.com/marklogic/marklogic-data-hub/issues/1259
                if (codeFormat.equals(CodeFormat.XQUERY) && dataFormat.equals(DataFormat.XML) && useEs == false) {
                    int testSize = 50000;
                    tests.add(DynamicTest.dynamicTest("Big Count: " + flowName + " wait", () -> {
                        FinalCounts finalCounts = new FinalCounts(testSize, testSize, testSize + 1, 1, testSize, 0, testSize, 0, testSize / BATCH_SIZE, 0, "FINISHED");
                        testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, getHubClient().getStagingClient(), HubConfig.DEFAULT_FINAL_NAME, finalCounts, true, testSize);
                    }));
                }
            }
        });
        return tests;
    }

    @TestFactory
    public List<DynamicTest> generateTriplesArrayTests() {
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            if (codeFormat.equals(CodeFormat.XQUERY)) {
                createFlow("triples-array", codeFormat, dataFormat, flowType, useEs, (codeFormat1, dataFormat1, flowType1, srcDir, flowDir, useEs2) -> {
                    copyFile(srcDir + "triples-json-array.xqy", flowDir.resolve("triples.xqy"));
                });
            }
        });
        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "triples-array";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (codeFormat.equals(CodeFormat.XQUERY)) {
                if (flowType.equals(FlowType.INPUT)) {
                   tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
                        Map<String, Object> options = new HashMap<>();
                        FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
                        testInputFlowViaMlcp(prefix, useEs ? "-es" : "", flowRunnerClient, codeFormat, dataFormat, useEs, options, finalCounts);
                    }));
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
                        testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true);
                    }));
                }
            }
        });
        return tests;
    }

    @TestFactory
    public List<DynamicTest> generateWithErrorTests() {
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
        List<DynamicTest> tests = new ArrayList<>();
        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "with-error";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT)) {
                for (String plugin : new String[]{"main", "content", "headers", "triples"}) {
                    Map<String, Object> options = new HashMap<>();
                    options.put(plugin + "GoBoom", true);

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
                    tests.add(DynamicTest.dynamicTest(flowName + ": " + plugin + " error REST", () -> {
                        FinalCounts finalCounts = new FinalCounts(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FAILED");
                        testInputFlowViaREST(prefix, "-2", codeFormat, dataFormat, useEs, true, options, finalCounts);
                    }));
                    tests.add(DynamicTest.dynamicTest(flowName + ": " + plugin + " error DMSDK", () -> {
                        FinalCounts finalCounts = new FinalCounts(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FAILED");
                        testInputFlowViaDMSDK(prefix, "-2", codeFormat, dataFormat, useEs, true, options, finalCounts);
                    }));
                }
            } else {
                tests.add(DynamicTest.dynamicTest(flowName + ": collector error", () -> {
                    Map<String, Object> options = new HashMap<>();
                    options.put("collectorGoBoom", true);
                    FinalCounts finalCounts = new FinalCounts(TEST_SIZE, 0, 1, 1, 0, 0, 0, 0, 0, 0, "FAILED");
                    testHarmonizeFlowWithFailedMain(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts);
                }));

                FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE, TEST_SIZE + 1, 1, TEST_SIZE - 1, 1, TEST_SIZE - 1, 1, TEST_SIZE / BATCH_SIZE, 0, "FINISHED_WITH_ERRORS");
                for (String plugin : new String[]{"main", "content", "headers", "triples", "writer"}) {
                    tests.add(DynamicTest.dynamicTest(flowName + ": " + plugin + " error", () -> {
                        Map<String, Object> options = new HashMap<>();
                        options.put(plugin + "GoBoom", true);
                        if (useEs) {
                            finalCounts.finalCount = TEST_SIZE - 1;
                        } else {
                            finalCounts.finalCount = (TEST_SIZE - 1) * 2;
                        }
                        testHarmonizeFlowWithFailedMain(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts);
                    }));
                }
            }
        }));
        return tests;
    }

    @TestFactory
    public List<DynamicTest> generateValidationTests() {
        List<DynamicTest> tests = new ArrayList<>();
        Path entityDir = getHubProject().getHubPluginsDir().resolve("entities").resolve(ENTITY);

        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "validation-no-errors";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                // clear out the previous flows from above
                FileUtils.deleteDirectory(entityDir.resolve("input").toFile());
                FileUtils.deleteDirectory(entityDir.resolve("harmonize").toFile());

                createFlow(prefix, codeFormat, dataFormat, flowType, useEs, null);
                clearUserModules();
                installUserModules(runAsFlowDeveloper(), true);

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
                clearUserModules();
                installUserModules(runAsFlowDeveloper(), true);
                JsonNode actual = validateUserModules();

                if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"content\":{\"msg\":\"JS-JAVASCRIPT: =-00=--\\\\8\\\\sthifalkj;; -- Error running JavaScript request: SyntaxError: Unexpected token =\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/content.sjs\",\"line\":18,\"column\":0}}}}}";
                    String actualStr = toJsonString(actual);
                    assertJsonEqual(expected, actualStr, true);
                } else {
                    String expected = "{\"errors\":{\"e2eentity\":{\"" + flowName + "\":{\"content\":{\"msg\":\"XDMP-UNEXPECTED: (err:XPST0003) Unexpected token syntax error, unexpected Function_, expecting $end\",\"uri\":\"/entities/e2eentity/" + flowType.toString() + "/" + flowName + "/content.xqy\",\"line\":8,\"column\":0}}}}}";
                    JSONAssert.assertEquals(expected, toJsonString(actual), true);
                }

                Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
                FileUtils.deleteDirectory(flowDir.toFile());
            }));
        }));
        return tests;
    }


    @TestFactory
    public List<DynamicTest> generateValidationHeadersErrorsTests() {
        List<DynamicTest> tests = new ArrayList<>();
        Path entityDir = getHubProject().getHubPluginsDir().resolve("entities").resolve(ENTITY);

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
                clearUserModules();
                installUserModules(runAsFlowDeveloper(), true);
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
                clearUserModules();
                installUserModules(runAsFlowDeveloper(), true);
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
                clearUserModules();
                installUserModules(runAsFlowDeveloper(), true);
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
                    clearUserModules();
                    installUserModules(runAsFlowDeveloper(), true);
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
                    clearUserModules();
                    installUserModules(runAsFlowDeveloper(), true);
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

    //The XML file in the following input flows have comments, processing instruction nodes in addition to root node.
    // DHFPROD-767 (Github #882)
    @TestFactory
    public List<DynamicTest> generateExtranodesTests() {
        createFlow("extra-nodes", CodeFormat.XQUERY, DataFormat.XML, FlowType.INPUT, false, (CreateFlowListener)null);
        createFlow("extra-nodes", CodeFormat.JAVASCRIPT, DataFormat.XML, FlowType.INPUT, false, (CreateFlowListener)null);
        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "extra-nodes";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT) && !useEs && dataFormat.equals(DataFormat.XML)) {
                // Currently there are differences between MLCP/ML versions
                /*
	            tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
	                Map<String, Object> options = new HashMap<>();
	                FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
	                testInputFlowViaMlcp(prefix, "-extra-nodes", flowRunnerClient, codeFormat, DataFormat.XML, false, options, finalCounts);
	            }));
                 */
	            tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
	                Map<String, Object> options = new HashMap<>();
	                FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
	                testInputFlowViaREST(prefix, "-extra-nodes", codeFormat, DataFormat.XML, false, false, options, finalCounts);
	            }));
	            tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
	                Map<String, Object> options = new HashMap<>();
	                FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
	                testInputFlowViaDMSDK(prefix, "-extra-nodes", codeFormat, DataFormat.XML, false, false, options, finalCounts);
	            }));
            }
        });
        return tests;
    }

    @TestFactory
    public List<DynamicTest> generateDefaultPluginsTests() {
        createFlow("default-plugins", CodeFormat.JAVASCRIPT, DataFormat.XML, FlowType.INPUT, true, (CreateFlowListener)null);
        createFlow("default-plugins", CodeFormat.XQUERY, DataFormat.JSON, FlowType.INPUT, true, (CreateFlowListener)null);
        createFlow("default-plugins", CodeFormat.XQUERY, DataFormat.XML, FlowType.INPUT, true, (CreateFlowListener)null);
        createFlow("default-plugins", CodeFormat.JAVASCRIPT, DataFormat.JSON, FlowType.INPUT, true, (CreateFlowListener)null);
        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "default-plugins";
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
            if (flowType.equals(FlowType.INPUT) && useEs ) {
	            tests.add(DynamicTest.dynamicTest(flowName + " MLCP", () -> {
	                Map<String, Object> options = new HashMap<>();
	                FinalCounts finalCounts = new FinalCounts(1, 0, 1, 1, 0, 0, 1, 0, 0, 0, "FINISHED");
	                testInputFlowViaMlcp(prefix, "-es", flowRunnerClient, codeFormat, dataFormat, true, options, finalCounts);
	            }));
	            tests.add(DynamicTest.dynamicTest(flowName + " REST", () -> {
	                Map<String, Object> options = new HashMap<>();
	                FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
	                testInputFlowViaREST(prefix, "-es", codeFormat, dataFormat, true, false, options, finalCounts);
	            }));
	            tests.add(DynamicTest.dynamicTest(flowName + " DMSDK", () -> {
	                Map<String, Object> options = new HashMap<>();
	                FinalCounts finalCounts = new FinalCounts(1, 0, 1, 0, 0, 0, 0, 0, 0, 0, "FINISHED");
	                testInputFlowViaDMSDK(prefix, "-es", codeFormat, dataFormat, true, false, options, finalCounts);
	            }));
            }
        });
        return tests;
    }

    private String getFlowName(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs) {
        return prefix + "-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString() + (useEs ? "-es" : "" );
    }

    private void scaffoldFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs) {
        Path entityDir = getHubProject().getHubPluginsDir().resolve("entities").resolve(ENTITY);
        if (useEs) {
            copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
        }

        String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
        scaffolding.createLegacyFlow(ENTITY, flowName, flowType, codeFormat, dataFormat, useEs);

        if (useEs) {
            String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
            Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);
            copyFile(srcDir + "es-content-" + flowType.toString() + "-" + dataFormat.toString() + "." + codeFormat.toString(), flowDir.resolve("content." + codeFormat.toString()));
        }
        installUserModules(runAsFlowDeveloper(), true);
    }

    private void createFlows(String prefix, CreateFlowListener listener) {
        allCombos(((codeFormat, dataFormat, flowType, useEs) -> {
            createFlow(prefix, codeFormat, dataFormat, flowType, useEs, listener);
        }));
    }

    private void createFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs, CreateFlowListener listener) {
        String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, useEs);
        Path legacyEntityDir = getHubProject().getHubPluginsDir().resolve("entities").resolve(ENTITY);
        Path flowDir = legacyEntityDir.resolve(flowType.toString()).resolve(flowName);

        if (useEs) {
            Path entityDir = getHubProject().getProjectDir().resolve("entities");
            copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
            installUserModules(runAsFlowDeveloper(), true);
        }

        scaffolding.createLegacyFlow(ENTITY, flowName, flowType, codeFormat, dataFormat, useEs);

        String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
        if(! prefix.toLowerCase().equals("default-plugins")) {
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
        }
        if (listener != null) {
            listener.onFlowCreated(codeFormat, dataFormat, flowType, srcDir, flowDir, useEs);
        }
        installUserModules(runAsFlowDeveloper(), true);
    }

    private void copyFile(String srcDir, Path dstDir) {
        InputStream inputStream = getResourceStream(srcDir);
        FileUtil.copy(inputStream, dstDir.toFile());
        IOUtils.closeQuietly(inputStream);
    }

    private void installDocs(DataFormat dataFormat, String collection, DatabaseClient srcClient, boolean useEs, int testSize) {
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
        for (int i = 0; i <  testSize; i++) {
            writeBatcher.add("/input-" + i + "." + dataFormatString, metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
        assertTrue(installDocsFinished, "Doc install not finished");
        assertFalse(installDocsFailed, "Doc install failed: " + installDocError);
    }

    private void testInputFlowViaMlcp(String prefix, String fileSuffix, DatabaseClient databaseClient, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs, Map<String, Object> options, FinalCounts finalCounts) throws InterruptedException {
    	resetDatabases();
    	runAsFlowDeveloper();

        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.INPUT, useEs);

        LegacyFlow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);
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
                    "\"transform_module\":\"\\\"/data-hub/4/transforms/mlcp-flow-transform.sjs\\\"\"," +
                    "\"transform_function\":\"transform\",";
            }
            else {
                optionsJson +=
                    "\"transform_module\":\"\\\"/data-hub/4/transforms/mlcp-flow-transform.xqy\\\"\"," +
                    "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\",";
            }
            optionsJson +=
                "\"transform_param\":\"entity-name=" + ENTITY + ",flow-name=" + flowName + ",options=" + optionString + "\"" +
                "}";
            mlcpOptions = new ObjectMapper().readTree(optionsJson);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        int existingStagingCount = getStagingDocCount();

        MlcpRunner mlcpRunner = new MlcpRunner(null, "com.marklogic.contentpump.ContentPump", runAsFlowOperator(), flow, databaseClient, mlcpOptions, null);
        if (databaseClient.getPort() == getHubConfig().getPort(DatabaseKind.STAGING)) {
            mlcpRunner.setDatabase(getHubConfig().getDbName(DatabaseKind.STAGING));
        } else {
            mlcpRunner.setDatabase(getHubConfig().getDbName(DatabaseKind.FINAL));
        }
        mlcpRunner.start();
        try {
            mlcpRunner.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        logger.error(mlcpRunner.getProcessOutput());

        for (int i = 0; i < 10; i++) {
            Thread.sleep(1000);
            if (getStagingDocCount() == finalCounts.stagingCount + existingStagingCount) {
                break;
            }
        }

        if (databaseClient.getPort() == getHubConfig().getPort(DatabaseKind.STAGING) && finalCounts.stagingCount == 1) {
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
            else if (prefix.equals("extra-nodes")) {
            	filename = "extra-nodes";
            	if(codeFormat.equals(CodeFormat.JAVASCRIPT)) {
            		filename = filename+"-js";
            	}
            }

            GenericDocumentManager stagingDocMgr = getHubClient().getStagingClient().newDocumentManager();
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
        else if (databaseClient.getPort() == getHubConfig().getPort(DatabaseKind.FINAL) && finalCounts.finalCount == 1) {
            String filename = "final";
            if (prefix.equals("scaffolded")) {
                filename = "staged";
            }
            GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
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
        JsonNode node = getHubClient().getJobsClient().newDocumentManager().read("/jobs/" + mlcpRunner.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        assertEquals(mlcpRunner.getJobId(), node.get("jobId").asText());
        assertEquals(finalCounts.jobSuccessfulEvents, node.get("successfulEvents").asInt());
        assertEquals(finalCounts.jobFailedEvents, node.get("failedEvents").asInt());
        assertEquals(finalCounts.jobSuccessfulBatches, node.get("successfulBatches").asInt());
        assertEquals(finalCounts.jobFailedBatches, node.get("failedBatches").asInt());
        assertEquals(finalCounts.jobStatus, node.get("status").asText());
    }

    private void testInputFlowViaREST(String prefix, String fileSuffix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs, boolean passJobId, Map<String, Object> options, FinalCounts finalCounts) {
        resetDatabases();
        runAsFlowDeveloper();

        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.INPUT, useEs);

        final int existingStagingCount = getStagingDocCount();
        final int existingFinalCount = getFinalDocCount();
        final int existingJobsCount = getJobDocCount();

        String transform = codeFormat.equals(CodeFormat.JAVASCRIPT) ? "mlSjsInputFlow" : "mlInputFlow";
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

        runAsFlowOperator();
        GenericDocumentManager flowRunnerDocMgr = getHubClient().getStagingClient().newDocumentManager();
        try {
        	flowRunnerDocMgr.write("/input" + fileSuffix + "." + dataFormat.toString(), handle, serverTransform);
            if (finalCounts.stagingCount == 0) {
                fail("Should have thrown an exception.");
            }
        }
        catch(FailedRequestException e) {

        }

        int stagingCount = getStagingDocCount();
        int finalCount = getFinalDocCount();
        int jobsCount = getJobDocCount();

        assertEquals(finalCounts.stagingCount, stagingCount - existingStagingCount);
        assertEquals(finalCounts.finalCount, finalCount - existingFinalCount);
        assertEquals(finalCounts.jobCount, jobsCount - existingJobsCount);

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
            else if (prefix.equals("extra-nodes")) {
            	filename = "extra-nodes";
            	if(codeFormat.equals(CodeFormat.JAVASCRIPT)) {
            		filename = filename+"-js";
            	}
            }
            if (dataFormat.equals(DataFormat.JSON)) {
                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
                String actual = flowRunnerDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
                assertJsonEqual(expected, actual, false);
            } else {
                Document expected = getXmlFromResource("e2e-test/" + filename + "." + dataFormat.toString());
                Document actual = flowRunnerDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new DOMHandle()).get();
                assertXMLEqual(expected, actual);
            }
        }
    }

    private void testInputFlowViaDMSDK(String prefix, String fileSuffix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs, boolean passJobId, Map<String, Object> options, FinalCounts finalCounts) {
        resetDatabases();
        runAsFlowDeveloper();

        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.INPUT, useEs);
        final int existingStagingCount = getStagingDocCount();
        final int existingFinalCount = getFinalDocCount();
        final int existingJobsCount = getJobDocCount();

        String transform = codeFormat.equals(CodeFormat.JAVASCRIPT) ? "mlSjsInputFlow" : "mlInputFlow";
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

        WriteBatcher batcher = flowRunnerDataMovementManager.newWriteBatcher();
        batcher.withBatchSize(1).withTransform(serverTransform);
        batcher.onBatchSuccess(batch -> {
		}).onBatchFailure((batch, throwable) -> {
			throwable.printStackTrace();
		});
        flowRunnerDataMovementManager.startJob(batcher);
        batcher.add("/input" + fileSuffix + "." + dataFormat.toString(), handle);
        batcher.flushAndWait();

        int stagingCount = getStagingDocCount();
        int finalCount = getFinalDocCount();
        int jobsCount = getJobDocCount();

        assertEquals(finalCounts.stagingCount, stagingCount - existingStagingCount);
        assertEquals(finalCounts.finalCount, finalCount - existingFinalCount);
        assertEquals(finalCounts.jobCount, jobsCount - existingJobsCount);

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
            else if (prefix.equals("extra-nodes")) {
            	filename = "extra-nodes";
            	if(codeFormat.equals(CodeFormat.JAVASCRIPT)) {
            		filename = filename+"-js";
            	}
            }

            GenericDocumentManager flowRunnerDocMgr = getHubClient().getStagingClient().newDocumentManager();
            if (dataFormat.equals(DataFormat.JSON)) {
                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
                String actual = flowRunnerDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
                assertJsonEqual(expected, actual, false);
            } else {
                Document expected = getXmlFromResource("e2e-test/" + filename + "." + dataFormat.toString());
                Document actual = flowRunnerDocMgr.read("/input" + fileSuffix + "." + dataFormat.toString()).next().getContent(new DOMHandle()).get();
                assertXMLEqual(expected, actual);
            }
        }
    }

    private Tuple<LegacyFlowRunner, JobTicket> runHarmonizeFlow(
        String flowName, DataFormat dataFormat,
        Vector<String> completed, Vector<String> failed,
        Map<String, Object> options,
        DatabaseClient srcClient, String destDb,
        boolean useEs, boolean waitForCompletion) {
        return runHarmonizeFlow(flowName, dataFormat, completed, failed, options, srcClient, destDb, useEs,waitForCompletion, TEST_SIZE);
    }

    private Tuple<LegacyFlowRunner, JobTicket> runHarmonizeFlow(
        String flowName, DataFormat dataFormat,
        Vector<String> completed, Vector<String> failed,
        Map<String, Object> options,
        DatabaseClient srcClient, String destDb,
        boolean useEs, boolean waitForCompletion, int testSize)
    {
        resetDatabases();
        runAsFlowDeveloper();

        installDocs(dataFormat, ENTITY, srcClient, useEs, testSize);
        runAsFlowOperator();
        LegacyFlow harmonizeFlow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);
        LegacyFlowRunner flowRunner = flowManager.newFlowRunner()
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
        runAsFlowDeveloper();
        return new Tuple<>(flowRunner, jobTicket);
    }

    private void testHarmonizeFlow(
        String prefix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs,
        Map<String, Object> options, DatabaseClient srcClient, String destDb,
        FinalCounts finalCounts, boolean waitForCompletion) throws InterruptedException {
        testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, srcClient, destDb, finalCounts, waitForCompletion, TEST_SIZE);
    }

    private void testHarmonizeFlow(
        String prefix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs,
        Map<String, Object> options, DatabaseClient srcClient, String destDb,
        FinalCounts finalCounts, boolean waitForCompletion, int testSize) throws InterruptedException {
        resetDatabases();
        runAsFlowDeveloper();
        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.HARMONIZE, useEs);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        int existingStagingCount = getStagingDocCount();

        Tuple<LegacyFlowRunner, JobTicket> tuple= null;
        tuple = runHarmonizeFlow(flowName, dataFormat, completed, failed, options, srcClient, destDb, useEs, waitForCompletion, testSize);

        if (waitForCompletion) {
            for (int i = 0; i < 10; i++) {
                Thread.sleep(1000);
                if (getStagingDocCount() == finalCounts.stagingCount + existingStagingCount) {
                    break;
                }
            }

            assertEquals(finalCounts.completedCount, completed.size());
            assertEquals(finalCounts.failedCount, failed.size());

            GenericDocumentManager mgr = destDb.equals(HubConfig.DEFAULT_STAGING_NAME) ?
                getHubClient().getStagingClient().newDocumentManager() :
                getHubClient().getFinalClient().newDocumentManager();

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
            JsonNode node = getHubClient().getJobsClient().newDocumentManager().read("/jobs/" + tuple.y.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
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

        Tuple<LegacyFlowRunner, JobTicket> tuple = runHarmonizeFlow(flowName, dataFormat, completed, failed, options, srcClient, destDb, useEs, true);

        assertEquals(finalCounts.completedCount, completed.size());
        assertEquals(finalCounts.failedCount, failed.size());

        // inspect the job json
        JsonNode node = getHubClient().getJobsClient().newDocumentManager().read("/jobs/" + tuple.y.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        assertEquals(tuple.y.getJobId(), node.get("jobId").asText());
        assertEquals(finalCounts.jobSuccessfulEvents, node.get("successfulEvents").asInt());
        assertEquals(finalCounts.jobFailedEvents, node.get("failedEvents").asInt());
        assertEquals(finalCounts.jobSuccessfulBatches, node.get("successfulBatches").asInt());
        assertEquals(finalCounts.jobFailedBatches, node.get("failedBatches").asInt());
        assertEquals(finalCounts.jobStatus, node.get("status").asText());
   }

    private String toJsonString(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
