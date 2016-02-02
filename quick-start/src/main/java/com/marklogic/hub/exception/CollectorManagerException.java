package com.marklogic.hub.exception;

public class CollectorManagerException extends RuntimeException {

	private static final long serialVersionUID = 6669067810870196587L;

	public CollectorManagerException(String message, Throwable cause) {
		super("Error in connecting to the Collector Manager API with the following message: " + message, cause);
	}
}
