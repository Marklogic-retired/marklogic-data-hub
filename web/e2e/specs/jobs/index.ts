import runJobs from './jobs'

export default function (qaProjectDir) {
  describe('jobs', function () {
    runJobs(qaProjectDir)
  })
}
