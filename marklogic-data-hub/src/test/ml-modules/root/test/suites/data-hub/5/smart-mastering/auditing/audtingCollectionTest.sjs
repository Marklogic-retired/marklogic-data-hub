const lib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const auditing = require("/com.marklogic.smart-mastering/auditing/base.xqy");
const test = require("/test/test-helper.xqy");
const emptySequence = Sequence.from([]);

let assertions = [];

xdmp.invokeFunction(
  function() {
    const options = { targetEntity: 'Person', matchOptions: {}, mergeOptions: {}};
    // create default options for matching/merging with target entity person
    lib.checkOptions(emptySequence, options);
    const mergeOptionsNode = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode().xpath('/options');
    const auditingContentObj = auditing.buildAuditTrace(
      'merge',
      Sequence.from(['/doc1.json','/doc3.json']),
      '/merged.json',
      mergeOptionsNode,
      emptySequence
    );
    assertions.push(test.assertEqual("sm-Person-auditing", auditingContentObj.context.collections, `Auditing doc should have collection 'sm-Person-auditing'. has: '${auditingContentObj.context.collections}'`))
  },
  {update: 'true', commit: 'auto'}
);

assertions;
