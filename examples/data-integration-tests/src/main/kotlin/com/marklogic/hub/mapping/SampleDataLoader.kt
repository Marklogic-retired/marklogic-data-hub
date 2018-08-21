package com.marklogic.hub.mapping

import com.marklogic.client.DatabaseClient
import com.marklogic.client.document.JSONDocumentManager
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.client.io.FileHandle
import com.marklogic.hub.HubConfig
import com.marklogic.hub.HubConfigBuilder
import org.springframework.core.io.ClassPathResource
import java.io.File
import java.nio.file.Paths


/* this class was just a utility to make JSON our of XML superstore docs.  It's a throw-away */
class SampleDataLoader {


    fun run() {
        loadData()
        //loadModels()
    }

    fun loadModels() {
        var writeSet = jsonDocumentManager.newWriteSet();
        val jsonLoc = ClassPathResource("integration-data/models")
        val metadata = DocumentMetadataHandle().withCollections("sample-harmonization-models", "http://marklogic.com/entity-services/models")
        jsonLoc.file.walk().forEach {
            if (!it.isFile()) {
                //
            } else {
                val docUri = "/sample-hamonization-models/" + it.getName()
                writeSet.add(docUri, metadata, FileHandle(it));
            }
        }
        jsonDocumentManager.write(writeSet);
    }

    fun loadData() {
        var writeSet = jsonDocumentManager.newWriteSet();
        val jsonLoc = "input"
        val metadata = DocumentMetadataHandle().withCollections("test-input-data")
        File(jsonLoc).walk().forEach {
            if (!it.isFile()) {
                //
            } else {
                val docUri = "/sample-input-data/" + it.getName()
                writeSet.add(docUri, metadata, FileHandle(it));
            }
        }
        jsonDocumentManager.write(writeSet);
    }

    companion object {

        lateinit var hubConfig : HubConfig

        lateinit var client : DatabaseClient

        lateinit var jsonDocumentManager : JSONDocumentManager

        @JvmStatic
        val testProjectDir = Paths.get(".")

        @JvmStatic
        fun main(args: Array<String>) {

            hubConfig = HubConfigBuilder.newHubConfigBuilder(testProjectDir.toString())
                .withPropertiesFromEnvironment("local")
                .build();
            client = hubConfig.newStagingClient()
            jsonDocumentManager = client.newJSONDocumentManager()

            SampleDataLoader().run()

        }
    }
}
