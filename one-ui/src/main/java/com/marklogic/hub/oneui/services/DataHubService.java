package com.marklogic.hub.oneui.services;

import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;

@Service
public class DataHubService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    @Autowired
    private HubConfigSession hubConfigSession;

    public boolean install(HubDeployStatusListener listener) {
        logger.info("Installing Data Hub...");
        try {
            hubConfigSession.getDataHub().install(listener);
            return true;
        } catch(Exception e) {
            logger.warn("Error encountered installing Data Hub...", e);
            listener.onStatusChange(-1, getStackTrace(e));
            listener.onError("Init", e);
        }
        return false;
    }

    private String getStackTrace(final Throwable throwable) {
        final StringWriter sw = new StringWriter();
        final PrintWriter pw = new PrintWriter(sw, true);
        throwable.printStackTrace(pw);
        return sw.getBuffer().toString();
    }
}
