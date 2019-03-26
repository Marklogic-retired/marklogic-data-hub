import * as _ from "lodash";
import {Step} from "../../../models/step.model";

/**
 * Ingestion config model object
 */
export class Ingestion {

  inputFilePath: string;
  inputFileType: 'aggregates' | 'archive' | 'delimited_text' | 'delimited_json' | 'documents' | 'forest' | 'rdf' | 'sequencefile';
  outputCollections: string; // comma separated list of text
  outputPermissions: string; // comma separated list of text
  documentType: "json" | 'xml';
  transformModule: string;
  transformNamespace: string;
  transformParam: string; // comma separated list of text

  static fromConfig(step): Step {
    const config = step.config;
    const newStep = _.cloneDeep(step);
    const result = new Ingestion();
    result.inputFilePath = config['input_file_path'] || '.';
    result.inputFileType = config['input_file_type'] || 'documents';
    result.outputCollections = config['output_collections'] || '';
    result.outputPermissions = config['output_permissions'] || 'rest-reader,read,rest-writer,update';
    result.documentType = config['document_type'] || 'json';
    result.transformModule = config['transform_module'] || '/data-hub/5/transforms/mlcp-flow-transform.sjs';
    result.transformNamespace = config['transform_namespace'] || 'http://marklogic.com/data-hub/mlcp-flow-transform';
    result.transformParam = config['transform_param'] || '';
    newStep.config = result;
    return newStep;
  }

  static fromUI(form): Ingestion {
    return form.value;
  }
}
