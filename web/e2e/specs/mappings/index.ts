import runTypeAhead from './typeAhead'
import runMappings from './mappings'

export default function () {
  describe('mappings', function () {
    runTypeAhead();
    runMappings();
  })
}
