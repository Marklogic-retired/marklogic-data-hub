package com.marklogic.hub.central.controllers;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.InputStreamHandle;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;

@Controller
@RequestMapping(value = "/api/record")
public class RecordController extends BaseController {

    @RequestMapping(value = "/download", method = RequestMethod.GET)
    public void download(@RequestParam String docUri, @RequestParam(defaultValue = "final") String database, HttpServletResponse response) {
        try (OutputStream out = response.getOutputStream()) {
            response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
            response.addHeader("Content-Disposition", String.format("attachment; filename=%s", determineFilenameForDownload(docUri)));

            InputStreamHandle ins = getDatabaseClient(database).newDocumentManager()
                .read(docUri, new InputStreamHandle(), new ServerTransform("hubDownloadDocument"));
            FileCopyUtils.copy(ins.get(), out);

            response.flushBuffer();
        } catch (Exception e) {
            throw new RuntimeException(String.format("Unable to download record with URI: %s; cause: %s", docUri, e.getMessage()));
        }
    }

    protected String determineFilenameForDownload(String docUri) {
        String[] docUriArray = docUri.split("/");
        return docUriArray[docUriArray.length - 1];
    }

    private DatabaseClient getDatabaseClient(String database) {
        database = database != null ? database.toLowerCase() : "";
        switch (database) {
            case "staging":
                return getHubClient().getStagingClient();
            case "final":
                return getHubClient().getFinalClient();
            case "jobs":
                return getHubClient().getJobsClient();
            default:
                throw new IllegalArgumentException("Unrecognized database: " + database);
        }
    }
}
