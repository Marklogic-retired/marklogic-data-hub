package com.marklogic.hub.test;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.impl.HubConfigImpl;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Used to proxy HubConfigImpl in tests so that tests can depend on e.g. an Autowired HubConfigImpl, but in reality
 * they're using a HubConfigImpl that is from the object pool created by HubConfigObjectFactory, where each HubConfigImpl
 * is tied to a different host.
 */
public class HubConfigInterceptor extends LoggingObject implements MethodInterceptor {

    private Map<String, HubConfigImpl> threadToHubConfigMap = new ConcurrentHashMap<>();
    private ObjectPool<HubConfigImpl> hubConfigPool;
    private HubConfigObjectFactory hubConfigObjectFactory;

    public HubConfigInterceptor(HubConfigObjectFactory hubConfigObjectFactory) {
        this.hubConfigObjectFactory = hubConfigObjectFactory;
        GenericObjectPoolConfig<HubConfigImpl> objectPoolConfig = new GenericObjectPoolConfig<>();
        objectPoolConfig.setMaxTotal(hubConfigObjectFactory.getHostCount());
        this.hubConfigPool = new GenericObjectPool<>(hubConfigObjectFactory, objectPoolConfig);
    }

    public void borrowHubConfig(String threadName) {
        if (!threadToHubConfigMap.containsKey(threadName)) {
            try {
                HubConfigImpl hubConfig = hubConfigPool.borrowObject();
                threadToHubConfigMap.put(threadName, hubConfig);
            } catch (Exception e) {
                throw new RuntimeException("Unable to claim HubConfig, cause: " + e.getMessage(), e);
            }
        }
    }

    public void returnHubConfig(String threadName) {
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

    public HubConfigObjectFactory getHubConfigObjectFactory() {
        return hubConfigObjectFactory;
    }
}
