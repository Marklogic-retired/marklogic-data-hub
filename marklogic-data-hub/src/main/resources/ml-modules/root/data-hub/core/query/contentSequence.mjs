export class ContentSequence {
  constructor(content, options = ["unfiltered", "score-zero", "document", "unfaceted"]) {
    if (content instanceof cts.query) {
      this.documents = cts.search(content, options, 0);
    } else if (content[Symbol.iterator]) {
      this.documents = content;
    } else {
      this.documents = [content];
    }
    this.contentArray = [];
    this.completedAnIteration = false;
  }

  *[Symbol.iterator]() {
    let index = 0;
    for (const document of this.documents) {
      if (!this.contentArray[index]) {
        this.contentArray[index] = {
          uri: xdmp.nodeUri(document),
          value: document,
          context: {
            collections: xdmp.nodeCollections(document),
            permissions: xdmp.nodePermissions(document),
            metadata: xdmp.nodeMetadata(document)
          }
        };
      }
      yield this.contentArray[index];
      index++;
    }
    this.completedAnIteration = true;
  }

  toArray() {
    if (!this.completedAnIteration) {
      for (const c of this) { /* iterating over the Sequence to ensure the array is populated */ }
    }
    return this.contentArray;
  }
}

export default {ContentSequence} ;
