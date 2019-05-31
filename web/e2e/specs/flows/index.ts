import manageFlows from './manage-flows'
import editFlows from './edit-flows'
import verifyIngestion from './steps/ingestion'


export default function (tmpDir) {
  describe('Flows', function () {
    manageFlows(tmpDir);
    editFlows(tmpDir);
    verifyIngestion(tmpDir);
    // verifyMapping(tmpDir);
    // verifyMastering(tmpDir);
  })
}
