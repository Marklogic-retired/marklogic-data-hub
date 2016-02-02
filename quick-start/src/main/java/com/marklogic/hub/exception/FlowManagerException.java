package com.marklogic.hub.exception;

public class FlowManagerException extends RuntimeException {

	private static final long serialVersionUID = 4767780854692156195L;

	public FlowManagerException(String message, Throwable cause) {
		super("Error in connecting to the Flow Manager API with the following message: " + message, cause);
	}
}
