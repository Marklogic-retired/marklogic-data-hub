/**
 * Main function in this library for validating an entity. If any validation errors are found and the "validateEntity"
 * is set to "accept", then errors will be added to the options object under the "headers.datahub.validationErrors" key.
 * This allows for them to be added to the envelope for an entity.
 *
 * If "validateEntity" is set to "reject", then an error will be thrown by this function.
 *
 * @param newInstance
 * @param options
 * @param entityInfo
 */
function validateEntity(newInstance, options = {}, entityInfo) {
  if (shouldValidateEntity(options)) {
    let value = fn.string(options.validateEntity).toLowerCase();
    if ("xml" == options.outputFormat) {
      validateXmlEntity(newInstance, options, value);
    } else {
      validateJsonEntity(newInstance, options, value, entityInfo);
    }
  }
}

function shouldValidateEntity(options = {}) {
  let value = options.validateEntity;
  if (value != null && value != undefined) {
    value = fn.string(value).toLowerCase();
    return value == "accept" || value == "reject";
  }
  return false;
}

function validateJsonEntity(newInstance, options = {}, validateEntityValue, entityInfo) {
  // As of 5.1.0, this is safe to do. But eventually, we'll want to find a schema by querying the schema database, or,
  // better yet, via some API function call that does the work for us.
  const entitySchemaUri = "/entities/" + entityInfo.title + ".entity.schema.json";
  try {
    xdmp.jsonValidate(newInstance, entitySchemaUri, ["full"]);
  } catch (e) {
    if ("accept" == validateEntityValue) {
      if (options.headers == null) {
        options.headers = {};
      }
      if (options.headers.datahub == null) {
        options.headers.datahub = {};
      }

      // Tossing information about the errors in the headers so that they're added to the envelope.
      // Note that regardless of the number of errors, xdmp.jsonValidate will return all of them in a "data" array, with
      // each array item being a string.
      options.headers.datahub.validationErrors = {
        "name": e.name,
        "data": e.data,
        "message": e.message,
        "formattedMessages": []
      }

      for (let errorMessage of e.data) {
        let formattedErrorMessage = formatErrorMessageForJson(errorMessage.toString());
        if (formattedErrorMessage == null) {
          formattedErrorMessage = {
            message : errorMessage.trim()
          };
        }
        options.headers.datahub.validationErrors.formattedMessages.push(formattedErrorMessage);
      }
    } else if ("reject" == validateEntityValue) {
      throw Error(e);
    }
  }
}

/**
 * Attempts to format the given error message into a JSON object with a propertyName and a message that is friendlier to
 * a human. Only supports "Missing property: Required" messages so far.
 */
function formatErrorMessageForJson(errorMessage) {
  const missingMessage = "Missing property: Required";
  let pos = errorMessage.indexOf(missingMessage);
  let formattedErrorMessage = null;
  if (pos > -1) {
    errorMessage = errorMessage.substring(pos + missingMessage.length).trim();
    pos = errorMessage.indexOf("not found");
    if (pos > -1) {
      errorMessage = errorMessage.substring(0, pos + "not found".length);
      let propertyName = errorMessage.split(" ")[0];
      formattedErrorMessage = {
        propertyName: propertyName,
        message: "Required " + errorMessage
      };
    }
  }
  return formattedErrorMessage;
}

function validateXmlEntity(newInstance, options = {}, validateEntityValue) {
  const result = fn.head(xdmp.xqueryEval(
    'declare variable $newInstance external; xdmp:validate($newInstance, "strict")',
    {newInstance: newInstance}
  ));

  if (result != null) {
    let errorCount = result.xpath("count(/*:error)");
    if (errorCount > 0) {
      if ("accept" == validateEntityValue) {
        if (options.headers == null) {
          options.headers = {};
        }
        if (options.headers.datahub == null) {
          options.headers.datahub = {};
        }
        options.headers.datahub.validationErrors = [];

        for (error of result.xpath("/*:error")) {
          let validationError = {
            error : {
              code: fn.string(error.xpath("./*:code/text()")),
              name: fn.string(error.xpath("./*:name/text()")),
              message: fn.string(error.xpath("./*:message/text()")),
              formatString: fn.string(error.xpath("./*:format-string/text()"))
            }
          };
          addFormattedMessagesForXml(validationError);
          options.headers.datahub.validationErrors.push(validationError);
        }
      } else if ("reject" == validateEntityValue) {
        throw Error(result);
      }
    }
  }
}

function addFormattedMessagesForXml(validationError) {
  if (validationError.error.code == "XDMP-VALIDATEMISSINGELT") {
    buildFormattedMessagesForMissingElementsError(validationError);
  }
  else if (validationError.error.code == "XDMP-VALIDATEUNEXPECTED") {
    buildFormattedMessagesForUnexpectedNodeError(validationError);
  }
}

/**
 * Example of what the formatString is expected to contain: "Missing required elements Expected (LastName,Email?)"
 *
 * @param validationError
 */
function buildFormattedMessagesForMissingElementsError(validationError = {}) {
  if (validationError.error != null) {
    let formatString = validationError.error.formatString;
    let indicator = "Expected (";
    let pos = formatString.indexOf(indicator);
    if (pos > -1) {
      let str = formatString.substring(pos + indicator.length);
      pos = str.indexOf(")");
      if (pos > -1) {
        str = str.substring(0, pos);
        let names = str.split(",");
        let notRequiredPos = names.findIndex(val => val.endsWith("?"));
        if (notRequiredPos > -1) {
          validationError.error.formattedMessages = buildFormattedMessagesForMissingXmlPropertyNames(names.slice(0, notRequiredPos))
        }
      }
    }
  }
}

/**
 * Example of what the formatString is expected to contain: "Invalid node: Found LastName but expected (FirstName,LastName,Email?)"
 *
 * @param validationError
 */
function buildFormattedMessagesForUnexpectedNodeError(validationError = {}) {
  if (validationError.error != null) {
    let formatString = validationError.error.formatString;
    let indicator = "Invalid node: Found ";
    let pos = formatString.indexOf(indicator);
    if (pos > -1) {
      let str = formatString.substring(pos + indicator.length);
      let tokens = str.split(" ");
      let foundPropertyName = tokens[0];
      let propertyNames = tokens[3].substring(1, tokens[3].length - 1).split(",");
      let notRequiredPos = propertyNames.findIndex(val => val == foundPropertyName);
      if (notRequiredPos > -1) {
        validationError.error.formattedMessages = buildFormattedMessagesForMissingXmlPropertyNames(propertyNames.slice(0, notRequiredPos))
      }
    }
  }
}

/**
 * Convenience function for building an object per missing property name.
 *
 * @param missingPropertyNames
 */
function buildFormattedMessagesForMissingXmlPropertyNames(missingPropertyNames) {
  return {
    formattedMessage:
      missingPropertyNames.map(name => {
        return {
          propertyName: name,
          message: "Required " + name + " property not found"
        };
      })
  };
}

/**
 * In order for the validation errors to be added to the envelope of an entity, they must be in the options object. But
 * that options object will be shared across the processing of multiple entities. So after the entity envelope has been
 * constructed, the validationErrors need to be removed.
 *
 * @param options
 */
function removeValidationErrorsFromHeaders(options = {}) {
  if (options.headers != null && options.headers.datahub != null && options.headers.datahub.validationErrors != null) {
    delete options.headers.datahub.validationErrors;
    let datahub = options.headers.datahub;
    if (Object.keys(datahub).length == 0) {
      delete options.headers.datahub;
    }
  }
}

module.exports = {
  removeValidationErrorsFromHeaders,
  shouldValidateEntity,
  validateEntity
};
