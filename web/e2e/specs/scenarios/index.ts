import simpleJson from './simpleJson'
import multiFlows from './multiFlows'

export default function(qaProjectDir) {
  describe('scenarios', function() {
    simpleJson(qaProjectDir);
    multiFlows(qaProjectDir);
  })
}
