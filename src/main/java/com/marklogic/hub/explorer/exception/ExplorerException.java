/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.exception;

public class ExplorerException extends RuntimeException {

  public int statusCode;
  public String error;

  public ExplorerException(int statusCode, String error, String message, Throwable cause) {
    this(message, cause);
    this.statusCode = statusCode;
    this.error = error;
  }

	public ExplorerException(String message, Throwable cause) {
		super(message, cause);
	}
}
