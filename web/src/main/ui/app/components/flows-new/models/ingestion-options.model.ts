export class IngestionOptions {
  private inputFilePath: string;
  private inputFileType: string;
  private outputPermissions: string;
  private outputUriReplacement: string;
  private outputFileType: string;

  constructor(inputFilePath: string) {
    this.inputFilePath = inputFilePath;
    this.inputFileType = 'json';
    this.outputPermissions = 'rest-reader,read,rest-writer,update';
    this.outputUriReplacement = '';
    this.outputFileType = 'json';
  }
}
