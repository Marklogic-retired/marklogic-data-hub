'use strict';
var endpointState; // jsonDocument?

var input;         // jsonDocument*
declareUpdate();

const state  = fn.head(xdmp.fromJSON(endpointState));

const work = fn.head(xdmp.fromJSON(workUnit));

const inputs =
    (input instanceof Sequence) ? input.toArray().map(item => fn.head(xdmp.fromJSON(item))) :
    (input instanceof Document) ? [fn.head(xdmp.fromJSON(input))] :
                                  [ {UNKNOWN: input} ];
inputs.forEach(record => {
state.next = state.next + 1;
xdmp.documentInsert(
    (state.prefix)+'/'+(work.taskId)+'/'+(state.next)+'.json',
    record,
    {permissions:[
            xdmp.permission('data-hub-common', 'read'),
            xdmp.permission('data-hub-common', 'update')
        ]
    }
  )
});

const returnValue = (fn.count(input) > 0) ? state : null;

returnValue;
