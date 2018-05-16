import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from '../../page-objects/page';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import flowPage from '../../page-objects/flows/flows';
import {assertNotNull} from "@angular/compiler/src/output/output_ast";
import appPage from '../../page-objects/appPage';

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
      browser.driver.sleep(3000);
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
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Order')));
      expect(entityPage.getEntityBox('Order').isDisplayed()).toBe(true);
      console.log('click edit Order entity');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      entityPage.toolsButton.click();
    });

    it ('should create a new Product entity', function() {
      //create Product entity
      console.log('create Product entity');
      entityPage.toolsButton.click();
      entityPage.newEntityButton.click();
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.entityTitle.sendKeys('Product');
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Product')));
      expect(entityPage.getEntityBox('Product').isDisplayed()).toBe(true);
      console.log('click edit Product entity');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      entityPage.toolsButton.click();
    });

    it ('should add properties to Product entity', function() {
      //add properties
      console.log('add properties to Product entity');
      console.log('edit Product entity');
      let lastProperty = entityPage.lastProperty;
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
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
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
    });

    it ('should add properties to Order entity', function() {
      //add properties
      console.log('add properties to Order entity');
      console.log('edit Order entity');
      let lastProperty = entityPage.lastProperty;
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      // add id property
      console.log('add id property');
      entityPage.addProperty.click();
      // setting primary key first
      entityPage.getPropertyPrimaryKeyColumn(lastProperty).click();
      entityPage.getPropertyName(lastProperty).sendKeys('id');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('id description');
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
      // add a duplicate price property, negative test
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('price');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
    });

    it ('should verify properties to Product entity', function() {
      console.log('verify properties to Product entity');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
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
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should verify properties to Order entity', function() {
      console.log('verify properties to Order entity');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[0].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let idProperty = entityPage.getPropertyByPosition(1);
      // verify that primary key is retained
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
      // verify duplicate property is not created, the count should be 3
      entityPage.getPropertiesCount().then(function(props){expect(props === 3)});
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should remove some properties on Order entity', function() {
      console.log('verify remove properties on Order entity');
      let lastProperty = entityPage.lastProperty;
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
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
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      //remove the additional properties
      console.log('remove additional properties');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      browser.sleep(3000);
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let removeProp1 = entityPage.getPropertyByPosition(4);
      let removeProp2 = entityPage.getPropertyByPosition(5);
      entityPage.getPropertyCheckBox(removeProp1).click();
      entityPage.getPropertyCheckBox(removeProp2).click();
      entityPage.deleteProperty.click();
      browser.wait(EC.visibilityOf(entityPage.confirmDialogYesButton));
      entityPage.confirmDialogYesButton.click();
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      //verify that the properties are removed
      console.log('verify properties are removed');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[1].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      console.log('verify properties count');
      entityPage.getPropertiesCount().then(function(props){expect(props === 3)});
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
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
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('removeEntity')));
      entityPage.toolsButton.click();
      //remove removeEntity entity
      entityPage.deleteEntityButton('removeEntity').click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
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
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isPresent()).toBe(true);
      entityPage.confirmDialogNoButton.click();
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

    it ('should create a new entity for PII', function() {
      entityPage.toolsButton.click();
      entityPage.newEntityButton.click();
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.entityTitle.sendKeys('PIIEntity');
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isPresent()).toBe(true);
      entityPage.confirmDialogNoButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('PIIEntity')));
      expect(entityPage.getEntityBox('PIIEntity').isDisplayed()).toBe(true);
      entityPage.toolsButton.click();
    });

    it('should create a pii property', function(){
      browser.executeScript('window.document.getElementsByClassName("edit-start")[3].click()');
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
      entityPage.getPropertyName(lastProperty).sendKeys("pii_test");
      entityPage.getPropertyPii(lastProperty).click();
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys("this is a pii property");
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("pii_test");
      expect(entityPage.hasClass(entityPage.getPropertyPii(lastProperty), 'active')).toBe(true);
      expect(entityPage.getPropertyType(lastProperty).getAttribute('value')).toEqual("24: string");
      expect(entityPage.getPropertyDescription(lastProperty).getAttribute('value')).toEqual("this is a pii property");
      
      //add a non pii property
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys("no_pii");
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys("not a pii property");

      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
    });

    it ('should verify pii property to PII entity', function() {
      console.log('verify pii property to PII entity');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[3].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let piiProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(piiProperty).getAttribute('value')).toEqual('pii_test');
      expect(entityPage.getPropertyType(piiProperty).getAttribute('ng-reflect-model')).toEqual('string');
      expect(entityPage.getPropertyDescription(piiProperty).getAttribute('value')).toEqual('this is a pii property');
      // Verify that PII attribute is checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      console.log('verify pii toggling');
      // Turning off PII attribute to verify toggling
      entityPage.getPropertyPiiColumn(piiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(false);
      // Resetting back to the original state
      entityPage.getPropertyPiiColumn(piiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      let nonPiiProperty = entityPage.getPropertyByPosition(2);
      // Verify that PII attribute is not checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      // Turning on PII property to verify toggling
      entityPage.getPropertyPiiColumn(nonPiiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(true);
      // Resetting back to the original state      
      entityPage.getPropertyPiiColumn(nonPiiProperty).click();      
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should logout and login', function() {
      entityPage.logout();
      loginPage.isLoaded();
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
      loginPage.login();
      entityPage.isLoaded();
    });

    it ('should verify pii property is retained after logout', function() {
      console.log('verify pii property is retained after logout');
      browser.executeScript('window.document.getElementsByClassName("edit-start")[3].click()');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let piiProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(piiProperty).getAttribute('value')).toEqual('pii_test');
      expect(entityPage.getPropertyType(piiProperty).getAttribute('ng-reflect-model')).toEqual('string');
      expect(entityPage.getPropertyDescription(piiProperty).getAttribute('value')).toEqual('this is a pii property');
      // Verify that PII attribute is checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      let nonPiiProperty = entityPage.getPropertyByPosition(2);
      // Verify that PII attribute is not checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
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

    it ('should open Product entity disclosure', function() {
      flowPage.entityDisclosure('Product').click();
    });

    it ('should create input and harmonize flows on Product entity', function() {
      //create Product input flow
      flowPage.createFlow('Product', 'Load Products', 'INPUT', 'json', 'sjs', false);
      browser.wait(EC.visibilityOf(flowPage.getFlow('Product', 'Load Products', 'INPUT')));
      expect(flowPage.getFlow('Product', 'Load Products', 'INPUT').isDisplayed()).toBe(true, 'Load Products' + ' is not present');
      //create Product harmonize flow
      flowPage.createFlow('Product', 'Harmonize Products', 'HARMONIZE', 'json', 'sjs', false);
      browser.wait(EC.visibilityOf(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isDisplayed()).toBe(true, 'Harmonize Products' + ' is not present');
      //add flow options
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.visibilityOf(flowPage.tabs));
      console.log('clicking + button to add options')
      flowPage.addFlowOptionsButton().click();
      flowPage.addFlowOptionsButton().click();
      console.log('setting key value options')
      flowPage.setKeyValueFlowOptionsByPosition(1, 'hello', 'world');
      flowPage.setKeyValueFlowOptionsByPosition(2, 'myNumber', '250.456');
      flowPage.setKeyValueFlowOptionsByPosition(3, 'myDate', '2017-03-07');
    });

    it ('should retain flow options when moving around', function() {
      //move to other tab and go back to flows tab
      console.log('going to the other tab and back');
      flowPage.entitiesTab.click();
      entityPage.flowsTab.click();
      //verify the options are retained
      console.log('verify the flow options');
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.visibilityOf(flowPage.tabs));
      expect(flowPage.getKeyFlowOptionsByPosition(1).getAttribute('ng-reflect-model')).toEqual('hello');
      expect(flowPage.getValueFlowOptionsByPosition(1).getAttribute('ng-reflect-model')).toEqual('world');
      expect(flowPage.getKeyFlowOptionsByPosition(2).getAttribute('ng-reflect-model')).toEqual('myNumber');
      expect(flowPage.getValueFlowOptionsByPosition(2).getAttribute('ng-reflect-model')).toEqual('250.456');
      expect(flowPage.getKeyFlowOptionsByPosition(3).getAttribute('ng-reflect-model')).toEqual('myDate');
      expect(flowPage.getValueFlowOptionsByPosition(3).getAttribute('ng-reflect-model')).toEqual('2017-03-07');
      //move to other harmonize flow and go back to the flow
      console.log('going to the other flow and back');
      flowPage.entityDisclosure('TestEntity').click();
      browser.wait(EC.visibilityOf(flowPage.getFlow('TestEntity', 'sjs json HARMONIZE', 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', 'sjs json HARMONIZE', 'HARMONIZE').isPresent()).toBe(true);
      flowPage.getFlow('TestEntity', 'sjs json HARMONIZE', 'HARMONIZE').click();
      browser.wait(EC.visibilityOf(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      flowPage.entityDisclosure('Product').click();
      browser.wait(EC.visibilityOf(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isPresent()).toBe(true);
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      //verify the options are retained
      console.log('verify the flow options');
      browser.wait(EC.visibilityOf(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      expect(flowPage.getKeyFlowOptionsByPosition(1).getAttribute('ng-reflect-model')).toEqual('hello');
      expect(flowPage.getValueFlowOptionsByPosition(1).getAttribute('ng-reflect-model')).toEqual('world');
      expect(flowPage.getKeyFlowOptionsByPosition(2).getAttribute('ng-reflect-model')).toEqual('myNumber');
      expect(flowPage.getValueFlowOptionsByPosition(2).getAttribute('ng-reflect-model')).toEqual('250.456');
      expect(flowPage.getKeyFlowOptionsByPosition(3).getAttribute('ng-reflect-model')).toEqual('myDate');
      expect(flowPage.getValueFlowOptionsByPosition(3).getAttribute('ng-reflect-model')).toEqual('2017-03-07');
    });

    it ('should remove the flow options', function() {
      //add one option
      console.log('add one option');
      flowPage.addFlowOptionsButton().click();
      flowPage.setKeyValueFlowOptionsByPosition(4, 'removeMe', 'gone');
      flowPage.removeFlowOptionsByPositionButton(4).click();
      //verify the removed option
      console.log('verify the removed option');
      flowPage.entitiesTab.click();
      entityPage.flowsTab.click();
      flowPage.entityDisclosure('Product').click();
      browser.wait(EC.visibilityOf(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isPresent()).toBe(true);
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.visibilityOf(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      expect(flowPage.getKeyFlowOptionsByPosition(3).getAttribute('ng-reflect-model')).toEqual('myDate');
      expect(flowPage.getValueFlowOptionsByPosition(3).getAttribute('ng-reflect-model')).toEqual('2017-03-07');
      //verify the flow options count
      console.log('verify the flow options count');
      flowPage.getFlowOptionsCount().then(function(flowOptions){expect(flowOptions === 3)});
    });
  });
}
