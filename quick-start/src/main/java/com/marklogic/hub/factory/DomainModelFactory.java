package com.marklogic.hub.factory;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.util.FileUtil;

public class DomainModelFactory {

    private Map<String, Domain> domainsInServer = new LinkedHashMap<>();

    public DomainModelFactory() {
        // use this when creating a new domain in the client
    }

    public DomainModelFactory(List<Domain> domains) {
        // use this when comparing domains in the client and server
        if (domains != null) {
            for (Domain domain : domains) {
                domainsInServer.put(domain.getName(), domain);
            }
        }
    }

    public DomainModel createNewDomain(String userPluginDir, String domainName,
            String inputFlowName, String conformFlowName) {
        DomainModel domainModel = new DomainModel();
        domainModel.setDomainName(domainName);
        domainModel.setInputFlows(new ArrayList<>());
        domainModel.setConformFlows(new ArrayList<>());

		String domainsPath = userPluginDir + File.separator + FileUtil.DOMAINS_FOLDER;
		FileUtil.createFolderIfNecessary(domainsPath, domainName);

        FlowModelFactory flowModelFactory = new FlowModelFactory(domainName);
		String domainDirPath = domainsPath + File.separator + domainName;
		if (inputFlowName != null) {
        FlowModel inputFlow = flowModelFactory.createNewFlow(domainDirPath
                + File.separator + FlowType.INPUT.getName(), inputFlowName,
                FlowType.INPUT);
            domainModel.getInputFlows().add(inputFlow);
		}

		if (conformFlowName != null) {
        FlowModel conformFlow = flowModelFactory.createNewFlow(domainDirPath
                + File.separator + FlowType.CONFORM.getName(), conformFlowName,
                FlowType.CONFORM);

        domainModel.getConformFlows().add(conformFlow);
		}

        return domainModel;
    }

    public DomainModel createDomain(String domainName, String domainFilePath) {
        DomainModel domainModel = new DomainModel();
        domainModel.setDomainName(domainName);
        domainModel.setSynched(this.domainsInServer.containsKey(domainName));

        FlowModelFactory flowModelFactory = new FlowModelFactory(
                this.domainsInServer.get(domainName), domainName);
        domainModel.setInputFlows(this.getInputFlows(flowModelFactory,
                domainFilePath));
        domainModel.setConformFlows(this.getConformFlows(flowModelFactory,
                domainFilePath));

        return domainModel;
    }

    private List<FlowModel> getInputFlows(FlowModelFactory flowModelFactory,
            String domainFilePath) {
        return this.getFlows(flowModelFactory, domainFilePath, FlowType.INPUT);
    }

    private List<FlowModel> getConformFlows(FlowModelFactory flowModelFactory,
            String domainFilePath) {
        return this
                .getFlows(flowModelFactory, domainFilePath, FlowType.CONFORM);
    }

    private List<FlowModel> getFlows(FlowModelFactory flowModelFactory,
            String domainFilePath, FlowType flowType) {
        List<FlowModel> flows = new ArrayList<>();
        String flowsFilePath = domainFilePath + File.separator
                + flowType.getName();
        List<String> flowNames = FileUtil.listDirectFolders(flowsFilePath);
        for (String flowName : flowNames) {
            FlowModel flowModel = flowModelFactory.createFlow(flowsFilePath,
                    flowName, flowType);
            flows.add(flowModel);
        }
        return flows;
    }

    public static Map<String, DomainModel> toDomainModelMap(List<DomainModel> domains) {
        Map<String, DomainModel> domainModelMap = new HashMap<String, DomainModel>();
        for (DomainModel model : domains) {
            domainModelMap.put(model.getDomainName(), model);
        }
        
        return domainModelMap;
    }
}
