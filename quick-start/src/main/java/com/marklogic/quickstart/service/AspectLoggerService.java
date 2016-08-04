package com.marklogic.quickstart.service;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import com.marklogic.hub.util.PerformanceLogger;

@Aspect
@Component
public class AspectLoggerService {

    @Around("execution(* com.marklogic.hub.*.*(..)) || execution(* com.marklogic.quickstart.*.*(..))")
    public Object logTimeInsideMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        Object retVal = joinPoint.proceed();

        PerformanceLogger.logTimeInsideMethod(startTime,
            joinPoint.getTarget().getClass().getName() + "." +
            joinPoint.getSignature().getName());

        return retVal;
    }
}
