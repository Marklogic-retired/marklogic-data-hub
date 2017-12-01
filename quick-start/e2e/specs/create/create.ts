import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from '../../page-objects/page';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import flowPage from '../../page-objects/flows/flows';

export default function() {
  describe('create entities', () => {
    beforeAll(() => {
      loginPage.isLoaded();
    });

    it('Starts off with the right stuff', function() {
      expect(loginPage.browseButton.isPresent()).toBe(true);
      expect(loginPage.projectList.isPresent()).toBe(true);
      expect(loginPage.folderBrowser.isPresent()).toBe(false);
      expect(loginPage.nextButton('ProjectDirTab').isPresent()).toBe(true);
      expect(loginPage.odhIcon.isDisplayed()).toBe(true);

      expect(loginPage.projectDirTab.isDisplayed()).toBe(true);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
    });

    it ('Should open the examples folder', function() {
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
    });

    it ('Should be on the environment tab', function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(true);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
    });

    it ('Should be on the login tab', function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(true);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      loginPage.login();
    });

    it ('should go to the dashboard', function() {
      dashboardPage.isLoaded();

      dashboardPage.clearDatabases.click();
      browser.wait(EC.elementToBeClickable(dashboardPage.clearButton));
      dashboardPage.clearButton.click();

      // wait for all four to be 0
      browser.wait(dashboardPage.zeroCounts.count().then((count) => {
        return count === 4;
      }));
    });

    it ('should go to the entities page', function() {
      dashboardPage.entitiesTab.click();
      entityPage.isLoaded();
    });

    it ('should create a new entity', function() {
      entityPage.toolsButton.click();
      entityPage.newEntityButton.click();
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.entityTitle.sendKeys('TestEntity');
      entityPage.saveEntity.click();
      expect(entityPage.getEntityBox('TestEntity').isDisplayed()).toBe(true);
    });

    it ('should go to the flow page', function() {
      entityPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should open the Entity disclosure', function() {
      flowPage.entityDisclosure('TestEntity').click();
    });

    ['INPUT', 'HARMONIZE'].forEach((flowType) => {
      ['sjs', 'xqy'].forEach((codeFormat) => {
        ['xml', 'json'].forEach((dataFormat) => {
          let flowName = `${codeFormat} ${dataFormat} ${flowType}`;
          it (`should create a ${flowName} flow`, function() {
            flowPage.createFlow('TestEntity', flowName, flowType, dataFormat, codeFormat, false);
            browser.wait(EC.visibilityOf(flowPage.getFlow('TestEntity', flowName, flowType)));
            expect(flowPage.getFlow('TestEntity', flowName, flowType).isDisplayed()).toBe(true, flowName + ' is not present');
          });
        });
      });
    });
  });
}
