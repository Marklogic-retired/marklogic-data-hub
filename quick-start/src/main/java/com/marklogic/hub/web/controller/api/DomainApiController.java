package com.marklogic.hub.web.controller.api;

import java.io.File;
import java.io.IOException;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.WatchEvent;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.MediaType;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.service.DomainManagerService;
import com.marklogic.hub.service.FileSystemEventListener;
import com.marklogic.hub.service.FileSystemWatcherService;
import com.marklogic.hub.web.bean.SyncStatusBean;
import com.marklogic.hub.web.form.DomainForm;
import com.marklogic.hub.web.form.LoginForm;

@RestController
@RequestMapping("/api/domains")
@Scope("session")
public class DomainApiController implements InitializingBean, DisposableBean,
        FileSystemEventListener {
    private static final Logger LOGGER = LoggerFactory
            .getLogger(DomainApiController.class);
    
    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    @Autowired
    private DomainManagerService domainManagerService;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private SyncStatusBean syncStatus;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public List<DomainModel> getDomains(HttpSession session) {
        LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
        List<DomainModel> domains = domainManagerService.getDomains();
        loginForm.setDomains(domains);
        return domains;
    }

    @RequestMapping(value = "display", method = RequestMethod.POST)
    @ResponseBody
    public DomainModel displayDomain(@RequestBody String domainName,
            HttpSession session) {
        LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
        loginForm.selectDomain(domainName);
        
        return loginForm.getSelectedDomain();
    }

    @RequestMapping(method = RequestMethod.POST, consumes = { MediaType.APPLICATION_JSON_UTF8_VALUE }, produces = { MediaType.APPLICATION_JSON_UTF8_VALUE })
    @ResponseBody
    public LoginForm saveDomain(@RequestBody DomainForm domainForm,
            BindingResult bindingResult, HttpSession session) {
        LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
        List<DomainModel> domains = loginForm.getDomains();

        domainForm.validate(domains);

        DomainModel domainModel = domainManagerService.createDomain(
                domainForm.getDomainName(), domainForm.getInputFlowName(),
                domainForm.getConformFlowName());

        domains.add(domainModel);
        loginForm.setSelectedDomain(domainModel);
        return loginForm;
    }

    /**
     * Get a list of domains that has changed. This API does not return until a
     * change has occurred.
     * 
     * @param session
     * @return
     */
    @RequestMapping(value = "status-change", method = RequestMethod.GET)
    public LoginForm getStatusChange(HttpSession session) {
        synchronized (syncStatus) {
            try {
                syncStatus.wait();
            } catch (InterruptedException e) {
            }

            // refresh the list of domains saved in the session
            List<DomainModel> domains = domainManagerService.getDomains();
            LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
            loginForm.refreshDomains(domains);
            loginForm.updateWithSyncStatus(syncStatus);
            
            // clear all pending updates
            syncStatus.clearModifications();
            
            // refresh the session loginForm
            session.setAttribute("loginForm", loginForm);
            
            return loginForm;
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        String pluginDir = environmentConfiguration.getUserPluginDir();
        watcherService.watch(pluginDir, this);
    }

    @Override
    public void destroy() throws Exception {
        synchronized (syncStatus) {
            syncStatus.notifyAll();
        }
    }

    @Override
    public void onWatchEvent(Path path, WatchEvent<Path> event) {
        synchronized (syncStatus) {
            try {
                String realPath = path.toRealPath(LinkOption.NOFOLLOW_LINKS)
                        .toString();
                UserPluginFileInfo info = new UserPluginFileInfo(realPath);
                
                if (info.domainName != null) {
                    syncStatus.addModifiedDomain(info.domainName);
                }
                if (info.domainName != null && info.flowName != null) {
                    if (info.flowType == FlowType.INPUT) {
                        syncStatus.addModifiedInputFlow(info.domainName, info.flowName);
                    }
                    else if (info.flowType == FlowType.CONFORM) {
                        syncStatus.addModifiedConformFlow(info.domainName, info.flowName);
                    }
                }

                syncStatus.notifyAll();
            } catch (IOException e) {
            }
        }
    }
    private class UserPluginFileInfo {
        private String domainName;
        private String flowName;
        private FlowType flowType;
        
        public UserPluginFileInfo(String path) {
            try {
                String domainsPath = new File(
                        environmentConfiguration.getUserPluginDir()
                                + File.separator + "domains").toPath()
                        .toRealPath(LinkOption.NOFOLLOW_LINKS).toString();

                if (path.indexOf(domainsPath) == 0) {
                    String suffix = path.substring(domainsPath.length());
                    String[] pathTokens = suffix.split("[/\\\\]");

                    if (pathTokens != null) {
                        this.domainName = pathTokens.length >= 2 ? pathTokens[1] : null;
                        this.flowName = pathTokens.length >= 4 ? pathTokens[3] : null;

                        String flowType = pathTokens.length >= 3 ? pathTokens[2] : null;
                        this.flowType = flowType != null ? FlowType.getFlowType(flowType) : null;
                    }
                    
                }
            } catch (IOException e) {
                LOGGER.error("Cannot get info from path: " + path, e);
            }
        }
    }
}
