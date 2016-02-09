package com.marklogic.hub.web.controller.api;

import java.io.File;
import java.io.IOException;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.WatchEvent;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.service.DomainManagerService;
import com.marklogic.hub.service.FileSystemEventListener;
import com.marklogic.hub.service.FileSystemWatcherService;
import com.marklogic.hub.web.form.DomainForm;
import com.marklogic.hub.web.form.LoginForm;

@RestController
@RequestMapping("/api/domains")
@Scope("session")
public class DomainApiController implements InitializingBean, DisposableBean, FileSystemEventListener {

	@Autowired
    private EnvironmentConfiguration environmentConfiguration;
	
	@Autowired
	private DomainManagerService domainManagerService;
	
    @Autowired
    private FileSystemWatcherService watcherService;
    
    // TODO: this list of modified domains should be cleared when the user deploys the user modules 
    // also, this should also get notified when the user deploys the user modules so we can update the UI
    private Set<String> modifiedDomains = Collections.synchronizedSet(new LinkedHashSet<>());

	@RequestMapping(method = RequestMethod.GET)
	@ResponseBody
	public List<DomainModel> getDomains(HttpSession session) {
		LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
		List<DomainModel> domains = domainManagerService.getDomains();
		loginForm.setDomains(domains);
		return domains;
	}
	
	@RequestMapping(method = RequestMethod.POST, consumes={MediaType.APPLICATION_JSON_UTF8_VALUE}, produces={MediaType.APPLICATION_JSON_UTF8_VALUE})
	@ResponseBody
	public List<DomainModel> saveDomain(@RequestBody DomainForm domainForm, BindingResult bindingResult, HttpSession session) {
		DomainModel domainModel = domainManagerService.createDomain(domainForm.getDomainName(), domainForm.getInputFlowName(), 
				domainForm.getConformFlowName());
		LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
		List<DomainModel> domains = loginForm.getDomains();
		domains.add(domainModel);
		return domains;
	}
	
    /**
     * Get a list of domains that has changed.
     * This API does not return until a change has occurred.
     * 
     * @param session
     * @return
     */
    @RequestMapping(value="change-list", method = RequestMethod.GET)
    public List<DomainModel> getDomainChangeList(HttpSession session) {
        synchronized (this) {
            try {
                this.wait();
            } catch (InterruptedException e) {
            }
        }
	
        LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
        
        List<DomainModel> domains = domainManagerService.getDomains();
        synchronized (modifiedDomains) {
            for (String domain : modifiedDomains) {
                for (DomainModel domainModel : domains) {
                    if (domain.equals(domainModel.getDomainName())) {
                        domainModel.setSynched(false);
                    }
                }
            }
            modifiedDomains.clear();
        }
        
        loginForm.setDomains(domains);
        session.setAttribute("loginForm", loginForm);
        
        return domains;
    }
    
    @Override
    public void afterPropertiesSet() throws Exception {
        String pluginDir = environmentConfiguration.getUserPluginDir();
        watcherService.watch(pluginDir, this);
    }

    @Override
    public void destroy() throws Exception {
        synchronized (this) {
            this.notify();
        }
    }
    
    @Override
    public void onWatchEvent(Path path, WatchEvent<Path> event) {
        synchronized (this) {
            try {
                String realPath = path.toRealPath(LinkOption.NOFOLLOW_LINKS).toString();
                String modifiedDomain = getDomainName(realPath);
                if (modifiedDomain != null) {
                    modifiedDomains.add(modifiedDomain);
                }
                
                this.notify();
            } catch (IOException e) {
            }
        }
    }
    
    private String getDomainName(String path) {
        try {
            String domainsPath = new File(environmentConfiguration.getUserPluginDir() + File.separator + "domains").toPath().toRealPath(LinkOption.NOFOLLOW_LINKS).toString();
            
            if (path.indexOf(domainsPath) == 0) {
                String suffix = path.substring(domainsPath.length());
                String[] pathTokens = suffix.split("[/\\\\]");
                
                return pathTokens != null && pathTokens.length > 1 ? pathTokens[1] : null;
            }
            else {
                return null;
            }
        } catch (IOException e) {
            return null;
        }
    }
}
