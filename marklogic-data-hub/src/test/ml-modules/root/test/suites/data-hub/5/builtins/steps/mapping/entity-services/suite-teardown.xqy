xquery version "1.0-ml";

(
  "/mappings/CustomersMapping/CustomersMapping-1.mapping.json",
  "/mappings/ItemsMapping/ItemsMapping-1.mapping.json",
  "/mappings/OrdersMapping/OrdersMapping-1.mapping.json",
  "/entities/CustomerType.entity.json",
  "/entities/ItemType.entity.json",
  "/entities/OrderType.entity.json"
) ! xdmp:document-delete(.)
