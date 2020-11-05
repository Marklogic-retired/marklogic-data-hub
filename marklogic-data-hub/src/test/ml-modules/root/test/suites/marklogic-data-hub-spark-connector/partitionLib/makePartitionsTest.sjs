/**
 Copyright (c) 2020 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

const partitionLib = require('/marklogic-data-hub-spark-connector/partition-lib.xqy');
const test = require("/test/test-helper.xqy");

const assertions = [];

let partitions = partitionLib.makePartitions(1);
assertions.push(
  test.assertEqual(1, partitions.length),
  test.assertEqual(0, partitions[0].min),
  test.assertEqual(xs.unsignedLong(18446744073709551615), partitions[0].max)
);

partitions = partitionLib.makePartitions(2);
assertions.push(
  test.assertEqual(2, partitions.length),
  test.assertEqual(0, partitions[0].min),
  test.assertEqual(9223372036854775806, partitions[0].max),
  test.assertEqual(9223372036854775807, partitions[1].min),
  test.assertEqual(xs.unsignedLong(18446744073709551615), partitions[1].max)
);

partitions = partitionLib.makePartitions(10);
assertions.push(
  test.assertEqual(10, partitions.length),
  test.assertEqual(0, partitions[0].min),
  test.assertEqual(1844674407370955160, partitions[0].max,
    "Verifying that a decimal value isn't returned here, as if it were, the sql.rowID function would later throw an " +
    "error because it does not allow decimals after the viewID"),
  test.assertEqual(16602069666338596449, partitions[9].min),
  test.assertEqual(18446744073709551615, partitions[9].max,
    "The last partition should always have the max unsignedLong value as its max rowID")
);

assertions;
