package com.marklogic.hub.service;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import com.marklogic.hub.util.PerformanceLogger;

@Aspect
@Component
public class AspectLoggerService {

    @Around("execution(* com.marklogic.hub..*.*(..))")
    public Object logTimeInsideMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        StopWatch stopWatch = PerformanceLogger.monitorTimeInsideMethod();
        
        Object retVal = joinPoint.proceed();
        
        PerformanceLogger.logTimeInsideMethod(stopWatch, joinPoint.getTarget().getClass().getName(), 
                joinPoint.getSignature().getName(), joinPoint.getArgs());
        
        return retVal;
    }
}
