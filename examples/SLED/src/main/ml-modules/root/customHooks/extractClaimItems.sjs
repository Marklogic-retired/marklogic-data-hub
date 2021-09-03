/**
 * This custom hook remaps the URIs for envision at a url. it allows 2 mapping steps to work on the same input source
 */
// A custom hook receives the following parameters via DHF. Each can be optionally declared.
var uris; // an array of URIs (may only be one) being processed
var content; // an array of objects for each document being processed
var options; // the options object passed to the step by DHF
var flowName; // the name of the flow being processed
var stepNumber; // the index of the step within the flow being processed; the first step has a step number of 1
var step; // the step definition object

const config = require('/com.marklogic.hub/config.sjs')
const stagingDB = config.STAGINGDATABASE

const meta = content[0]
content.splice(0, content.length)

uris.forEach(uri => {
	const doc = fn.head(xdmp.invokeFunction(function() {
		return cts.doc(uri).xpath('/envelope/instance')
	}, { database: xdmp.database(stagingDB)}))


	for (let i = 1; i <= 6; i++) {
		let id = 'CLM_' + i + '_'
		let resp = {
      Sequence: i,
      ClaimIdentifier: doc.xpath('./ClaimIdentifier'),
      PatientAccountNumber: doc.xpath('./PatientAccountNumber')
    }
		for (let x of doc.xpath('./*[fn:starts-with(fn:string(fn:node-name(.)), "' + id + '")]')) {
			resp[fn.replace(fn.string(fn.nodeName(x)), id, '')] = x
    }
    const npi = fn.string(resp.NPI)
    if (npi && npi !== '') {
      console.log(`claim[${resp.ClaimIdentifier}].resp.NPI[${i}]=[${npi}]`)
      const env = {
        envelope: {
          headers: {},
          instance: resp
        }
      }
      content.push({
        ...content[0],
        uri: `/claims/${resp.ClaimIdentifier}/items/${sem.uuidString()}.json`,
        value: fn.head(xdmp.xqueryEval('declare variable $x external; xdmp:to-json($x)', {x: env}))
      })
    }
	}
})
