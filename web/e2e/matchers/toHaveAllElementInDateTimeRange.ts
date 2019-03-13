export default function toHaveAllElementInDateTimeRange(util, customEqualityTesters) {
  return {
    compare : (actual: any[], expectedRange: jasmine.IDateTimeRangeSpec) => {
      let pass: boolean = false;
      let message: string = '';
      let result: jasmine.CustomMatcherResult = {
        pass:pass,
        message:message
      }

      if(actual.length == 0 || !expectedRange || !expectedRange.startDateTime || !expectedRange.endDateTime) {
        return result
      }
      result.pass = actual.every(date => {
        if(date) {
          let _date = new Date(date).getTime()
          return ( _date >= expectedRange.startDateTime.getTime() && _date <= expectedRange.endDateTime.getTime())
        } else {
            return true
            }
      })

      return result;
    }
  }
}
