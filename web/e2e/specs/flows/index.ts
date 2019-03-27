import manageFlows from './manage-flows'


export default function (tmpDir) {
  describe('Flows', function () {
    manageFlows(tmpDir)
  })
}
