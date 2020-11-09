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

// We don't need huge unsignedLong's here to test the math
const partition = {
  min: 10,
  max: 95,
  partitionBatchSize: 10,
  batchCount: 9
};

const firstBatch = partitionLib.getPartitionBatch(partition, 1);
assertions.push(
  test.assertEqual("10", firstBatch.min, "A string is returned to ensure the SJS code doesn't have any " +
    "problem with an unsignedLong that it can't handle"),
  test.assertEqual("19", firstBatch.max)
);

const lastBatch = partitionLib.getPartitionBatch(partition, 9);
assertions.push(
  test.assertEqual("90", lastBatch.min),
  test.assertEqual("95", lastBatch.max, "The last batch should have a max value equal to the max of the partition")
);

const afterLastBatch = partitionLib.getPartitionBatch(partition, 10);
assertions.push(
  test.assertEqual("90", afterLastBatch.min, "If the client specifies a batchNumber higher than batchCount, " +
    "then the batch associated with the value of batchCount should be returned. This seems better than throwing an " +
    "error or returning an invalid partition"),
  test.assertEqual("95", afterLastBatch.max)
);

assertions
