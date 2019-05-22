import {ElementFinder} from 'protractor';
import {AbstractComponentObject} from '../../../../utils/shadow/abstract-component-object';
import * as Selectors from './manage-flows.selectors';


/**
 * ManageFlows shadow library
 */
export class ManageFlowsCO extends AbstractComponentObject {


  /**
   * Constructor to pass direct parent to help locating in global context.
   *
   * @param {ElementFinder} parent the element finder of the direct parent component
   */
  constructor(parent: ElementFinder) {
    super(parent, Selectors.SELECTOR);
  }

  /**
   * Get the number of flows loaded for this control
   *
   * @returns {number} the number of flows loaded
   */
  async getNumberOfFlows(): Promise<number> {
    const paginatorLabel = await this.getElementFinder(Selectors.PAGINATOR_RANGE_LABEL).getText();
    return parseInt(paginatorLabel.split(' of ')[1]);
  }

}
