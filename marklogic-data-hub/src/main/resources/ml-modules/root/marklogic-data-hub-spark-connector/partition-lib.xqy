xquery version "1.0-ml";

(:
This library is written in XQuery to safely handle unsignedLong values, which are a bit trickier to handle
correctly in SJS.
:)

module namespace partition = "org:example:partition";

(:
Returns an "initial" set of partitions that just defines a min and max for each partition.
:)
declare function make-partitions($partition-count as xs:integer) as json:array
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
Handles the math for figuring out the number of batches in the given partition based on the given batch-size.
The keys batchCount and partitionBatchSize will be added to the partition object.
:)
declare function add-batch-info-to-partition(
  $partition as json:object,
  $batch-size as xs:unsignedLong
) as empty-sequence()
{
  let $row-count := xs:unsignedLong(map:get($partition, "rowCount"))
  let $partition-min := xs:unsignedLong(map:get($partition, "min"))
  let $partition-max := xs:unsignedLong(map:get($partition, "max"))

  let $batch-count := xs:unsignedLong(math:ceil($row-count div $batch-size))
  let $partition-size := xs:unsignedLong($partition-max - $partition-min)
  let $partition-batch-size :=
    if ($batch-count > 0) then xs:unsignedLong($partition-size div $batch-count)
    else 0

  return (
    map:put($partition, "batchCount", $batch-count),
    map:put($partition, "partitionBatchSize", $partition-batch-size)
  )
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
    map:put($batch, "min", xs:string($min)),
    map:put($batch, "max", xs:string($max))
  )
  return $batch
};

