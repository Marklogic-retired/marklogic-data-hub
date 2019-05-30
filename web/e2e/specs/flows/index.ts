import manageFlows from './manage-flows'


export default function (tmpDir) {
  describe('Flows', function () {
    manageFlows(tmpDir);
    // editFlows(tmpDir);
    // verifyIngestion(tmpDir);
    // verifyMapping(tmpDir);
    // verifyMastering(tmpDir);
  })
}
