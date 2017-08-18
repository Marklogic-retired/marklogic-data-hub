package com.marklogic.hub.util;

import com.marklogic.hub.flow.FlowStatusListener;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MlcpConsumer implements Consumer<String> {
    private int currentPc = 0;
    private final Pattern completedPattern = Pattern.compile("^.+completed (\\d+)%$");
    private final Pattern successfulEventsPattern = Pattern.compile("^.+OUTPUT_RECORDS_COMMITTED:\\s+(\\d+).*$");
    private final Pattern failedEventsPattern = Pattern.compile("^.+OUTPUT_RECORDS_FAILED\\s+(\\d+).*$");
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
        Matcher m = completedPattern.matcher(status);
        if (m.matches()) {
            int pc = Integer.parseInt(m.group(1));

            // don't send 100% because more stuff happens after 100% is reported here
            if (pc > currentPc && pc != 100) {
                currentPc = pc;
            }
        }

        m = successfulEventsPattern.matcher(status);
        if (m.matches()) {
            successfulEvents.addAndGet(Long.parseLong(m.group(1)));
        }

        m = failedEventsPattern.matcher(status);
        if (m.matches()) {
            failedEvents.addAndGet(Long.parseLong(m.group(1)));
        }

        statusListener.onStatusChange(jobId, currentPc, status);
    }
}
