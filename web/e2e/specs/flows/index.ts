import manageFlows from './manage-flows'
import editFlows from './edit-flows'
import verifyIngestion from './steps/ingestion'
import verifyMapping from './steps/mapping'



export default function (tmpDir) {
  describe('Flows', function () {
    manageFlows(tmpDir);
    editFlows(tmpDir);
    verifyIngestion(tmpDir);
    verifyMapping(tmpDir);
    // verifyMastering(tmpDir);
  })
}
