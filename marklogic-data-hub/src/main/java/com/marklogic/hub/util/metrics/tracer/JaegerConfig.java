package com.marklogic.hub.util.metrics.tracer;

import io.jaegertracing.Configuration;
import io.jaegertracing.Configuration.ReporterConfiguration;
import io.jaegertracing.Configuration.SamplerConfiguration;
import io.jaegertracing.internal.samplers.ConstSampler;
import io.opentracing.Scope;
import io.opentracing.Span;
import io.opentracing.Tracer;
import io.opentracing.Tracer.SpanBuilder;
import io.opentracing.util.GlobalTracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JaegerConfig {
    private static final Logger logger = LoggerFactory.getLogger(JaegerConfig.class);

    /**
     * Returns the currently configured tracer
     * @return a tracer
     */
    public static Tracer getTracer() {
        return GlobalTracer.get();
    }

    /**
     * Returns true when tracing is configured
     * to report spans vs just producing a noop.
     * @return tracer is registered or not
     */
    public static boolean enabled() {
        return GlobalTracer.isRegistered();
    }

    /**
     * Make a {@link Span} instance active for the current context (usually a thread).
     * This is a shorthand for {@code Tracer.scopeManager().activate(span)}.
     * @param span the built span
     * @return a {@link Scope} instance to control the end of the active period for the {@link Span}.
     */
    public static Scope activate(Span span) {
        return getTracer().activateSpan(span);
    }

    /**
     * @return the active {@link Span}. This is a shorthand for {@code Tracer.scopeManager().activeSpan()}
     */
    public static Span activeSpan() {
        return getTracer().scopeManager().activeSpan();
    }

    /**
     * Builds a child span with the current class and method name
     * @param enclosed a type created in the current method scope
     * @param parentSpan parent span of the built span
     * @return a span builder
     */
    public static SpanBuilder buildSpanFromMethod(Object enclosed, Span parentSpan) {
        return buildSpanFromMethod(enclosed).asChildOf(parentSpan);
    }

    /**
     * Builds a span with the operation name
     * @param operationName span operation name
     * @return a span builder
     */
    public static SpanBuilder buildSpan(String operationName) {
        return getTracer().buildSpan(operationName);
    }

    /**
     * Builds a span with the current class as the operation name.
     * Usage: {@code JaegerConfig.buildFromMethod(new Object(){})}
     * @param spanClass used to set the operation name.
     * @return a span builder
     */
    public static SpanBuilder buildSpan(Class spanClass) {
        return buildSpan(spanClass.getSimpleName());
    }

    /**
     * Builds a span with the current class and method name.
     * Usage: {@code JaegerConfig.buildFromMethod(new Object(){})}
     * @param enclosed a type created in the current method scope
     * @return a span builder
     */
    public static SpanBuilder buildSpanFromMethod(Object enclosed) {
        if (enclosed != null) {
            String className = enclosed.getClass().getEnclosingClass().getSimpleName();
            String methodName = enclosed.getClass().getEnclosingMethod() != null ? enclosed.getClass().getEnclosingMethod().getName() : "";
            return getTracer().buildSpan(String.format("%s.%s", className, methodName));
        } else {
            return getTracer().buildSpan("JaegerConfig.buildFromMethod");
        }
    }

    /**
     * Initialize a tracer
     * @param service a service name
     * @return a tracer
     */
    public static Tracer init(String service) {
        if (!GlobalTracer.isRegistered()) {
            SamplerConfiguration samplerConfig = SamplerConfiguration.fromEnv()
                .withType(ConstSampler.TYPE)
                .withParam(1);

            ReporterConfiguration reporterConfig = ReporterConfiguration.fromEnv()
                .withLogSpans(true);

            Configuration config = new Configuration(service)
                .withSampler(samplerConfig)
                .withReporter(reporterConfig);
            GlobalTracer.registerIfAbsent(config.getTracer());
        }
        return getTracer();
    }
}

