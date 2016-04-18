package com.marklogic.hub;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.xcc.ContentSource;
import com.marklogic.xcc.ContentSourceFactory;
import com.marklogic.xcc.Request;
import com.marklogic.xcc.ResultSequence;
import com.marklogic.xcc.Session;
import com.marklogic.xcc.exceptions.RequestException;
import com.marklogic.xcc.exceptions.XccConfigException;

public class DataHubUser {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(DataHubUser.class);
    
    private static HubConfig hubConfig;
    private static URI uri;
    
    static {
        try {
            hubConfig = HubConfig.getDefaultInstance();
            uri = new URI("xcc://" + hubConfig + "/Security");
        } catch (IOException | URISyntaxException e) {
            LOGGER.error(e.getLocalizedMessage(), e);
        }
    }

    public static void createUser(String username, String password, boolean isAdmin) throws Exception {
        try {
            ContentSource contentSource = ContentSourceFactory.newContentSource(uri);
            Session session = contentSource.newSession();
            
            String role = isAdmin? "'admin','rest-admin'" : "'rest-writer'";
            String query = "xquery version \"1.0-ml\";" +
                    "import module namespace sec=\"http://marklogic.com/xdmp/security\" at \"/MarkLogic/security.xqy\";" +
                    "sec:create-user('" + username + "', '" + username + "', '" + password + "' ," + role + ", (), ())";
            
            Request request = session.newAdhocQuery (query);
            ResultSequence rs = session.submitRequest (request);

            LOGGER.debug(rs.asString());
            LOGGER.info("Created " + username + " on " + hubConfig);

            session.close();
        } catch (XccConfigException e) {
            LOGGER.error(e.getLocalizedMessage(), e);
            throw new Exception(e.getLocalizedMessage());
        } catch (RequestException e) {
            if (e.getMessage().equals("User already exists")) {
                String errorMessage = "User " + username + " already exists on server " + hubConfig.host + ":" + hubConfig.stagingPort; 
                LOGGER.error(errorMessage, e);
                throw new Exception(errorMessage);
            } else {
                LOGGER.error(e.getLocalizedMessage(), e);
                throw new Exception(e.getLocalizedMessage());
            }
        }
    }
    
    public static void createHubUser() throws Exception {
        createUser(hubConfig.hubUsername, hubConfig.hubPassword, false);
    }
}
