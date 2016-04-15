package com.marklogic.hub.service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.io.Format;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.Mlcp;
import com.marklogic.hub.Mlcp.MlcpSource;
import com.marklogic.hub.Mlcp.SourceOptions;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.exception.FlowManagerException;
import com.marklogic.hub.factory.FlowModelFactory;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.FlowOptionsModel;

@Service
public class FlowManagerService {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(FlowManagerService.class);
    
    private static final String NEW_LINE = "\n";

    private static final String DASH = "-";

    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    public FlowManager getFlowManager() {

        Authentication authMethod = Authentication
                .valueOf(environmentConfiguration.getMLAuth().toUpperCase());
        DatabaseClient client = DatabaseClientFactory.newClient(
                environmentConfiguration.getMLHost(),
                Integer.parseInt(environmentConfiguration.getMLStagingRestPort()),
                environmentConfiguration.getMLUsername(),
                environmentConfiguration.getMLPassword(), authMethod);
        return new FlowManager(client);

    }

    public List<Flow> getFlows(String entityName) {
        FlowManager flowManager = getFlowManager();
        return flowManager.getFlows(entityName);
    }

    public Flow getFlow(String entityName, String flowName) {
        FlowManager flowManager = getFlowManager();
        return flowManager.getFlow(entityName, flowName);
    }

    public void installFlow(Flow flow) {
        FlowManager flowManager = getFlowManager();
        flowManager.installFlow(flow);
    }

    public void uninstallFlow(String flowName) {
        FlowManager flowManager = getFlowManager();
        flowManager.uninstallFlow(flowName);
    }

    public JobExecution testFlow(Flow flow) {
        FlowManager flowManager = getFlowManager();
        return flowManager.testFlow(flow);
    }

    public JobExecution runFlow(Flow flow, int batchSize) {
        return runFlow(flow, batchSize, null);
    }
    
    public JobExecution runFlow(Flow flow, int batchSize, JobExecutionListener listener) {
        FlowManager flowManager = getFlowManager();
        return flowManager.runFlow(flow, batchSize, listener);
    }

    public void runFlowsInParallel(Flow... flows) {
        FlowManager flowManager = getFlowManager();
        flowManager.runFlowsInParallel(flows);
    }

    public FlowModel createFlow(String entityName, String flowName,
            FlowType flowType, PluginFormat pluginFormat, Format dataFormat) {
        FlowModelFactory flowModelFactory = new FlowModelFactory(entityName);
        File pluginDir = new File(environmentConfiguration.getUserPluginDir());
        FlowModel flowModel;
        try {
            flowModel = flowModelFactory.createNewFlow(pluginDir, flowName,
                    flowType, pluginFormat, dataFormat);
        } catch (IOException e) {
            throw new FlowManagerException(e.getMessage(), e);
        }
        return flowModel;
    }

    public void loadData(FlowOptionsModel flowOptionsModel) throws IOException, JSONException {
        SourceOptions sourceOptions = createSourceOptionsInstance(flowOptionsModel);
        Mlcp mlcp = createMlcpInstance(flowOptionsModel,sourceOptions);
        mlcp.loadContent();
    }
    
    private SourceOptions createSourceOptionsInstance(FlowOptionsModel flowOptionsModel) {
        Flow flow = getFlow(flowOptionsModel.getEntityName(), flowOptionsModel.getFlowName());
        
        SourceOptions sourceOptions = new SourceOptions(
                flowOptionsModel.getEntityName(), flowOptionsModel.getFlowName(),
                FlowType.INPUT.toString(),
                flow.getDataFormat());

        sourceOptions.setInputFileType(flowOptionsModel.getInputFileType());
        sourceOptions.setOtherOptions(flowOptionsModel.getOtherOptions());
        
        return sourceOptions;
    }
    
    private Mlcp createMlcpInstance(FlowOptionsModel flowOptionsModel, SourceOptions sourceOptions) throws IOException {
        Mlcp mlcp = new Mlcp(
                environmentConfiguration.getMLHost()
                ,Integer.parseInt(environmentConfiguration.getMLStagingRestPort())
                ,environmentConfiguration.getMLUsername()
                ,environmentConfiguration.getMLPassword()
                );
        mlcp.addSourceDirectory(flowOptionsModel.getInputPath(), sourceOptions);
        return mlcp;
    }
    
    public String buildMlcpConfigContent(FlowOptionsModel flowOptionsModel) throws IOException, JSONException {
        SourceOptions sourceOptions = createSourceOptionsInstance(flowOptionsModel);
        Mlcp mlcp = createMlcpInstance(flowOptionsModel,sourceOptions);
        List<String> mlcpOptions = mlcp.getMlcpOptions(new MlcpSource(flowOptionsModel.getInputPath(), sourceOptions));
        return StringUtils.collectionToDelimitedString(mlcpOptions, NEW_LINE);
    }
    
    public void populateMlcpOptions(FlowOptionsModel flowOptionsModel, String optionsFileContent) {
        //put options to map to have option key-value pairs
        String[] options = StringUtils.delimitedListToStringArray(optionsFileContent, NEW_LINE);
        Map<String,String> optionsMap = new HashMap<String,String>();
        String key = null;
        for (String option : options) {
            if(option.startsWith(DASH)) {
                key = option;
            } else {
                optionsMap.put(key, option);
            }
        }
        
        //populate the flowOptionsModel
        LOGGER.debug("Options for flow with entity name "+ flowOptionsModel.getEntityName() + 
                " and flow name "+ flowOptionsModel.getFlowName());
        //start with the required options
        String inputPath = optionsMap.get(Mlcp.INPUT_FILE_PATH_KEY);
        String inputFileType = optionsMap.get(Mlcp.INPUT_FILE_TYPE_KEY);
        LOGGER.debug("{" + Mlcp.INPUT_FILE_PATH_KEY + ": "+ inputPath + "," + Mlcp.INPUT_FILE_TYPE_KEY + ":" + inputFileType + "}");
        flowOptionsModel.setInputPath(inputPath);
        flowOptionsModel.setInputFileType(inputFileType);
        
        //then the other options
        //by removing the unnecessary options from the map
        optionsMap.remove(Mlcp.INPUT_FILE_PATH_KEY);
        optionsMap.remove(Mlcp.INPUT_FILE_TYPE_KEY);
        optionsMap.remove(null);
        optionsMap.remove(Mlcp.MODE_KEY);
        optionsMap.remove(Mlcp.HOST_KEY);
        optionsMap.remove(Mlcp.PORT_KEY);
        optionsMap.remove(Mlcp.USERNAME_KEY);
        optionsMap.remove(Mlcp.PASSWORD_KEY);
        //then converting the map to a json string
        String otherOptions = new JSONObject(optionsMap).toString();
        LOGGER.debug("Other options = "+ otherOptions);
        flowOptionsModel.setOtherOptions(otherOptions);
        
    }
}
