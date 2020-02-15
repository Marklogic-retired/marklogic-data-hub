package com.marklogic.hub.oneui.utils;

import ch.qos.logback.core.Appender;
import ch.qos.logback.core.Context;
import ch.qos.logback.core.LogbackException;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;
import ch.qos.logback.core.status.Status;
import java.util.List;

public interface TestLoggingAppender<ILoggingEvent> extends Appender<ILoggingEvent> {
    @Override
    public default String getName() {
        return null;
    }

    @Override
    public default void doAppend(ILoggingEvent event) throws LogbackException {

    }

    @Override
    public default void setName(String name) {
    }

    @Override
    public default void setContext(Context context) {
    }

    @Override
    public default Context getContext() {
        return null;
    }

    @Override
    public default void addStatus(Status status) {
    }

    @Override
    public default void addInfo(String msg) {
    }

    @Override
    public default void addInfo(String msg, Throwable ex) {

    }

    @Override
    public default void addWarn(String msg) {
    }

    @Override
    public default void addWarn(String msg, Throwable ex) {
    }

    @Override
    public default void addError(String msg) {
    }

    @Override
    public default void addError(String msg, Throwable ex) {
    }

    @Override
    public default void addFilter(Filter newFilter) {
    }

    @Override
    public default void clearAllFilters() {
    }

    @Override
    public default List<Filter<ILoggingEvent>> getCopyOfAttachedFiltersList() {
        return null;
    }

    @Override
    public default FilterReply getFilterChainDecision(ILoggingEvent event) {
        return null;
    }

    @Override
    public default void start() {
    }

    @Override
    public default void stop() {
    }

    @Override
    public default boolean isStarted() {
        return false;
    }
}
