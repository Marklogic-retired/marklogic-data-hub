export class IngestionOptions {
  public inputFilePath: string = '.';
  public inputFileType: string = 'json';
  public outputPermissions: string = 'rest-reader,read,rest-writer,update';
  public outputUriReplacement: string = '';
  public outputFileType: string = 'json';
}
