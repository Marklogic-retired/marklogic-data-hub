import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from '../../page-objects/page';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import flowPage from '../../page-objects/flows/flows';
import {assertNotNull} from "@angular/compiler/src/output/output_ast";

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
      //wait for all four to be 0
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
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('TestEntity')));
      expect(entityPage.getEntityBox('TestEntity').isDisplayed()).toBe(true);
      entityPage.toolsButton.click();
    });

    //TODO: refactor out these create tests into specific tests
    //Here we're placing the create properties and remote properties along with index setting tests
    //These should probably be moved to specific tests files for each 'thing' entities, flow,
    // after the general create script and before the general tear down scripts

    it('should create a new property', function(){
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //tell the UI to add the visual row
      entityPage.addProperty.click();
      //now compare to see if the current count is 1
      element.all(by.css('.properties > table > tBody > tr')).count().then(function(props){expect(props === 1)});

      //select the last (or first if only 1) property
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isPresent() && lastProperty.isDisplayed());
      //populate the fields for name, range index, type, and description
      entityPage.getPropertyName(lastProperty).sendKeys("test");
      entityPage.getPropertyRangeIndexColumn(lastProperty).click();
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys("this is a test property");
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("test");
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(lastProperty), 'active')).toBe(true);
      expect(entityPage.getPropertyType(lastProperty).getAttribute('value')).toEqual("24: string");
      expect(entityPage.getPropertyDescription(lastProperty).getAttribute('value')).toEqual("this is a test property");
      //let's add 1 more so we can remove one for the next test
      entityPage.addProperty.click();
      //repoint last property to the new last property
      lastProperty = entityPage.lastProperty;
      expect(lastProperty.isPresent() && lastProperty.isDisplayed());
      //populate the fields for name, range index, type, and description
      entityPage.getPropertyName(lastProperty).sendKeys("ID");
      entityPage.getPropertyPrimaryKeyColumn(lastProperty).click();
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'integer')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys("this is our primary key");


      //let's save it now that it's populated
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isPresent()).toBe(true);
      entityPage.confirmDialogNoButton.click();
    });

    it('should remove a property', function(){
      //now time to delete, let's reopen the editor
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //let's grab the count of the rows before we add so we can compare
      element.all(by.css('.properties > table > tBody > tr')).count().then(function(props){expect(props === 2)});
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isPresent() && lastProperty.isDisplayed());
      entityPage.getPropertyCheckBox(lastProperty).click();
      entityPage.deleteProperty.click();
      browser.wait(EC.visibilityOf(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      element.all(by.css('.properties > table > tBody > tr')).count().then(function(props){expect(props === 1)});
      //let's save it now that it's populated
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isPresent()).toBe(true);
      entityPage.confirmDialogNoButton.click();
    });

    it('should retain settings on remaining property', function() {
      //now let's confirm we didn't lose any settings, reopen editor
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //Do we still have 1 property left?
      element.all(by.css('.properties > table > tBody > tr')).count().then(function(props){expect(props === 1)});
      //if so, grab it
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isPresent() && lastProperty.isDisplayed());
      //now let's compare them with our original tests to make sure the values are equal
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("test");
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(lastProperty), 'active')).toBe(true);
      expect(entityPage.getPropertyType(lastProperty).getAttribute('value')).toEqual("24: string");
      expect(entityPage.getPropertyDescription(lastProperty).getAttribute('value')).toEqual("this is a test property");
      //if so, great, we're done!
      //so let's save this and go on with the other tests
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isPresent()).toBe(true);
      entityPage.confirmDialogNoButton.click();
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
