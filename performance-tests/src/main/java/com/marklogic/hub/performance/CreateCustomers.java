package com.marklogic.hub.performance;

import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.io.Format;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;

/**
 * Creates some simple customers using the Customer and ReferenceModelProject helper classes.
 */
public class CreateCustomers {

    private final static Logger logger = LoggerFactory.getLogger(CreateCustomers.class);

    public static void main(String[] args) {
        if (args.length != 1) {
            throw new RuntimeException("Expecting a single argument specifying the number of customers to create");
        }

        final int customerCount = Integer.parseInt(args[0]);
        logger.info("Will create " + customerCount + " customer instances");

        HubClient client = HubClient.withHubClientConfig(new HubClientConfig(System.getProperties()));
        DataMovementManager mgr = client.getFinalClient().newDataMovementManager();
        WriteBatcher writeBatcher = mgr.newWriteBatcher();
        mgr.startJob(writeBatcher);
        
        ReferenceModelProject project = new ReferenceModelProject(client);
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        for (int i = 1; i <= customerCount; i++) {
            Customer c = new Customer(i, "Jane" + i);
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_YEAR, -i);
            c.setCustomerSince(dateFormat.format(cal.getTime()));
            writeBatcher.add(project.buildCustomerInstanceToWrite(c, Format.JSON, null));
        }

        writeBatcher.flushAndWait();
        writeBatcher.awaitCompletion();
        mgr.stopJob(writeBatcher);

        logger.info("Created " + customerCount + " customer instances in the final database");
    }
}
