package com.marklogic.quickstart.util;

import com.marklogic.quickstart.model.LogMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;


@Service
public class WebsocketLogger {
    @Autowired
    private SimpMessagingTemplate template;

    public void log(String message){
        template.convertAndSend("/topic/log",new LogMessage(message));
    }

}
