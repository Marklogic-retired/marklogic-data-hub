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
            String role = isAdmin? "'admin'" : "('rest-admin','xa-admin','manage-admin-internal')";
            String query = "xquery version \"1.0-ml\";" +
                    "import module namespace sec=\"http://marklogic.com/xdmp/security\" at \"/MarkLogic/security.xqy\";" +
                    "sec:create-user('" + username + "', '" + username + "', '" + password + "' ," + role + ", (xdmp:permission('rest-admin', 'update')), ())";
            
            ResultSequence rs = executeQuery(query);

            LOGGER.debug(rs.asString());
            LOGGER.info("Created " + username + " on " + hubConfig);

            
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
    
    public static ResultSequence executeQuery(String query) throws Exception {
        Session session = null;
        ResultSequence rs = null;
        try {
            ContentSource contentSource = ContentSourceFactory.newContentSource(uri);
            session = contentSource.newSession();
            Request request = session.newAdhocQuery (query);
            rs = session.submitRequest (request);
            
        } catch (XccConfigException | RequestException e) {
            throw e;
        } finally {
            if(session != null) {
                session.close();
            }
        }
        return rs;
        
    }
    
    public static void createHubUser() throws Exception {
        createUser(hubConfig.hubUsername, hubConfig.hubPassword, false);
    }
    
    public static void createHubUserIfNotExists() throws Exception {
        if(!userExists(hubConfig.hubUsername)) {
            createUser(hubConfig.hubUsername, hubConfig.hubPassword, false);
        }
    }
    
    public static boolean userExists(String username) throws Exception {
        try {
            String query = "xquery version \"1.0-ml\";" +
                    "import module namespace sec=\"http://marklogic.com/xdmp/security\" at \"/MarkLogic/security.xqy\";" +
                    "sec:user-exists('" + username + "')";
            ResultSequence rs = executeQuery(query);
            LOGGER.debug(rs.asString());
            return Boolean.valueOf(rs.asString());
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
}
