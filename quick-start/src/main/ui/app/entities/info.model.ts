import { Serializable } from '../common/serializable';

export class InfoType extends Serializable {
  title: string;
  version: string;
  baseUri: string;
  description: string;
}
