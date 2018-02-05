import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from '../../page-objects/page';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import flowPage from '../../page-objects/flows/flows';
import {assertNotNull} from "@angular/compiler/src/output/output_ast";

const selectCardinalityOneToOneOption = 'select option:nth-child(1)';
const selectCardinalityOneToManyOption = 'select option:nth-child(2)';

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
      browser.driver.sleep(5000);
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

    it ('should create a new Order entity', function() {
      //create Order entity
      console.log('create Order entity');
      entityPage.toolsButton.click();
      entityPage.newEntityButton.click();
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.entityTitle.sendKeys('Order');
      entityPage.saveEntity.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Order')));
      expect(entityPage.getEntityBox('Order').isDisplayed()).toBe(true);
      console.log('click edit Order entity');
      entityPage.clickEditEntity('Order');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.saveEntity.click();
      browser.driver.sleep(5000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.driver.sleep(5000);
      entityPage.toolsButton.click();
      browser.driver.sleep(5000);
    });

    it ('should create a new Product entity', function() {
      //create Order entity
      console.log('create Product entity');
      entityPage.toolsButton.click();
      entityPage.newEntityButton.click();
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.entityTitle.sendKeys('Product');
      entityPage.saveEntity.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Product')));
      expect(entityPage.getEntityBox('Product').isDisplayed()).toBe(true);
      console.log('click edit Product entity');
      entityPage.clickEditEntity('Product');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.saveEntity.click();
      browser.driver.sleep(5000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.driver.sleep(5000);
      entityPage.toolsButton.click();
    });

    it ('should add properties to Product entity', function() {
      //add properties
      console.log('add properties to Product entity');
      console.log('edit Product entity');
      let lastProperty = entityPage.lastProperty;
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      // add sku property
      console.log('add sku property');
      entityPage.addProperty.click();
      entityPage.getPropertyName(lastProperty).sendKeys('sku');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('sku description');
      entityPage.getPropertyPrimaryKeyColumn(lastProperty).click();
      // add price property
      console.log('add price property');
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('price');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('price description');
      entityPage.getPropertyRangeIndexColumn(lastProperty).click();
      browser.driver.sleep(5000);
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      browser.driver.sleep(5000);
      entityPage.confirmDialogYesButton.click();
      browser.driver.sleep(5000);
    });

    it ('should add properties to Order entity', function() {
      //add properties
      console.log('add properties to Order entity');
      console.log('edit Order entity');
      let lastProperty = entityPage.lastProperty;
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      // add id property
      console.log('add id property');
      entityPage.addProperty.click();
      entityPage.getPropertyName(lastProperty).sendKeys('id');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('id description');
      entityPage.getPropertyPrimaryKeyColumn(lastProperty).click();
      // add price property
      console.log('add price property');
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('price');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('price description');
      entityPage.getPropertyRangeIndexColumn(lastProperty).click();
     // add products property
      console.log('add products property');
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('products');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'Product')).click();
      entityPage.getPropertyCardinality(lastProperty).element(by.css(selectCardinalityOneToManyOption)).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('products description');
      entityPage.getPropertyWordLexiconColumn(lastProperty).click();
      entityPage.saveEntity.click();
      browser.driver.sleep(5000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      browser.driver.sleep(5000);
      entityPage.confirmDialogYesButton.click();
      browser.driver.sleep(5000);
    });

    it ('should verify properties to Product entity', function() {
      console.log('verify properties to Product entity');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let skuProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(skuProperty).getAttribute('value')).toEqual('sku');
      expect(entityPage.getPropertyType(skuProperty).getAttribute('ng-reflect-model')).toEqual('string');
      expect(entityPage.getPropertyDescription(skuProperty).getAttribute('value')).toEqual('sku description');
      expect(entityPage.hasClass(entityPage.getPropertyPrimaryKey(skuProperty), 'active')).toBe(true);
      let priceProperty = entityPage.getPropertyByPosition(2);
      expect(entityPage.getPropertyName(priceProperty).getAttribute('value')).toEqual('price');
      expect(entityPage.getPropertyType(priceProperty).getAttribute('ng-reflect-model')).toEqual('decimal');
      expect(entityPage.getPropertyDescription(priceProperty).getAttribute('value')).toEqual('price description');
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(priceProperty), 'active')).toBe(true);
      browser.driver.sleep(5000);
      entityPage.cancelEntity.click();
      browser.driver.sleep(5000);
    });

    it ('should verify properties to Order entity', function() {
      console.log('verify properties to Order entity');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let idProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(idProperty).getAttribute('value')).toEqual('id');
      expect(entityPage.getPropertyType(idProperty).getAttribute('ng-reflect-model')).toEqual('string');
      expect(entityPage.getPropertyDescription(idProperty).getAttribute('value')).toEqual('id description');
      expect(entityPage.hasClass(entityPage.getPropertyPrimaryKey(idProperty), 'active')).toBe(true);
      let priceProperty = entityPage.getPropertyByPosition(2);
      expect(entityPage.getPropertyName(priceProperty).getAttribute('value')).toEqual('price');
      expect(entityPage.getPropertyType(priceProperty).getAttribute('ng-reflect-model')).toEqual('decimal');
      expect(entityPage.getPropertyCardinality(priceProperty).getAttribute('ng-reflect-model')).toEqual('ONE_TO_ONE');
      expect(entityPage.getPropertyDescription(priceProperty).getAttribute('value')).toEqual('price description');
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(priceProperty), 'active')).toBe(true);
      let productsProperty = entityPage.getPropertyByPosition(3);
      expect(entityPage.getPropertyName(productsProperty).getAttribute('value')).toEqual('products');
      expect(entityPage.getPropertyType(productsProperty).getAttribute('ng-reflect-model')).toEqual('#/definitions/Product');
      expect(entityPage.getPropertyCardinality(productsProperty).getAttribute('ng-reflect-model')).toEqual('ONE_TO_MANY');
      expect(entityPage.getPropertyDescription(productsProperty).getAttribute('value')).toEqual('products description');
      expect(entityPage.hasClass(entityPage.getPropertyWordLexicon(productsProperty), 'active')).toBe(true);
      browser.driver.sleep(5000);
      entityPage.cancelEntity.click();
      browser.driver.sleep(5000);
    });

    it ('should remove some properties on Order entity', function() {
      console.log('verify remove properties on Order entity');
      let lastProperty = entityPage.lastProperty;
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //add some additional properties
      console.log('add addtional properties');
      entityPage.addProperty.click();
      entityPage.getPropertyName(lastProperty).sendKeys('remove-prop1');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'dateTime')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('remove-prop1 description');
      entityPage.addProperty.click();
      entityPage.getPropertyName(lastProperty).sendKeys('remove-prop2');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'integer')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('remove-prop2 description');
      entityPage.saveEntity.click();
      browser.driver.sleep(5000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      browser.driver.sleep(5000);
      entityPage.confirmDialogYesButton.click();
      browser.driver.sleep(5000);
      //remove the additional properties
      console.log('remove additional properties');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
      //browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let removeProp1 = entityPage.getPropertyByPosition(4);
      let removeProp2 = entityPage.getPropertyByPosition(5);
      entityPage.getPropertyCheckBox(removeProp1).click();
      entityPage.getPropertyCheckBox(removeProp2).click();
      entityPage.deleteProperty.click();
      browser.wait(EC.visibilityOf(entityPage.confirmDialogYesButton));
      entityPage.confirmDialogYesButton.click();
      entityPage.saveEntity.click();
      browser.driver.sleep(5000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      browser.driver.sleep(5000);
      entityPage.confirmDialogYesButton.click();
      browser.driver.sleep(5000);
      //verify that the properties are removed
      console.log('verify properties are removed');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      console.log('verify properties count');
      entityPage.getPropertiesCount().then(function(props){expect(props === 3)});
      browser.driver.sleep(5000);
      entityPage.cancelEntity.click();
      browser.driver.sleep(5000);
    });

    it ('should remove a created entity', function() {
      //create removeEntity entity
      console.log('create removeEntity entity');
      entityPage.toolsButton.click();
      entityPage.newEntityButton.click();
      entityPage.entityTitle.sendKeys('removeEntity');
      let lastProperty = entityPage.lastProperty;
      entityPage.addProperty.click();
      entityPage.getPropertyName(lastProperty).sendKeys('remove-prop1');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('remove-prop1 description');
      entityPage.saveEntity.click();
      browser.driver.sleep(5000);
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('removeEntity')));
      entityPage.toolsButton.click();
      browser.driver.sleep(5000);
      //remove removeEntity entity
      //element(by.css('svg > .nodes * #fo-removeEntity > .foreign > app-entity-box > .entity-def-box > app-resizable > .title > .edit-area > span:nth-of-type(2) > i')).click();
      entityPage.deleteEntityButton('removeEntity').click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      browser.driver.sleep(5000);
      entityPage.confirmDialogYesButton.click();
      browser.driver.sleep(5000);
      //count entities
      console.log('verify entity is deleted by count');
      entityPage.getEntitiesCount().then(function(entities){expect(entities === 2)});
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
      browser.executeScript('window.document.getElementsByClassName("edit-start")[2].click()');
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
      browser.executeScript('window.document.getElementsByClassName("edit-start")[2].click()');
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
      browser.executeScript('window.document.getElementsByClassName("edit-start")[2].click()');
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
