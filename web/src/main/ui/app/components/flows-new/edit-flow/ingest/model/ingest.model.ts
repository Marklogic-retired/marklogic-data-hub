import * as _ from "lodash";
import {Step} from "../../../models/step.model";

/**
 * Ingestion config model object
 *
 * TODO: this should be a part of Step model. It does not make sense keep it separate
 */
export class Ingestion {

  inputFilePath: string;
  inputFileType: 'aggregates' | 'archive' | 'delimited_text' | 'delimited_json' | 'documents' | 'forest' | 'rdf' | 'sequencefile';
  outputCollections: string; // comma separated list of text
  outputPermissions: string; // comma separated list of text
  documentType: "json" | 'xml';
  transformModule: string;
  transformNamespace: string;
  transformParams: string; // comma separated list of text

  static fromConfig(step): Step {
    const options = step.options;
    const newStep = _.cloneDeep(step);
    const result = new Ingestion();
    result.inputFilePath = options && options['input_file_path'] || '.';
    result.inputFileType = options && options['input_file_type'] || 'documents';
    result.outputCollections = options && options['output_collections'] || '';
    result.outputPermissions = options && options['output_permissions'] || 'rest-reader,read,rest-writer,update';
    result.documentType = options && options['document_type'] || 'json';
    result.transformModule = options && options['transform_module'] || '/data-hub/5/transforms/mlcp-flow-transform.sjs';
    result.transformNamespace = options && options['transform_namespace'] || 'http://marklogic.com/data-hub/mlcp-flow-transform';
    result.transformParams = options && options['transform_param'] || '';
    newStep.config = result;
    return newStep;
  }

  static fromUI(input: Step): Step {
    const options: any = {};
    options['input_file_path'] = input.options['inputFilePath'];
    options['input_file_type'] = input.options['inputFileType'];
    options['output_collections'] = input.options['outputCollections'];
    options['output_permissions'] = input.options['outputPermissions'];
    options['document_type'] = input.options['documentType'];
    options['transform_module'] = input.options['transformModule'];
    options['transform_namespace'] = input.options['transformNamespace'];
    options['transform_param'] = input.options['transformParams'];
    const newStep = _.cloneDeep(input);
    newStep.options = options;
    return newStep;
  }
}
