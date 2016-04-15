package com.marklogic.hub.web.controller.api;

import java.nio.file.Path;
import java.nio.file.WatchEvent;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
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

import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.model.EntityModel;
import com.marklogic.hub.service.DataHubService;
import com.marklogic.hub.service.EntityManagerService;
import com.marklogic.hub.service.FileSystemEventListener;
import com.marklogic.hub.service.FileSystemWatcherService;
import com.marklogic.hub.service.SyncStatusService;
import com.marklogic.hub.web.form.EntityForm;
import com.marklogic.hub.web.form.LoginForm;

@RestController
@RequestMapping("/api/entities")
@Scope("session")
public class EntityApiController implements InitializingBean, DisposableBean, FileSystemEventListener {

    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private EntityManagerService entityManagerService;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private SyncStatusService syncStatusService;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public List<EntityModel> getEntities(HttpSession session) {
        LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
        List<EntityModel> entities = entityManagerService.getEntities();
        loginForm.setEntities(entities);
        return entities;
    }

    @RequestMapping(value = "display", method = RequestMethod.POST)
    @ResponseBody
    public EntityModel displayEntity(@RequestBody String entityName, HttpSession session) {
        LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
        loginForm.selectEntity(entityName);

        return loginForm.getSelectedEntity();
    }

    @RequestMapping(method = RequestMethod.POST, consumes = { MediaType.APPLICATION_JSON_UTF8_VALUE }, produces = {
        MediaType.APPLICATION_JSON_UTF8_VALUE })
    @ResponseBody
    public LoginForm saveEntity(@RequestBody EntityForm entityForm, BindingResult bindingResult, HttpSession session) {
        LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
        List<EntityModel> entities = loginForm.getEntities();

        entityForm.validate(entities);

        EntityModel entityModel = entityManagerService.createEntity(entityForm.getEntityName(),
        entityForm.getInputFlowName(), entityForm.getHarmonizeFlowName(), entityForm.getPluginFormat(),
        entityForm.getDataFormat());

        entities.add(entityModel);
        loginForm.setSelectedEntity(entityModel);
        return loginForm;
    }

    /**
    * Get a list of entities that has changed. This API does not return until a
    * change has occurred.
    *
    * @param session
    * @return
    */
    @RequestMapping(value = "status-change", method = RequestMethod.GET)
    public LoginForm getStatusChange(HttpServletRequest request) {
        HttpSession session = request.getSession();

        synchronized (syncStatusService) {
            try {
                syncStatusService.wait();
            }
            catch (InterruptedException e) {
            }

            // refresh the list of entities saved in the session
            LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
            if (null == loginForm) {
                loginForm = new LoginForm();
            }

            // add checking if data hub is installed and the server is
            // acceptable. Something may have changed the server or removed the
            // data hub outside the app
            loginForm.setInstalled(dataHubService.isInstalled());
            loginForm.setServerVersionAccepted(dataHubService.isServerAcceptable());
            if (loginForm.isInstalled()) {
                List<EntityModel> entities = entityManagerService.getEntities();
                loginForm.setEntities(entities);
                loginForm.refreshSelectedEntity();
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
            syncStatusService.notifyAll();
        }
    }
}
