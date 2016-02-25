package com.marklogic.hub.web.controller.api;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.WatchEvent;
import java.util.List;

import javax.servlet.http.HttpSession;

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

import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.service.DataHubService;
import com.marklogic.hub.service.DomainManagerService;
import com.marklogic.hub.service.FileSystemEventListener;
import com.marklogic.hub.service.FileSystemWatcherService;
import com.marklogic.hub.service.SyncStatusService;
import com.marklogic.hub.web.form.DomainForm;
import com.marklogic.hub.web.form.LoginForm;

@RestController
@RequestMapping("/api/domains")
@Scope("session")
public class DomainApiController implements InitializingBean, DisposableBean,
        FileSystemEventListener {

    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private DomainManagerService domainManagerService;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private SyncStatusService syncStatusService;

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
                domainForm.getConformFlowName(),
                domainForm.getPluginFormat(),
                domainForm.getDataFormat());

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
        synchronized (syncStatusService) {
            try {
                syncStatusService.wait();
            } catch (InterruptedException e) {
            }

            // refresh the list of domains saved in the session
            LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");

            // add checking if data hub is installed and the server is
            // acceptable. Something may have changed the server or removed the
            // data hub outside the app
            loginForm.setInstalled(dataHubService.isInstalled());
            loginForm.setServerVersionAccepted(dataHubService.isServerAcceptable());
            if (loginForm.isInstalled()) {
                List<DomainModel> domains = domainManagerService.getDomains();
                loginForm.setDomains(domains);
                loginForm.refreshSelectedDomain();
            }

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
        synchronized (syncStatusService) {
            syncStatusService.notifyAll();
        }
    }

    @Override
    public void onWatchEvent(Path path, WatchEvent<Path> event) {
        synchronized (syncStatusService) {
            try {
                syncStatusService.updateSyncStatus(path.toFile());

                syncStatusService.notifyAll();
            } catch (IOException e) {
            }
        }
    }
}
