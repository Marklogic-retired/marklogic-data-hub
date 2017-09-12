package com.marklogic.hub.util;

import com.marklogic.hub.flow.FlowStatusListener;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MlcpConsumer implements Consumer<String> {
    private int currentPc = 0;
    private static final Pattern COMPLETED_PATTERN = Pattern.compile("^.+completed (\\d+)%$");
    private static final Pattern SUCCESSFUL_EVENTS_PATTERN = Pattern.compile("^.+OUTPUT_RECORDS_COMMITTED:\\s+(\\d+).*$");
    private static final Pattern FAILED_EVENTS_PATTERN = Pattern.compile("^.+OUTPUT_RECORDS_FAILED\\s+(\\d+).*$");
    private AtomicLong successfulEvents;
    private AtomicLong failedEvents;
    private FlowStatusListener statusListener;
    private String jobId;

    public MlcpConsumer(AtomicLong successfulEvents, AtomicLong failedEvents, FlowStatusListener statusListener,
                        String jobId)
    {
        this.successfulEvents = successfulEvents;
        this.failedEvents = failedEvents;
        this.statusListener = statusListener;
        this.jobId = jobId;
    }

    @Override
    public void accept(String status) {
        Matcher m = COMPLETED_PATTERN.matcher(status);
        if (m.matches()) {
            int pc = Integer.parseInt(m.group(1));

            // don't send 100% because more stuff happens after 100% is reported here
            if (pc > currentPc && pc != 100) {
                currentPc = pc;
            }
        }

        m = SUCCESSFUL_EVENTS_PATTERN.matcher(status);
        if (m.matches()) {
            successfulEvents.addAndGet(Long.parseLong(m.group(1)));
        }

        m = FAILED_EVENTS_PATTERN.matcher(status);
        if (m.matches()) {
            failedEvents.addAndGet(Long.parseLong(m.group(1)));
        }

        if (statusListener != null) {
            statusListener.onStatusChange(jobId, currentPc, status);
        }
    }
}
