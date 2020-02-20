package com.marklogic.hub.oneui.listener;

import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.oneui.exceptions.ProjectDirectoryException;
import com.marklogic.hub.oneui.models.StatusMessage;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;

public class UIDeployListener implements HubDeployStatusListener {
    protected final Logger logger = LoggerFactory.getLogger(UIDeployListener.class);

    static final Map<String, Object> stompHeaders = new HashMap<>() {{
        put("content-type","application/json");
    }};

    private SimpMessagingTemplate template;

    private boolean isUninstall;

    private int lastPercentageComplete;

    private Exception exception;

    public UIDeployListener(SimpMessagingTemplate template, boolean isUninstall) {
        this.template = template;
        this.isUninstall = isUninstall;
    }

    @Override
    public void onStatusChange(int percentComplete, String message) {
        if (percentComplete >= 0) {
            logger.info(percentComplete + "% " + message);
            lastPercentageComplete = percentComplete;
            String msg = parseMessage(message);
            template.convertAndSend("/topic/install-status", new StatusMessage(percentComplete, msg), stompHeaders);
        }
    }

    @Override
    public void onError(String commandName, Exception exception) {
        String message = "Error encountered running command: " + commandName;
        String msg = parseMessage(message);
        template.convertAndSend("/topic/install-status", new StatusMessage(lastPercentageComplete, msg));
        logger.error(message, exception);
        this.exception = exception;
        if (exception instanceof IOException || exception.getCause() instanceof IOException) {
            this.exception = new ProjectDirectoryException("Installation failed; please contact a system administrator for assistance.",
                "Installation error: " + exception.getMessage(), exception);
        }
    }

    public Exception getException() {
        return this.exception;
    }

    private String parseMessage(String message) {
        String msg = "";
        if (message.endsWith("Complete")) {
            msg = message;
        } else if (isUninstall && !message.startsWith("Uninstalling")) {
            msg = "Uninstalling..." + message;
        } else {
            msg = "Installing..." + message;
        }
        return msg;
    }
}
