xquery version "1.0-ml";

module namespace partition = "org:example:partition";

import module namespace op = "http://marklogic.com/optic" at "/MarkLogic/optic.xqy";
import module namespace ofn = "http://marklogic.com/optic/expression/fn" at "/MarkLogic/optic/optic-fn.xqy";
import module namespace osql = "http://marklogic.com/optic/expression/sql" at "/MarkLogic/optic/optic-sql.xqy";

(:
Returns an "initial" set of partitions that just define a min and max for each partition. This is implemented in
XQuery to avoid any problems with handling unsignedLong's.
:)
declare function build-initial-partitions($partition-count as xs:integer) as json:array
{
  let $partitions := json:array()

  let $max-long as xs:unsignedLong := 18446744073709551615
  let $partition-size := xs:unsignedLong($max-long div $partition-count)

  let $_ :=
    for $i in 1 to $partition-count
    let $min := ($i - 1) * $partition-size
    let $max := if ($i = $partition-count) then $max-long else ($i * $partition-size - 1)
    let $partition := json:object()
    let $_ := (
      map:put($partition, "min", $min),
      map:put($partition, "max", $max)
    )
    return json:array-push($partitions, $partition)

  return $partitions
};

(:
Return a set of partitions based on the given TDE view, schema, and SQL condition. Each partion has the following
information in it:

- min = the min rowID
- max = the max rowID
- rowCount = the number of rows that match the view/schema/sql-condition
- batchCount = the number of batches of matching rows within the partition, based on batch-size
- partitionBatchSize = how many row IDs should be in each batch in the partition
- view ID = the Optic ID for the given view and schema

If no view ID is found for the given view/schema (which seems to be the case when no rows exist), then an empty
array will be returned.
:)
declare function build-partitions(
  $view as xs:string,
  $schema as xs:string?,
  $sql-condition as xs:string?,
  $partition-count as xs:integer
) as json:array
{
  let $view-id := find-view-id($view, $schema)
  return
    if (fn:not($view-id)) then json:array()
    else

    let $initial-partitions := build-initial-partitions($partition-count)

    (: TODO Will make this configurable soon. Assuming 10k rows in a batch is reasonable for now, knowing that Optic
    can often retrieve far larger amounts in less than a second. :)
    let $batch-size := 10000

    let $partitions-with-rows := json:array()

    let $_ :=
      for $partition in json:array-values($initial-partitions)
      let $partition-min := xs:unsignedLong(map:get($partition, "min"))
      let $partition-max := xs:unsignedLong(map:get($partition, "max"))

      let $row-count := get-row-count-for-partition($view, $schema, $sql-condition, $view-id, $partition)
      where $row-count > 0
      return
        let $batch-count := xs:unsignedLong(math:ceil($row-count div $batch-size))
        let $partition-size := xs:unsignedLong($partition-max - $partition-min)
        let $partition-batch-size :=
          if ($batch-count > 0) then xs:unsignedLong($partition-size div $batch-count)
          else 0

        let $_ := (
          map:put($partition, "rowCount", $row-count),
          map:put($partition, "batchCount", $batch-count),
          map:put($partition, "partitionBatchSize", $partition-batch-size),
          map:put($partition, "viewID", $view-id)
        )
        return json:array-push($partitions-with-rows, $partition)

    return $partitions-with-rows
};

(:
Returns the Optic viewID for the given TDE view and schema. Will return an empty sequence if no rows exist for the
given view+schema.
:)
declare private function find-view-id(
  $view as xs:string,
  $schema as xs:string?
) as xs:string?
{
  map:get(
    op:from-view($schema, $view)
    => op:select(op:as("viewID", ofn:substring-before(ofn:string(op:col("rowID")), ":")))
    => op:offset-limit(0, 1)
    => op:result(),
    "viewID"
  )
};

(:
Returns the number of rows in the given partition that match the given TDE view/schema/sql-condition.
:)
declare private function get-row-count-for-partition(
  $view as xs:string,
  $schema as xs:string?,
  $sql-condition as xs:string?,
  $view-id as xs:string,
  $partition as json:object
)
{
  let $min-row-id := $view-id || ":" || map:get($partition, "min")
  let $max-row-id := $view-id || ":" || map:get($partition, "max")

  let $access-plan :=
    op:from-view($schema, $view)
    => op:where(op:and(
      op:ge(op:col("rowID"), osql:rowID(op:param("minRowID"))),
      op:le(op:col("rowID"), osql:rowID(op:param("maxRowID")))
    ))

  let $access-plan :=
    if ($sql-condition) then op:where($access-plan, op:sql-condition($sql-condition))
    else $access-plan

  let $result-map :=
    $access-plan
    => op:group-by((), op:count("rowCount"))
    => op:result((), map:entry("minRowID", $min-row-id) => map:with("maxRowID", $max-row-id))

  return map:get($result-map, "rowCount")
};

(:
For the given partition, which must define min, max, batchCount, and partitionBatchSize, return a JSON object
that defines a min and max rowID. Those rows IDs constitute a "partition batch".
:)
declare function get-partition-batch($partition as json:object, $batch-number as xs:integer) as json:object
{
  let $partition-batch-size := xs:unsignedLong(map:get($partition, "partitionBatchSize"))
  let $partition-min := xs:unsignedLong(map:get($partition, "min"))
  let $partition-max := xs:unsignedLong(map:get($partition, "max"))
  let $batch-count := xs:unsignedLong(map:get($partition, "batchCount"))

  let $batch-number :=
    if ($batch-number > $batch-count) then $batch-count
    else $batch-number

  let $min-offset := xs:unsignedLong(($batch-number - 1) * $partition-batch-size)
  let $min := xs:unsignedLong($min-offset + $partition-min)
  let $max-offset := xs:unsignedLong($batch-number * $partition-batch-size)
  let $max :=
    if ($batch-number = $batch-count) then $partition-max
    else $max-offset + $partition-min - 1
  let $batch := json:object()
  let $_ := (
    map:put($batch, "min", $min),
    map:put($batch, "max", $max)
  )
  return $batch
};

