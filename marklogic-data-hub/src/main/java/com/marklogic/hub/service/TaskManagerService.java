package com.marklogic.hub.service;

import java.math.BigInteger;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.http.concurrent.BasicFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TaskManagerService {
    
    private final static Logger LOGGER = LoggerFactory.getLogger(TaskManagerService.class);
    
    private ExecutorService executorService = Executors.newCachedThreadPool();

    private BigInteger lastTaskId = BigInteger.ZERO;
    
    private Map<BigInteger, TaskWrapper> taskMap = Collections.synchronizedMap(new HashMap<>());
    
    public TaskManagerService() {
    }
    
    public BigInteger addTask(CancellableTask task) {
        BigInteger taskId = fetchNextTaskId();
        
        TaskWrapper taskRunner = new TaskWrapper(task);
        taskMap.put(taskId, taskRunner);
        
        executorService.submit(taskRunner);
        
        return taskId;
    }
    
    public Object waitTask(BigInteger taskId) throws Exception {
        TaskWrapper task = taskMap.get(taskId);
        if (task != null) {
            return task.awaitCompletion();
        }
        
        return null;
    }
    
    public void stopTask(BigInteger taskId) {
        TaskWrapper task = taskMap.get(taskId);
        if (task != null) {
            task.stopOrCancelTask();
        }
    }
    
    public void removeTask(BigInteger taskId) {
        taskMap.remove(taskId);
    }
    
    public boolean isTaskFinished(BigInteger taskId) {
        TaskWrapper task = taskMap.get(taskId);
        return task == null;
    }
    
    protected synchronized BigInteger fetchNextTaskId() {
        this.lastTaskId = lastTaskId.add(BigInteger.ONE);
        return lastTaskId;
    }
    
    private class TaskWrapper extends Thread {
        
        private CancellableTask task;
        
        private BasicFuture<Object> taskResult = new BasicFuture<>(null);

        public TaskWrapper(CancellableTask task) {
            this.task = task;
        }
        
        public void stopOrCancelTask() {
            task.cancel(taskResult);
            
            // flag cancellation
            // this will notify anyone waiting for this task
            taskResult.cancel();
        }
        
        public Object awaitCompletion() throws Exception {
            try {
                return taskResult.get();
            }
            catch (InterruptedException e) {
                throw new Exception(e.getMessage(), e);
            } catch (ExecutionException e) {
                throw new Exception(e.getMessage(), e);
            }
        }
        
        @Override
        public void run() {
            try {
                if (!taskResult.isDone()) {
                    task.run(taskResult);
                }
            }
            catch (Exception e) {
                LOGGER.error("Task encountered an error.", e);
                
                // the task has failed
                taskResult.failed(e);
            }
        }
    }
}
