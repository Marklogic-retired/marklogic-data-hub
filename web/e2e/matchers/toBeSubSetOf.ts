
export default function toBeSubSetOf(util, customEqualityTesters) {
  return {
    compare : (actual: any[], expected: any[]) => {
      let pass: boolean = false;
      let message: string = '';
      let result: jasmine.CustomMatcherResult = {
        pass:pass,
        message:message
      }
      if(actual.length == 0 || expected.length == 0 || Object.prototype.toString.apply(actual) != '[object Array]') {
        return result
      }

      result.pass = actual.every( value => {
        return !value || expected.indexOf(value) > -1;
      })

      return result;
    }
  }
}
