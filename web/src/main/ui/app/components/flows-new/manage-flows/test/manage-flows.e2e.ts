// spec.js
import {browser, By, by, element} from 'protractor';
import {ManageFlowsCO} from './manage-flows.shadow';

describe('Manage Flows Component ', () => {
  browser.ignoreSynchronization = true;
  let driver: any;
  let shadowControl: ManageFlowsCO;
  let sleepTime = 1000;

  beforeAll(() => {
    shadowControl = new ManageFlowsCO(element(by.css('mlui-dhf-theme')));
    browser.get('?path=/story/components-flows--flows-manage-page');
    driver = browser.driver;
  });

  beforeEach(() => {
  });

  afterAll(() => {
  });

  it('should get title', async () => {
    expect(await browser.getTitle()).toEqual('Storybook');
  });

  it('should have two flows in a table', async () => {
    browser.switchTo().frame(driver.findElement(By.xpath('//iframe')));
    browser.sleep(sleepTime);
    const number = await shadowControl.getNumberOfFlows();
    expect(number).toEqual(2);
    browser.switchTo().defaultContent();
  });

});
