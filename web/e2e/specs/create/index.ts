import runCreate from './create'

export default function (tmpDir) {
  describe('create', function () {
    runCreate(tmpDir)
  })
}
