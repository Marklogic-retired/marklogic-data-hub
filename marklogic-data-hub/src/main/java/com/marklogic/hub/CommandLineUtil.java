package com.marklogic.hub;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CommandLineUtil {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(CommandLineUtil.class);

    @SuppressWarnings("rawtypes")
    public static void executeMethod(String className, String methodName, Object... params) 
            throws Exception {
        List<Class> parameterTypeList = null;
        Class[] parameterTypes = null;
        if(params != null && params.length > 0) {
            parameterTypeList = new ArrayList<Class>();
            for (Object param : params) {
                parameterTypeList.add(param.getClass());
            }
            parameterTypes = parameterTypeList.toArray(new Class[params.length]);
        }
        
        Class<?> c = Class.forName(className);
        Object instance = c.newInstance();
        java.lang.reflect.Method method = c.getMethod(methodName, parameterTypes);
        method.invoke(instance, params);
    }
    
    public static void main(String[] args) throws Exception {
        Object[] params = null;
        if(args.length > 2) {
            params = new Object[]{args[2]};
        }
        CommandLineUtil.executeMethod(args[0], args[1], params);
    }
}
