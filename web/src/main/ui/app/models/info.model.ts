import { Serializable } from '../utils/serializable';

export class InfoType extends Serializable {
  title: string;
  version: string;
  baseUri: string;
  description: string;
}
