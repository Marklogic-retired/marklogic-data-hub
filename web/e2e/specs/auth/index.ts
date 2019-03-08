import runAuthenticated from './authenticated'

export default function (tmpDir) {
  describe('auth', function () {
    runAuthenticated(tmpDir)
  })
}
