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
    
    private Map<BigInteger, Task> taskMap = Collections.synchronizedMap(new HashMap<>());
    
    public TaskManagerService() {
    }
    
    public BigInteger addTask(Runnable runnable) {
        BigInteger taskId = fetchNextTaskId();
        
        Task task = new Task(runnable);
        taskMap.put(taskId, task);
        
        executorService.submit(task);
        
        return taskId;
    }
    
    public Object waitTask(BigInteger taskId) {
        Task task = taskMap.get(taskId);
        if (task != null) {
            return task.awaitCompletion();
        }
        
        return null;
    }
    
    public void stopTask(BigInteger taskId) {
        Task task = taskMap.get(taskId);
        if (task != null) {
            task.stopOrCancelTask();
        }
    }
    
    public void removeTask(BigInteger taskId) {
        taskMap.remove(taskId);
    }
    
    public boolean isTaskFinished(BigInteger taskId) {
        Task task = taskMap.get(taskId);
        return task == null;
    }
    
    protected synchronized BigInteger fetchNextTaskId() {
        this.lastTaskId = lastTaskId.add(BigInteger.ONE);
        return lastTaskId;
    }
    
    private class Task extends Thread {
        
        private Runnable runnable;
        
        private BasicFuture<Object> taskResult = new BasicFuture<>(null);

        public Task(Runnable runnable) {
            this.runnable = runnable;
        }
        
        public void stopOrCancelTask() {
            // flag cancellation
            // this will notify anyone waiting for this task
            taskResult.cancel();
            
            // interrupt this thread to stop further execution
            this.interrupt();
        }
        
        public Object awaitCompletion() {
            try {
                return taskResult.get();
            } catch (InterruptedException e) {
                return null;
            } catch (ExecutionException e) {
                return null;
            }
        }
        
        @Override
        public void run() {
            try {
                if (!taskResult.isDone()) {
                    runnable.run();
                    
                    // the task has completed
                    taskResult.completed(null);
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
