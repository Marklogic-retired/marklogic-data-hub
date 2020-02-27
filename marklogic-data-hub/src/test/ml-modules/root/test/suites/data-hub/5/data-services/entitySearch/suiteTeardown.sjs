declareUpdate();

xdmp.collectionDelete("doc1");
xdmp.collectionDelete("doc2");
xdmp.documentDelete('/entities/NumericEntity.entity.json');
xdmp.documentDelete('/entities/NumStringEntity.entity.json');
xdmp.documentDelete('/entities/EntitiesSearchEntity.entity.json');