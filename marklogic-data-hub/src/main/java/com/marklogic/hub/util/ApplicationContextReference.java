package com.marklogic.hub.util;


import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;

@Service
public class ApplicationContextReference implements ApplicationContextAware {
    private static ApplicationContext context;
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        context = applicationContext;
    }

    public ApplicationContext getApplicationContext(){
        return context;
    }

    public static <T> T getBean(Class<T> beanClass) {
        if(context != null) {
            return context.getBean(beanClass);
        }
        return null;
    }
}
