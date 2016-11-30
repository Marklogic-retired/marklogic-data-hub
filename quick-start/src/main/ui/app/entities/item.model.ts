import { Serializable } from '../common/serializable';

export class ItemType extends Serializable {
  $ref: string;
  datatype: string;
  collation: string;
}
