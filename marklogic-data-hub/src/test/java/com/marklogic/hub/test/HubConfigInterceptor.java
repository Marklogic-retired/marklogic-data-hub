package com.marklogic.hub.test;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.impl.HubConfigImpl;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.pool2.ObjectPool;

import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

public class HubConfigInterceptor extends LoggingObject implements MethodInterceptor {

    private Map<String, HubConfigImpl> threadToHubConfigMap = new ConcurrentHashMap<>();
    private ObjectPool<HubConfigImpl> hubConfigPool;
    private Properties gradleProperties;

    public HubConfigInterceptor(ObjectPool<HubConfigImpl> hubConfigPool, Properties gradleProperties) {
        this.hubConfigPool = hubConfigPool;
        this.gradleProperties = gradleProperties;
    }

    public void claimHubConfig(String threadName) {
        if (!threadToHubConfigMap.containsKey(threadName)) {
            try {
                HubConfigImpl hubConfig = hubConfigPool.borrowObject();
                logger.info("Claimed HubConfigImpl, host: " + hubConfig.getHost());
                threadToHubConfigMap.put(threadName, hubConfig);
            } catch (Exception e) {
                throw new RuntimeException("Unable to claim HubConfig, cause: " + e.getMessage(), e);
            }
        }
    }

    public void releaseHubConfig(String threadName) {
        if (threadToHubConfigMap.containsKey(threadName)) {
            HubConfigImpl borrowedHubConfig = threadToHubConfigMap.get(threadName);
            threadToHubConfigMap.remove(threadName);
            try {
                hubConfigPool.returnObject(borrowedHubConfig);
            } catch (Exception e) {
                logger.warn("Unable to return HubConfigImpl: " + e.getMessage());
            }
        }
    }

    public HubConfigImpl getProxiedHubConfig(String threadName) {
        return threadToHubConfigMap.get(threadName);
    }

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        HubConfigImpl hubConfig = threadToHubConfigMap.get(Thread.currentThread().getName());
        return invocation.getMethod().invoke(hubConfig, invocation.getArguments());
    }

    public Properties getGradleProperties() {
        return gradleProperties;
    }
}
