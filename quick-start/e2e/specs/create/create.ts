import {  browser, by, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import flowPage from '../../page-objects/flows/flows';
import appPage from '../../page-objects/appPage';
import settingsPage from '../../page-objects/settings/settings';
const fs = require('fs-extra');

const selectCardinalityOneToOneOption = 'select option:nth-child(1)';
const selectCardinalityOneToManyOption = 'select option:nth-child(2)';

export default function(tmpDir) {
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
      //wait for all three to be 0
      browser.wait(dashboardPage.zeroCounts.count().then((count) => {
        expect(count).toEqual(3);
      }));
    });

    it ('should go to the entities page', function() {
      appPage.entitiesTab.click();
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
      entityPage.toolsButton.click();
      // move entity Order
      entityPage.selectEntity('Order');
      browser.actions().dragAndDrop(entityPage.entityBox('Order'), {x: 10, y: 150}).perform();
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
      entityPage.toolsButton.click();
      // move entity Product
      entityPage.selectEntity('Product');
      browser.actions().dragAndDrop(entityPage.entityBox('Product'), {x: 410, y: 150}).perform();
    });

    it ('should add properties to Product entity', function() {
      //add properties
      console.log('add properties to Product entity');
      console.log('edit Product entity');
      let lastProperty = entityPage.lastProperty;
      entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      // add sku property
      console.log('add sku property');
      entityPage.addProperty.click();
      entityPage.getPropertyName(lastProperty).sendKeys('sku');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('sku description');
      entityPage.getPropertyPrimaryKey(lastProperty).click();
      // add price property
      console.log('add price property');
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('price');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('price description');
      entityPage.getPropertyRangeIndex(lastProperty).click();
      // add titlePii property
      console.log('add titlePii property');
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('titlePii');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('titlePii description');
      entityPage.getPropertyPii(lastProperty).click();
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
      entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      // add id property
      console.log('add id property');
      entityPage.addProperty.click();
      // setting primary key first
      entityPage.getPropertyPrimaryKey(lastProperty).click();
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
      entityPage.getPropertyRangeIndex(lastProperty).click();
      // add products property
      console.log('add products property');
      entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('products');
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'Product')).click();
      entityPage.getPropertyCardinality(lastProperty).element(by.css(selectCardinalityOneToManyOption)).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys('products description');
      entityPage.getPropertyWordLexicon(lastProperty).click();
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
    });

    it ('should verify properties to Product entity', function() {
      console.log('verify properties to Product entity');
      entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let skuProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(skuProperty).getAttribute('value')).toEqual('sku');
      expect(entityPage.getPropertyType(skuProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(skuProperty).getAttribute('value')).toEqual('sku description');
      expect(entityPage.hasClass(entityPage.getPropertyPrimaryKey(skuProperty), 'active')).toBe(true);
      let priceProperty = entityPage.getPropertyByPosition(2);
      expect(entityPage.getPropertyName(priceProperty).getAttribute('value')).toEqual('price');
      expect(entityPage.getPropertyType(priceProperty).getAttribute('value')).toContain('decimal');
      expect(entityPage.getPropertyDescription(priceProperty).getAttribute('value')).toEqual('price description');
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(priceProperty), 'active')).toBe(true);
      let titlePiiProperty = entityPage.getPropertyByPosition(3);
      expect(entityPage.getPropertyName(titlePiiProperty).getAttribute('value')).toEqual('titlePii');
      expect(entityPage.getPropertyType(titlePiiProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(titlePiiProperty).getAttribute('value')).toEqual('titlePii description');
      expect(entityPage.hasClass(entityPage.getPropertyPii(titlePiiProperty), 'active')).toBe(true);
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should verify properties to Order entity', function() {
      console.log('verify properties to Order entity');
      entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let idProperty = entityPage.getPropertyByPosition(1);
      // verify that primary key is retained
      expect(entityPage.getPropertyName(idProperty).getAttribute('value')).toEqual('id');
      expect(entityPage.getPropertyType(idProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(idProperty).getAttribute('value')).toEqual('id description');
      expect(entityPage.hasClass(entityPage.getPropertyPrimaryKey(idProperty), 'active')).toBe(true);
      let priceProperty = entityPage.getPropertyByPosition(2);
      expect(entityPage.getPropertyName(priceProperty).getAttribute('value')).toEqual('price');
      expect(entityPage.getPropertyType(priceProperty).getAttribute('value')).toContain('decimal');
      expect(entityPage.getPropertyCardinality(priceProperty).getAttribute('value')).toContain('ONE_TO_ONE');
      expect(entityPage.getPropertyDescription(priceProperty).getAttribute('value')).toEqual('price description');
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(priceProperty), 'active')).toBe(true);
      let productsProperty = entityPage.getPropertyByPosition(3);
      expect(entityPage.getPropertyName(productsProperty).getAttribute('value')).toEqual('products');
      expect(entityPage.getPropertyType(productsProperty).getAttribute('value')).toContain('#/definitions/Product');
      expect(entityPage.getPropertyCardinality(productsProperty).getAttribute('value')).toContain('ONE_TO_MANY');
      expect(entityPage.getPropertyDescription(productsProperty).getAttribute('value')).toEqual('products description');
      expect(entityPage.hasClass(entityPage.getPropertyWordLexicon(productsProperty), 'active')).toBe(true);
      // verify duplicate property is not created, the count should be 3
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(3)});
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should remove some properties on Order entity', function() {
      console.log('verify remove properties on Order entity');
      let lastProperty = entityPage.lastProperty;
      entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //add some additional properties
      console.log('add additional properties');
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
      entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let removeProp1 = entityPage.getPropertyByPosition(4);
      let removeProp2 = entityPage.getPropertyByPosition(5);
      entityPage.getPropertyCheckBox(removeProp1).click();
      entityPage.getPropertyCheckBox(removeProp2).click();
      entityPage.deleteProperty.click();
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      entityPage.confirmDialogYesButton.click();
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.saveEntity));
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.wait(EC.presenceOf(entityPage.toast));
      browser.wait(EC.stalenessOf(entityPage.toast));
      //verify that the properties are removed
      console.log('verify properties are removed');
      entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //console.log('verify properties count');
      //entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(3)});
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
      // move entity TestEntity
      entityPage.selectEntity('TestEntity');
      browser.actions().dragAndDrop(entityPage.entityBox('TestEntity'), {x: 810, y: 150}).perform();
    });

    //TODO: refactor out these create tests into specific tests
    //Here we're placing the create properties and remote properties along with index setting tests
    //These should probably be moved to specific tests files for each 'thing' entities, flow,
    // after the general create script and before the general tear down scripts

    it('should create a new property', function(){
      entityPage.clickEditEntity('TestEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //tell the UI to add the visual row
      entityPage.addProperty.click();
      //now compare to see if the current count is 1
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});

      //select the last (or first if only 1) property
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isPresent() && lastProperty.isDisplayed());
      //populate the fields for name, range index, type, and description
      entityPage.getPropertyName(lastProperty).sendKeys("sku");
      entityPage.getPropertyRangeIndex(lastProperty).click();
      entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      entityPage.getPropertyDescription(lastProperty).sendKeys("this is a test property");
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("sku");
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
      entityPage.getPropertyPrimaryKey(lastProperty).click();
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
      entityPage.clickEditEntity('TestEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //let's grab the count of the rows before we add so we can compare
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(2)});
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isPresent() && lastProperty.isDisplayed());
      entityPage.getPropertyCheckBox(lastProperty).click();
      entityPage.deleteProperty.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
      entityPage.confirmDialogYesButton.click();
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.saveEntity));
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});
      //let's save it now that it's populated
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isPresent()).toBe(true);
      entityPage.confirmDialogNoButton.click();
    });

    it('should retain settings on remaining property', function() {
      //now let's confirm we didn't lose any settings, reopen editor
      entityPage.clickEditEntity('TestEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //Do we still have 1 property left?
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});
      //if so, grab it
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isPresent() && lastProperty.isDisplayed());
      //now let's compare them with our original tests to make sure the values are equal
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("sku");
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
      // move entity PIIEntity
      entityPage.selectEntity('PIIEntity');
      browser.actions().dragAndDrop(entityPage.entityBox('PIIEntity'), {x: 10, y: 350}).perform();
    });

    it('should create a pii property', function(){
      entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      //tell the UI to add the visual row
      entityPage.addProperty.click();
      //now compare to see if the current count is 1
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});

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
      entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let piiProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(piiProperty).getAttribute('value')).toEqual('pii_test');
      expect(entityPage.getPropertyType(piiProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(piiProperty).getAttribute('value')).toEqual('this is a pii property');
      // Verify that PII attribute is checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      console.log('verify pii toggling');
      // Turning off PII attribute to verify toggling
      entityPage.getPropertyPii(piiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(false);
      // Resetting back to the original state
      entityPage.getPropertyPii(piiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      let nonPiiProperty = entityPage.getPropertyByPosition(2);
      // Verify that PII attribute is not checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      // Turning on PII property to verify toggling
      entityPage.getPropertyPii(nonPiiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(true);
      // Resetting back to the original state
      entityPage.getPropertyPii(nonPiiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should verify naming conventions on properties', function() {
      entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      // add test property to verify white spaces
      console.log('add test property');
      entityPage.addProperty.click();
      let lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('test white space');
      // verify the error message on white space in property name
      let errorMessage = entityPage.errorWhiteSpaceMessage;
      expect(errorMessage.getText()).toBe('Property names are required, must be unique and whitespaces are not allowed');
      // verify if the Save button is disabled on white space
      expect(entityPage.saveEntity.isEnabled()).toBe(false);
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should not be able to create duplicate properties', function() {
      entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      // add test property to verify duplicate property
      console.log('add duplicate property');
      entityPage.addProperty.click();
      let lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('pii_test');
      // verify the error message on white space in property name
      let errorMessage = entityPage.errorWhiteSpaceMessage;
      expect(errorMessage.getText()).toBe('Property names are required, must be unique and whitespaces are not allowed');
      // verify if the Save button is disabled on white space
      expect(entityPage.saveEntity.isEnabled()).toBe(false);
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
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it ('should go to the entity page', function() {
      appPage.entitiesTab.click();
      entityPage.isLoaded();
    });

    it ('should verify pii property is retained after logout', function() {
      console.log('verify pii property is retained after logout');
      entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      let piiProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(piiProperty).getAttribute('value')).toEqual('pii_test');
      expect(entityPage.getPropertyType(piiProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(piiProperty).getAttribute('value')).toEqual('this is a pii property');
      // Verify that PII attribute is checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      let nonPiiProperty = entityPage.getPropertyByPosition(2);
      // Verify that PII attribute is not checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should create a new entity for WorldBank', function() {
      entityPage.toolsButton.click();
      entityPage.newEntityButton.click();
      expect(entityPage.entityEditor.isPresent()).toBe(true);
      entityPage.entityTitle.sendKeys('WorldBank');
      entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isPresent()).toBe(true);
      entityPage.confirmDialogNoButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('WorldBank')));
      expect(entityPage.getEntityBox('WorldBank').isDisplayed()).toBe(true);
      entityPage.toolsButton.click();
      // move entity WorldBank
      entityPage.selectEntity('WorldBank');
      browser.actions().dragAndDrop(entityPage.entityBox('WorldBank'), {x: 750, y: 750}).perform();
    });

    it ('should copy attachment-pii.json file to protect title on attachment', function() {
      //copy attachment-pii.json
      console.log('copy attachment-pii.json');
      let attachmentPiiFilePath = 'e2e/qa-data/protected-paths/attachment-pii.json';
      fs.copy(attachmentPiiFilePath, tmpDir + '/src/main/ml-config/security/protected-paths/attachment-pii.json');
    });

    it ('should redeploy hub to make the pii takes effect', function() {
      appPage.settingsTab.click();
      settingsPage.isLoaded();
      settingsPage.redeployButton.click();
      browser.wait(EC.elementToBeClickable(settingsPage.redeployConfirmation));
      settingsPage.redeployConfirmation.click();
      browser.wait(EC.visibilityOf(settingsPage.redeployStatus));
      expect(settingsPage.redeployStatus.isDisplayed()).toBe(true);
      browser.sleep(120000);
      browser.wait(EC.invisibilityOf(settingsPage.redeployStatus));
    });

    it ('should go to the flow page', function() {
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should redeploy modules', function() {
      flowPage.redeployButton.click();
      browser.sleep(5000);
      appPage.dashboardTab.click();
      dashboardPage.isLoaded();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should open the Entity disclosure', function() {
      flowPage.clickEntityDisclosure('TestEntity');
      browser.wait(EC.elementToBeClickable(flowPage.inputFlowButton('TestEntity')));
      browser.sleep(5000);
    });

    it('should create sjs xml input flow with ES', function() {
      let codeFormat = 'sjs';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create sjs json input flow', function() {
      let codeFormat = 'sjs';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, false);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy xml input flow', function() {
      let codeFormat = 'xqy';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, false);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy json input flow with ES', function() {
      let codeFormat = 'xqy';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create sjs xml harmonize flow', function() {
      let codeFormat = 'sjs';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create sjs json harmonize flow', function() {
      let codeFormat = 'sjs';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy xml harmonize flow', function() {
      let codeFormat = 'xqy';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy json harmonize flow', function() {
      let codeFormat = 'xqy';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });
    
    it ('should open Product entity disclosure', function() {
      flowPage.clickEntityDisclosure('Product');
      browser.wait(EC.elementToBeClickable(flowPage.inputFlowButton('Product')));
    });

    it ('should create input flow on Product entity', function() {
      //create Product input flow
      flowPage.createInputFlow('Product', 'Load Products', 'json', 'sjs', false);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Load Products', 'INPUT')));
      expect(flowPage.getFlow('Product', 'Load Products', 'INPUT').isDisplayed()).toBe(true, 'Load Products' + ' is not present');
      browser.sleep(3000);
    });

    it ('should create harmonize flow on Product entity', function() {
      //create Product harmonize flow
      flowPage.createHarmonizeFlow('Product', 'Harmonize Products', 'json', 'sjs', true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isDisplayed()).toBe(true, 'Harmonize Products' + ' is not present');
      browser.sleep(3000);
      //add flow options
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.elementToBeClickable(flowPage.tabs));
      console.log('clicking + button to add options')
      flowPage.addFlowOptionsButton().click();
      flowPage.addFlowOptionsButton().click();
      console.log('setting key value options')
      flowPage.setKeyValueFlowOptionsByPosition(1, 'hello', 'world');
      flowPage.setKeyValueFlowOptionsByPosition(2, 'myNumber', '250.456');
      flowPage.setKeyValueFlowOptionsByPosition(3, 'myDate', '2017-03-07');
    });

    /*it ('should retain flow options when moving around', function() {
      //move to other tab and go back to flows tab
      console.log('going to the other tab and back');
      appPage.entitiesTab.click();
      entityPage.isLoaded();
      appPage.flowsTab.click();
      flowPage.isLoaded();
      flowPage.clickEntityDisclosure('Product');
      browser.wait(EC.visibilityOf(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      //verify the options are retained
      console.log('verify the flow options');
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.visibilityOf(flowPage.tabs));
      expect(flowPage.getKeyFlowOptionsByPosition(1).getAttribute('value')).toEqual('hello');
      expect(flowPage.getValueFlowOptionsByPosition(1).getAttribute('value')).toEqual('world');
      expect(flowPage.getKeyFlowOptionsByPosition(2).getAttribute('value')).toEqual('myNumber');
      expect(flowPage.getValueFlowOptionsByPosition(2).getAttribute('value')).toEqual('250.456');
      expect(flowPage.getKeyFlowOptionsByPosition(3).getAttribute('value')).toEqual('myDate');
      expect(flowPage.getValueFlowOptionsByPosition(3).getAttribute('value')).toEqual('2017-03-07');
      //move to other harmonize flow and go back to the flow
      console.log('going to the other flow and back');
      flowPage.clickEntityDisclosure('TestEntity');
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', 'sjs json HARMONIZE', 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', 'sjs json HARMONIZE', 'HARMONIZE').isPresent()).toBe(true);
      flowPage.getFlow('TestEntity', 'sjs json HARMONIZE', 'HARMONIZE').click();
      browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      flowPage.clickEntityDisclosure('Product');
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isPresent()).toBe(true);
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      //verify the options are retained
      console.log('verify the flow options');
      browser.wait(EC.visibilityOf(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      expect(flowPage.getKeyFlowOptionsByPosition(1).getAttribute('value')).toEqual('hello');
      expect(flowPage.getValueFlowOptionsByPosition(1).getAttribute('value')).toEqual('world');
      expect(flowPage.getKeyFlowOptionsByPosition(2).getAttribute('value')).toEqual('myNumber');
      expect(flowPage.getValueFlowOptionsByPosition(2).getAttribute('value')).toEqual('250.456');
      expect(flowPage.getKeyFlowOptionsByPosition(3).getAttribute('value')).toEqual('myDate');
      expect(flowPage.getValueFlowOptionsByPosition(3).getAttribute('value')).toEqual('2017-03-07');
    });

    it ('should remove the flow options', function() {
      //add one option
      console.log('add one option');
      flowPage.addFlowOptionsButton().click();
      flowPage.setKeyValueFlowOptionsByPosition(4, 'removeMe', 'gone');
      flowPage.removeFlowOptionsByPositionButton(4).click();
      //verify the removed option
      console.log('verify the removed option');
      appPage.entitiesTab.click();
      entityPage.isLoaded();
      appPage.flowsTab.click();
      flowPage.isLoaded();
      flowPage.clickEntityDisclosure('Product');
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isPresent()).toBe(true);
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      expect(flowPage.getKeyFlowOptionsByPosition(3).getAttribute('value')).toEqual('myDate');
      expect(flowPage.getValueFlowOptionsByPosition(3).getAttribute('value')).toEqual('2017-03-07');
      //verify the flow options count
      console.log('verify the flow options count');
      flowPage.getFlowOptionsCount().then(function(flowOptions){expect(flowOptions).toEqual(3)});
    });*/
  });
}
