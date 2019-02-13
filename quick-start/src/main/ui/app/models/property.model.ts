import { ItemType } from './item.model';
import { EntityConsts } from './entity-consts';

export enum Cardinality {
  ONE_TO_ONE,
  ONE_TO_MANY
}

export class PropertyType {
  name: string;
  datatype: string;
  description: string;

  // ui only
  showCollation: boolean = false;
  isPrimaryKey: boolean = false;
  hasElementRangeIndex: boolean = false;
  hasRangeIndex: boolean = false;
  hasWordLexicon: boolean = false;
  required: boolean = false;
  pii: boolean = false;

  UNICODE_COLLATION: string = 'http://marklogic.com/collation/codepoint';

  $ref: string;

  collation: string;

  items: ItemType;

  selected: boolean = false;
  connected: boolean = false;
  hovering: boolean = false;

  fromJSON(json) {
    this.name = json.name;
    this.datatype = json.datatype;
    this.description = json.description;
    this.$ref = json.$ref;
    this.collation = json.collation;
    this.items = new ItemType().fromJSON(json.items);

    return this;
  }

  setExternalRef(ref: string) {
    if (this.datatype === 'array') {
      if (!this.items) {
        this.items = new ItemType();
      }
      this.items.datatype = ref;
      this.items.$ref = ref;
    } else {
      this.datatype = null;
      this.$ref = ref;
      this.items = null;
    }
  }

  get isString(): boolean {
    return this.datatype === 'string' ||
      (this.datatype === 'array' && this.items.datatype === 'string');
  }

  get isArray(): boolean {
    return this.datatype === 'array';
  }

  get isRef(): boolean {
    return (
      (this.$ref && this.$ref.startsWith('#/definitions/')) ||
      (this.isArray && this.items.$ref && this.items.$ref.startsWith('#/definitions/'))
    );
  }

  get refName(): string {
    if (this.$ref && this.$ref.startsWith('#/definitions/')) {
      return this.$ref.replace('#/definitions/', '');
    } else if (this.isArray && this.items.$ref && this.items.$ref.startsWith('#/definitions/')) {
      return this.items.$ref.replace('#/definitions/', '');
    }

    return null;
  }

  setCardinality(cardinality: Cardinality) {
    if (cardinality === Cardinality.ONE_TO_ONE) {
      if (this.items.$ref) {
        this.$ref = this.items.$ref;
      } else if (this.items.datatype) {
        this.datatype = this.items.datatype;
        this.collation = this.items.collation;
      }

      this.items.datatype = null;
      this.items.collation = null;
      this.items.$ref = null;
    } else if (cardinality === Cardinality.ONE_TO_MANY) {
      if (!this.items) {
        this.items = new ItemType();
      }

      if (this.datatype && this.datatype !== 'array') {
        this.items.datatype = this.datatype;
        this.items.collation = this.collation;
      } else if (this.$ref) {
        this.items.$ref = this.$ref;
      }

      this.datatype = 'array';
      this.$ref = null;
      this.collation = null;
    }
  }

  getType(): string {
    let type = null;
    if (this.isArray) {
      type = (this.items.$ref || this.items.datatype) + '[]';
    } else {
      type = this.$ref || this.datatype;
    }
    if (type) {
      type = type.replace('#/definitions/', '');
    }
    return type;
  }

  setCollation(collation: string) {
    if (this.isArray) {
      this.items.collation = collation;
    } else {
      this.collation = collation;
    }
  }

  setType(type: string) {
    const isArray = this.isArray;
    if (isArray) {
      if (!this.items) {
        this.items = new ItemType();
      }
    }

    const isRef = type.startsWith('#/definitions/') ||
    EntityConsts.coreDataTypes.indexOf(type) < 0 && !isArray;

    if (isArray && isRef) {
      this.$ref = null;
      this.collation = null;
      this.items.$ref = type;
      this.items.datatype = null;
      this.items.collation = null;
    } else if (isRef) {
      this.$ref = type;
      this.datatype = null;
      if (this.items) {
        this.items.$ref = null;
        this.items.datatype = null;
        this.items.collation = null;
      }
    } else if (isArray) {
      this.$ref = null;
      this.collation = null;
      this.items.datatype = type;
      if (this.items.datatype === 'string' && !this.items.collation) {
        this.items.collation = this.UNICODE_COLLATION;
      }

      this.items.$ref = null;
    } else {
      this.datatype = type;
      if (this.datatype === 'string' && !this.collation) {
        this.collation = this.UNICODE_COLLATION;
      }
      this.$ref = null;
      if (this.items) {
        this.items.$ref = null;
        this.items.datatype = null;
        this.items.collation = null;
      }
    }
  }

  get validString(): boolean
  {
    if(this.name && this.name.trim().length > 1 && this.name.indexOf(" ") === -1)
    {
      return true;
    }
    return false;
  }
}
