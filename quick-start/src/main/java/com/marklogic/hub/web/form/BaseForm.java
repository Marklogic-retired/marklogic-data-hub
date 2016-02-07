package com.marklogic.hub.web.form;

import java.util.ArrayList;
import java.util.List;

public class BaseForm {

	private boolean hasErrors;
	private List<String> errors = new ArrayList<String>();
	
	public boolean isHasErrors() {
		return hasErrors;
	}
	public void setHasErrors(boolean hasErrors) {
		this.hasErrors = hasErrors;
	}
	public List<String> getErrors() {
		return errors;
	}
	public void setErrors(List<String> errors) {
		this.errors = errors;
	}
	
	
	
	
}
