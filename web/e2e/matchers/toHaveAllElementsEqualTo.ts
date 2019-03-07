
export default function toHaveAllElementsEqualTo(util, customEqualityTesters) {
  return {
    compare : (actual: any[], expected: string) => {
      let pass: boolean = false;
      let message: string = '';
      let result: jasmine.CustomMatcherResult = {
        pass:pass,
        message:message
      }

      if(actual.length == 0 || !expected || Object.prototype.toString.apply(actual) != '[object Array]') {
        return result
      }

      result.pass = actual.every( value => {
        if(value) {
          return (value === expected)
        } else {
          return true
        }
      })

      return result;
    }
  }
}
