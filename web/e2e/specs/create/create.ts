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
      expect(loginPage.browseButton.isDisplayed()).toBe(true);
      expect(loginPage.projectList.isDisplayed()).toBe(true);
      expect(loginPage.folderBrowser.isPresent()).toBe(false);
      expect(loginPage.nextButton('ProjectDirTab').isDisplayed()).toBe(true);
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

    it ('Should open the examples folder', async function() {
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
    });

    it ('Should be on the environment tab', async function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(true);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
    });

    it ('Should be on the login tab', async function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(true);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      await loginPage.login();
    });

    it ('should go to the dashboard', async function() {
      dashboardPage.isLoaded();
      await dashboardPage.clearDatabases.click();
      browser.driver.sleep(3000);
      browser.wait(EC.elementToBeClickable(dashboardPage.clearButton));
      await dashboardPage.clearButton.click();
      //wait for all three to be 0
      let count = await dashboardPage.zeroCounts.count();
      expect(count).toEqual(3);
      console.log(count);
    });

    it ('should go to the entities page', async function() {
      browser.get('http://localhost:8080/#/entities');
      await appPage.entitiesTab.click();
      entityPage.isLoaded();
    });

    it ('should create a new Order entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      //create Order entity
      console.log('create Order entity');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('Order');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //browser.wait(EC.presenceOf(entityPage.toast));
      //browser.wait(EC.stalenessOf(entityPage.toast));
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Order')));
      expect(entityPage.getEntityBox('Order').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity Order
      await entityPage.selectEntity('Order');
      browser.actions().dragAndDrop(entityPage.entityBox('Order'), {x: 10, y: 150}).perform();
    });

    it ('should create a new Product entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      //create Product entity
      console.log('create Product entity');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('Product');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //browser.wait(EC.presenceOf(entityPage.toast));
      //browser.wait(EC.stalenessOf(entityPage.toast));
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Product')));
      expect(entityPage.getEntityBox('Product').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity Product
      await entityPage.selectEntity('Product');
      browser.actions().dragAndDrop(entityPage.entityBox('Product'), {x: 410, y: 150}).perform();
    });

    it ('should add properties to Product entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      //add properties
      console.log('add properties to Product entity');
      console.log('edit Product entity');
      let lastProperty = entityPage.lastProperty;
      await entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      // add sku property
      console.log('add sku property');
      await entityPage.addProperty.click();
      await entityPage.getPropertyName(lastProperty).sendKeys('sku');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('sku description');
      await entityPage.getPropertyPrimaryKey(lastProperty).click();
      // add price property
      console.log('add price property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('price');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('price description');
      await entityPage.getPropertyRangeIndex(lastProperty).click();
      // add titlePii property
      console.log('add titlePii property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('titlePii');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('titlePii description');
      await entityPage.getPropertyPii(lastProperty).click();
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //browser.wait(EC.presenceOf(entityPage.toast));
      //browser.wait(EC.stalenessOf(entityPage.toast));
    });

    it ('should add properties to Order entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      //add properties
      console.log('add properties to Order entity');
      console.log('edit Order entity');
      let lastProperty = entityPage.lastProperty;
      await entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      // add id property
      console.log('add id property');
      await entityPage.addProperty.click();
      // setting primary key first
      await entityPage.getPropertyPrimaryKey(lastProperty).click();
      await entityPage.getPropertyName(lastProperty).sendKeys('id');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('id description');
      // add price property
      console.log('add price property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('price');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('price description');
      await entityPage.getPropertyRangeIndex(lastProperty).click();
      // add products property
      console.log('add products property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('products');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'Product')).click();
      await entityPage.getPropertyCardinality(lastProperty).element(by.css(selectCardinalityOneToManyOption)).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('products description');
      await entityPage.getPropertyWordLexicon(lastProperty).click();
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //browser.wait(EC.presenceOf(entityPage.toast));
      //browser.wait(EC.stalenessOf(entityPage.toast));
    });

    it ('should verify properties to Product entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      console.log('verify properties to Product entity');
      await entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
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
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should verify properties to Order entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      console.log('verify properties to Order entity');
      await entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
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
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should remove a created entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      //create removeEntity entity
      console.log('create removeEntity entity');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      await entityPage.entityTitle.sendKeys('removeEntity');
      let lastProperty = entityPage.lastProperty;
      await entityPage.addProperty.click();
      await entityPage.getPropertyName(lastProperty).sendKeys('remove-prop1');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('remove-prop1 description');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //browser.wait(EC.presenceOf(entityPage.toast));
      //browser.wait(EC.stalenessOf(entityPage.toast));
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('removeEntity')));
      await entityPage.toolsButton.click();
      //remove removeEntity entity
      await entityPage.clickDeleteEntity('removeEntity');
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //count entities
      console.log('verify entity is deleted by count');
      entityPage.getEntitiesCount().then(function(entities){expect(entities === 2)});
    });

    it ('should create a new entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('TestEntity');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('TestEntity')));
      expect(entityPage.getEntityBox('TestEntity').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity TestEntity
      await entityPage.selectEntity('TestEntity');
      browser.actions().dragAndDrop(entityPage.entityBox('TestEntity'), {x: 810, y: 150}).perform();
    });

    //TODO: refactor out these create tests into specific tests
    //Here we're placing the create properties and remote properties along with index setting tests
    //These should probably be moved to specific tests files for each 'thing' entities, flow,
    // after the general create script and before the general tear down scripts

    it('should create a new property', async function(){
      browser.get('http://localhost:8080/#/entities');
      await entityPage.clickEditEntity('TestEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      //tell the UI to add the visual row
      await entityPage.addProperty.click();
      //now compare to see if the current count is 1
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});

      //select the last (or first if only 1) property
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isDisplayed() && lastProperty.isDisplayed());
      //populate the fields for name, range index, type, and description
      await entityPage.getPropertyName(lastProperty).sendKeys("sku");
      await entityPage.getPropertyRangeIndex(lastProperty).click();
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys("this is a test property");
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("sku");
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(lastProperty), 'active')).toBe(true);
      expect(entityPage.getPropertyType(lastProperty).getAttribute('value')).toEqual("24: string");
      expect(entityPage.getPropertyDescription(lastProperty).getAttribute('value')).toEqual("this is a test property");
      //let's add 1 more so we can remove one for the next test
      await entityPage.addProperty.click();
      //repoint last property to the new last property
      lastProperty = entityPage.lastProperty;
      expect(lastProperty.isDisplayed() && lastProperty.isDisplayed());
      //populate the fields for name, range index, type, and description
      await entityPage.getPropertyName(lastProperty).sendKeys("ID");
      await entityPage.getPropertyPrimaryKey(lastProperty).click();
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'integer')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys("this is our primary key");
      //let's save it now that it's populated
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
    });

    it('should remove a property', async function(){
      browser.get('http://localhost:8080/#/entities');
      //now time to delete, let's reopen the editor
      await entityPage.clickEditEntity('TestEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      //let's grab the count of the rows before we add so we can compare
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(2)});
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isDisplayed() && lastProperty.isDisplayed());
      await entityPage.getPropertyCheckBox(lastProperty).click();
      await entityPage.deleteProperty.click();
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.saveEntity));
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});
      //let's save it now that it's populated
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
    });

    it('should retain settings on remaining property', async function() {
      browser.get('http://localhost:8080/#/entities');
      //now let's confirm we didn't lose any settings, reopen editor
      await entityPage.clickEditEntity('TestEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      //Do we still have 1 property left?
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});
      //if so, grab it
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isDisplayed() && lastProperty.isDisplayed());
      //now let's compare them with our original tests to make sure the values are equal
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("sku");
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(lastProperty), 'active')).toBe(true);
      expect(entityPage.getPropertyType(lastProperty).getAttribute('value')).toEqual("24: string");
      expect(entityPage.getPropertyDescription(lastProperty).getAttribute('value')).toEqual("this is a test property");
      //if so, great, we're done!
      //so let's save this and go on with the other tests
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
    });

    it ('should create a new entity for PII', async function() {
      browser.get('http://localhost:8080/#/entities');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('PIIEntity');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('PIIEntity')));
      expect(entityPage.getEntityBox('PIIEntity').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity PIIEntity
      await entityPage.selectEntity('PIIEntity');
      browser.actions().dragAndDrop(entityPage.entityBox('PIIEntity'), {x: 10, y: 350}).perform();
    });

    it('should create a pii property', async function(){
      browser.get('http://localhost:8080/#/entities');
      await entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      //tell the UI to add the visual row
      await entityPage.addProperty.click();
      //now compare to see if the current count is 1
      entityPage.getPropertiesCount().then(function(props){expect(props).toEqual(1)});

      //select the last (or first if only 1) property
      let lastProperty = entityPage.lastProperty;
      expect(lastProperty.isDisplayed() && lastProperty.isDisplayed());
      //populate the fields for name, range index, type, and description
      await entityPage.getPropertyName(lastProperty).sendKeys("pii_test");
      await entityPage.getPropertyPii(lastProperty).click();
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys("this is a pii property");
      //let's see if our values hold!
      expect(entityPage.getPropertyName(lastProperty).getAttribute('value')).toEqual("pii_test");
      expect(entityPage.hasClass(entityPage.getPropertyPii(lastProperty), 'active')).toBe(true);
      expect(entityPage.getPropertyType(lastProperty).getAttribute('value')).toEqual("24: string");
      expect(entityPage.getPropertyDescription(lastProperty).getAttribute('value')).toEqual("this is a pii property");

      //add a non pii property
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys("no_pii");
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys("not a pii property");

      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //browser.wait(EC.presenceOf(entityPage.toast));
      //browser.wait(EC.stalenessOf(entityPage.toast));
    });

    it ('should verify pii property to PII entity', async function() {
      browser.get('http://localhost:8080/#/entities');
      console.log('verify pii property to PII entity');
      await entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      let piiProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(piiProperty).getAttribute('value')).toEqual('pii_test');
      expect(entityPage.getPropertyType(piiProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(piiProperty).getAttribute('value')).toEqual('this is a pii property');
      // Verify that PII attribute is checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      console.log('verify pii toggling');
      // Turning off PII attribute to verify toggling
      await entityPage.getPropertyPii(piiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(false);
      // Resetting back to the original state
      await entityPage.getPropertyPii(piiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      let nonPiiProperty = entityPage.getPropertyByPosition(2);
      // Verify that PII attribute is not checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      // Turning on PII property to verify toggling
      await entityPage.getPropertyPii(nonPiiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(true);
      // Resetting back to the original state
      await entityPage.getPropertyPii(nonPiiProperty).click();
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should verify naming conventions on properties', async function() {
      browser.get('http://localhost:8080/#/entities');
      await entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      // add test property to verify white spaces
      console.log('add test property');
      await entityPage.addProperty.click();
      let lastProperty = entityPage.lastProperty;
      entityPage.getPropertyName(lastProperty).sendKeys('test white space');
      // verify the error message on white space in property name
      let errorMessage = entityPage.errorWhiteSpaceMessage;
      expect(errorMessage.getText()).toBe('Property names are required, must be unique and whitespaces are not allowed');
      // verify if the Save button is disabled on white space
      expect(entityPage.saveEntity.isEnabled()).toBe(false);
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should not be able to create duplicate properties', async function() {
      browser.get('http://localhost:8080/#/entities');
      await entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      // add test property to verify duplicate property
      console.log('add duplicate property');
      await entityPage.addProperty.click();
      let lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('pii_test');
      // verify the error message on white space in property name
      let errorMessage = entityPage.errorWhiteSpaceMessage;
      expect(errorMessage.getText()).toBe('Property names are required, must be unique and whitespaces are not allowed');
      // verify if the Save button is disabled on white space
      expect(entityPage.saveEntity.isEnabled()).toBe(false);
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should not be able to use invalid character and space as title', async function() {
      browser.get('http://localhost:8080/#/entities');
      await entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('$%# myTitle^&%*');
      await entityPage.saveEntity.click();
      // verify the error message on invalid character on title
      expect(entityPage.errorInvalidTitleMessage.isDisplayed()).toBe(true);
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should logout and login', async function() {
      entityPage.logout();
      loginPage.isLoaded();
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it ('should go to the entity page', async function() {
      await appPage.entitiesTab.click();
      entityPage.isLoaded();
    });

    it ('should verify pii property is retained after logout', async function() {
      browser.get('http://localhost:8080/#/entities');
      console.log('verify pii property is retained after logout');
      await entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      let piiProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(piiProperty).getAttribute('value')).toEqual('pii_test');
      expect(entityPage.getPropertyType(piiProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(piiProperty).getAttribute('value')).toEqual('this is a pii property');
      // Verify that PII attribute is checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      let nonPiiProperty = entityPage.getPropertyByPosition(2);
      // Verify that PII attribute is not checked
      expect(entityPage.hasClass(entityPage.getPropertyPii(nonPiiProperty), 'active')).toBe(false);
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it ('should create a new entity for WorldBank', async function() {
      browser.get('http://localhost:8080/#/entities');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('WorldBank');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('WorldBank')));
      expect(entityPage.getEntityBox('WorldBank').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity WorldBank
      await entityPage.selectEntity('WorldBank');
      browser.actions().dragAndDrop(entityPage.entityBox('WorldBank'), {x: 750, y: 750}).perform();
    });

    it ('should copy attachment-pii.json file to protect title on attachment', function() {
      //copy attachment-pii.json
      console.log('copy attachment-pii.json');
      let attachmentPiiFilePath = 'e2e/qa-data/protected-paths/attachment-pii.json';
      fs.copy(attachmentPiiFilePath, tmpDir + '/src/main/ml-config/security/protected-paths/attachment-pii.json');
    });

    it ('should redeploy hub to make the pii takes effect', async function() {
      await appPage.settingsTab.click();
      settingsPage.isLoaded();
      await settingsPage.redeployButton.click();
      browser.wait(EC.elementToBeClickable(settingsPage.redeployConfirmation));
      await settingsPage.redeployConfirmation.click();
      browser.wait(EC.visibilityOf(settingsPage.redeployStatus));
      expect(settingsPage.redeployStatus.isDisplayed()).toBe(true);
      browser.sleep(150000);
      browser.wait(EC.invisibilityOf(settingsPage.redeployStatus));
    });

    it ('should go to the flow page', async function() {
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should open the Entity disclosure', async function() {
      browser.get('http://localhost:8080/#/flows');
      await flowPage.clickEntityDisclosure('TestEntity');
      browser.wait(EC.elementToBeClickable(flowPage.inputFlowButton('TestEntity')));
      browser.sleep(5000);
    });

    it('should create sjs xml input flow with ES', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'sjs';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create sjs json input flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'sjs';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, false);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy xml input flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'xqy';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, false);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy json input flow with ES', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'xqy';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.createInputFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'INPUT')));
      expect(flowPage.getFlow('TestEntity', flowName, 'INPUT').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create sjs xml harmonize flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'sjs';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      await flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create sjs json harmonize flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'sjs';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      await flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy xml harmonize flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'xqy';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      await flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it('should create xqy json harmonize flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'xqy';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} HARMONIZE`;
      await flowPage.createHarmonizeFlow('TestEntity', flowName, dataFormat, codeFormat, true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE')));
      expect(flowPage.getFlow('TestEntity', flowName, 'HARMONIZE').isDisplayed()).toBe(true, flowName + ' is not present');
      browser.sleep(3000);
    });

    it ('should open Product entity disclosure', async function() {
      browser.get('http://localhost:8080/#/flows');
      await flowPage.clickEntityDisclosure('Product');
      browser.wait(EC.elementToBeClickable(flowPage.inputFlowButton('Product')));
    });

    it ('should create input flow on Product entity', async function() {
      browser.get('http://localhost:8080/#/flows');
      //create Product input flow
      await flowPage.createInputFlow('Product', 'Load Products', 'json', 'sjs', false);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Load Products', 'INPUT')));
      expect(flowPage.getFlow('Product', 'Load Products', 'INPUT').isDisplayed()).toBe(true, 'Load Products' + ' is not present');
      browser.sleep(3000);
    });

    it ('should create harmonize flow on Product entity', async function() {
      browser.get('http://localhost:8080/#/flows');
      //create Product harmonize flow
      await flowPage.createHarmonizeFlow('Product', 'Harmonize Products', 'json', 'sjs', true);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isDisplayed()).toBe(true, 'Harmonize Products' + ' is not present');
      browser.sleep(3000);
      //add flow options
      await flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.elementToBeClickable(flowPage.tabs));
      console.log('clicking + button to add options')
      await flowPage.addFlowOptionsButton().click();
      await flowPage.addFlowOptionsButton().click();
      console.log('setting key value options')
      await flowPage.setKeyValueFlowOptionsByPosition(1, 'hello', 'world');
      await flowPage.setKeyValueFlowOptionsByPosition(2, 'myNumber', '250.456');
      await flowPage.setKeyValueFlowOptionsByPosition(3, 'myDate', '2017-03-07');
    });

    it ('should not create duplicate input flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      //create duplicate input flow
      await flowPage.inputFlowButton('Product').click();
      browser.wait(EC.visibilityOf(flowPage.newFlowDialog));
      expect(flowPage.newFlowDialog.isDisplayed()).toBe(true);
      await flowPage.newFlowName.sendKeys('Load Products');
      await flowPage.createFlowButton.click();
      expect(flowPage.duplicateFlowNameAlertText.getText()).toBe('Flow names must be unique. Entity "Product" already contains an Input flow named "Load Products"');
      await flowPage.cancelFlowButton.click();
      browser.wait(EC.stalenessOf(flowPage.newFlowDialog));
    });

    it ('should not create duplicate harmonize flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      //create duplicate input flow
      await flowPage.harmonizeFlowButton('Product').click();
      browser.wait(EC.visibilityOf(flowPage.newFlowDialog));
      expect(flowPage.newFlowDialog.isDisplayed()).toBe(true);
      await flowPage.newFlowName.sendKeys('Harmonize Products');
      await flowPage.createFlowButton.click();
      expect(flowPage.duplicateFlowNameAlertText.getText()).toBe('Flow names must be unique. Entity "Product" already contains a Harmonize flow named "Harmonize Products"');
      await flowPage.cancelFlowButton.click();
      browser.wait(EC.stalenessOf(flowPage.newFlowDialog));
    });

    it ('should redeploy modules', async function() {
      browser.get('http://localhost:8080/#/flows');
      flowPage.redeployButton.click();
      browser.sleep(5000);
      await appPage.dashboardTab.click();
      dashboardPage.isLoaded();
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });
  });
}
