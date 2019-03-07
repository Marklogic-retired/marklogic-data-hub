export default function toHaveAllElementSort(util, customEqualityTesters) {
  return {
    compare: (actual: any[], expected: string) => {
      let sortedval: any[] = actual.filter((v) => {
        return v !== ''
      });
      let unsortedval: any[] = actual.filter((v) => {
        return v !== ''
      });
      sortedval = sortedval.map((v) => {
        return v.toUpperCase()
      }) 
      unsortedval = unsortedval.map((v) => {
        return v.toUpperCase()
      }) 
      let pass: boolean = false;
      let isDate: boolean = false;
      let message: string = '';
      let result: jasmine.CustomMatcherResult = {
        pass: pass,
        message: message
      }

      //checking Date column data
      isDate = sortedval[0].constructor.toString()
        .indexOf("Date") > -1

      if (expected == 'asc') {
        if (isDate) {
          sortedval = sortedval.sort(function (a, b) {
            return a.getTime() - b.getTime()
          });
        } else {
          sortedval = sortedval.sort((a, b) => {
            if (a > b) {
              return 1
            } else if (a < b) {
              return -1
            } else
               return 0
          })
        }

      } else if (expected == 'desc') {
        if (isDate) {
          sortedval = sortedval.sort(function (a, b) {
            return b.getTime() - a.getTime()
          });
        } else {
          sortedval = sortedval.sort((a, b) => {
            if (a > b) {
              return -1
            } else if (a < b) {
              return 1
            }
            return 0
          })
        }
      }

      if (JSON.stringify(sortedval) === JSON.stringify(unsortedval)) {
        result.pass = true
      }

      return result;
    }
  }
}
