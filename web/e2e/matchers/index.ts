import toHaveAllElementsContainText from './toHaveAllElementsContainText'
import toHaveAllElementsEqualTo from './toHaveAllElementsEqualTo'
import toBeSubSetOf from './toBeSubSetOf'
import toHaveAllElementInDateTimeRange from './toHaveAllElementInDateTimeRange'
import toHaveAllElementSort from './toHaveAllElementSort'

const CUSTOM_MATCHERS = {toHaveAllElementsContainText, toHaveAllElementsEqualTo,
                         toBeSubSetOf,toHaveAllElementInDateTimeRange,toHaveAllElementSort}

export default CUSTOM_MATCHERS
