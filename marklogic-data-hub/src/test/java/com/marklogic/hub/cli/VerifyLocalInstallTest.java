package com.marklogic.hub.cli;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class VerifyLocalInstallTest extends HubTestBase {

    @Test
    public void test() {
        Options options = new Options();
        options.setProjectPath(PROJECT_PATH);

        // If this fails, an exception will be thrown
        new VerifyLocalDhfCommand(adminHubConfig).run(options);
    }
}
