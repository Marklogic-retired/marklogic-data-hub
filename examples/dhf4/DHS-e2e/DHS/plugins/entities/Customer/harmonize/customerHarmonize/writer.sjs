/*~
 * Writer Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param envelope - the final envelope
 * @param options  - an object options. Options are sent from Java
 *
 * @return - nothing
 */
function write(id, envelope, options) {
  var options = {
		     permissions : [
				    xdmp.permission('flowDeveloper', 'read'),
           			    xdmp.permission('flowDeveloper', 'update'),
				    xdmp.permission('flowDeveloper', 'insert'),
				    xdmp.permission('flowDeveloper', 'execute'),
				    xdmp.permission('flowOperator', 'read'),
                                    xdmp.permission('flowOperator', 'update'),
				    xdmp.permission('flowOperator', 'insert'),
                                    xdmp.permission('flowOperator', 'execute'),
                                    xdmp.permission('endpointDeveloper', 'read'),
                                    xdmp.permission('endpointDeveloper', 'execute'),
                                    xdmp.permission('endpointUser', 'read'),
                                    xdmp.permission('endpointUser', 'execute')
				   ],
		     collections : options.entity
		}

  xdmp.documentInsert(id, envelope, options);

}

module.exports = write;
