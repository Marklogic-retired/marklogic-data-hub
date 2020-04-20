package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class BuildAssetFileLoaderTest {

    @Test
    public void withCustomBatchSize() {
        LoadHubModulesCommand command = new LoadHubModulesCommand();

        AppConfig appConfig = new AppConfig();
        CommandContext context = new CommandContext(appConfig, null, null);

        TestAssetFileLoader loader = new TestAssetFileLoader(null);

        appConfig.setModulesLoaderBatchSize(7);
        command.prepareAssetFileLoader(loader, context);
        assertEquals(7, (int) loader.batchSize, "The batch size should now be 10; this gives the user a way to load hub " +
            "modules in small batches if loading them all in one batch fails, like due to a network issue");
    }
}

// This class is needed so we can inspect the value of batchSize, as AssetFileLoader doesn't have a getter for it
class TestAssetFileLoader extends AssetFileLoader {

    public Integer batchSize;

    public TestAssetFileLoader(DatabaseClient modulesDatabaseClient) {
        super(modulesDatabaseClient);
    }

    @Override
    public void setBatchSize(Integer batchSize) {
        this.batchSize = batchSize;
        super.setBatchSize(batchSize);
    }
}
