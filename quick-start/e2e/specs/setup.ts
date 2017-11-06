// import { pages } from '../page-objects/page'
var request = require('request').defaults({ strictSSL: false })

declare const browser: any;

export default function () {

  describe('Reset e2e', () => {
    beforeAll(() => {
    })

    // reset projects
    it('reset projects', function (done) {
      request({
        url: `http://localhost:8080/api/projects/reset`
      }, function (error, response, body) {
        done();
      });
    });
  })
}



