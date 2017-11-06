declare namespace jasmine {
  export interface IDateTimeRangeSpec {
    startDateTime: Date
    endDateTime: Date
  }

  export interface Matchers {
    toHaveAllElementsContainText(expected: string): boolean
    toHaveAllElementsEqualTo(expected: string): boolean
    toBeSubSetOf(expected: any[]): boolean
    toHaveAllElementInDateTimeRange(expected: IDateTimeRangeSpec): boolean
    toHaveAllElementSort(expected: string):boolean
  }
}
