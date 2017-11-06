
export default function toHaveAllElementsContainText(
  util,
  customEqualityTesters,
  caseSensitive = false
) {
  return {
    compare : (actual: any[], expected: string) => {
      let pass: boolean = false;
      let message: string = '';
      let result: jasmine.CustomMatcherResult = {
        pass:pass,
        message:message
      }

      if(actual.length == 0 || Object.prototype.toString.apply(actual) != '[object Array]' || !expected || actual.length==0) {
        return result
      } 

      let reallyExpected = caseSensitive ?
            expected.toString() :
            expected.toString().toLowerCase()

      result.pass = actual.every( value => {
        if(value){
          let reallyActual = caseSensitive ?
            value.toString() :
            value.toString().toLowerCase()
          return reallyActual.indexOf(reallyExpected) > -1;
        } else {
          return value.indexOf(reallyExpected) > -1;
        }
      })

      return result;
      }
    
  }
}
