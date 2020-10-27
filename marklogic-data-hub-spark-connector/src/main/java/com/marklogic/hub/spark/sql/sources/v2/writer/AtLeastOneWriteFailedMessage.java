package com.marklogic.hub.spark.sql.sources.v2.writer;

import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;

/**
 * Indicates that at least one write failed, which allows the DataSourceWriter to know whether the job finished with or
 * without errors.
 */
public class AtLeastOneWriteFailedMessage implements WriterCommitMessage {
}
