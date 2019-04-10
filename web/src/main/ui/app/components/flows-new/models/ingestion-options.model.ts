export class IngestionOptions {
  public inputFilePath: string = '.'; // Project directory
  public inputFileType: string = 'json';
  public outputPermissions: string = 'rest-reader,read,rest-writer,update';
  public outputUriReplacement: string = '';
  public outputFileType: string = 'json';

  set projectDirectory(directory: string) {
    this.inputFilePath = directory;
  }
}
