/*
 * Copyright 2012-2016 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
