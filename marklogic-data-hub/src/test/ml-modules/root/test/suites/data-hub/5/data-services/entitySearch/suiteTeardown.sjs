declareUpdate();

xdmp.collectionDelete("doc1");
xdmp.collectionDelete("doc2");
xdmp.documentDelete('/entities/NumericEntity.entity.json');
xdmp.documentDelete('/entities/NumericStringEntity.entity.json');
xdmp.documentDelete('/entities/EntitySearchEntity.entity.json');