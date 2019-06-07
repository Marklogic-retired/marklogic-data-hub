import cleanOnDashboard from './dashboard'

export default function (tmpDir) {
  describe('verify dashboard', function () {
    cleanOnDashboard(tmpDir)
  })
}
