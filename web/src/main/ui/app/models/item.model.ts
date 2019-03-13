import { Serializable } from '../utils/serializable';

export class ItemType extends Serializable {
  $ref: string;
  datatype: string;
  collation: string;
}
