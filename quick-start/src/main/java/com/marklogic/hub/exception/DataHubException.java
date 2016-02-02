package com.marklogic.hub.exception;

public class DataHubException extends RuntimeException {

	private static final long serialVersionUID = 4824858930318275798L;

	public DataHubException(String message, Throwable cause) {
		super("Error in connecting to the Data Hub API with the following message: " + message, cause);
	}
}
