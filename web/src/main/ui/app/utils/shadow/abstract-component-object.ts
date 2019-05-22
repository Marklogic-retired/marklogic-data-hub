import {By, ElementFinder, element} from 'protractor';

export class AbstractComponentObject {

  /**
   * Shadow control constructor expects
   *
   * TODO: refactor control to be element finder or locator, rather than plain selector string
   *
   * @param {ElementFinder} parent element finder for parent
   * @param {ElementFinder} control element finder for control itself
   */
  constructor(protected parent: ElementFinder, protected control: string) {}

  /**
   * Utility method to get element finder for some selector
   *
   * @param {string} selector the selector string
   * @returns {ElementFinder} the element finder
   */
  protected getElementFinder(selector: string) {
    // for this control first find the root element relative to parent
    // then apply the selector
    return this
      .parent
      .element(By.css(this.control))
      .element(By.css(selector));
  }
}
