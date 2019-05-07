import {browser, by, ExpectedConditions as EC, Key} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import entityPage from '../../page-objects/entities/entities';
import appPage from '../../page-objects/appPage';
import settingsPage from '../../page-objects/settings/settings'
import dashboardPage from '../../page-objects/dashboard/dashboard';


const fs = require('fs-extra');

const selectCardinalityOneToOneOption = 'select option:nth-child(1)';
const selectCardinalityOneToManyOption = 'select option:nth-child(2)';

export default function (qaProjectDir) {
  describe('create entities', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
      browser.refresh();
    });

    xit('should login and go to entities page', async function () {
      //await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await browser.sleep(5000);
      browser.wait(EC.visibilityOf(dashboardPage.clearFinalButton()));
      //dashboardPage.isLoaded();
    });

    /**
     * Create entity with title
     */
    it('should create a new Order entity', async function () {
      await appPage.entitiesTab.click();
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
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Order')));
      expect(entityPage.getEntityBox('Order').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity Order
      await entityPage.selectEntity('Order');
      await browser.actions().dragAndDrop(entityPage.entityBox('Order'), {x: 200, y: 150}).perform();
    });

    /**
     * Create entity with title, description and URI
     */
    it('should create a new Product entity with description and URI', async function () {
      await appPage.entitiesTab.click();
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //create Product entity
      console.log('create Product entity');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('Product');
      await entityPage.entityDescription.sendKeys('Product description');
      await entityPage.entityURI.sendKeys('Product URI');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Product')));
      expect(entityPage.getEntityBox('Product').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      await expect(entityPage.getEntityBoxDescription('Product')).toEqual('Product description');
      await expect(entityPage.getEntityBoxURI('Product')).toEqual('Product URI');
      // move entity Product
      console.log('shifting Product entity');
      await entityPage.selectEntity('Product');
      await browser.actions().dragAndDrop(entityPage.entityBox('Product'), {x: 400, y: 250}).perform();
    });

    /**
     * Create entity with title, version, description, URI and properties
     */
    it('should create a new Person entity with version, description, URI and properties', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //create Person entity
      console.log('create Person entity');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('Person');
      await entityPage.entityVersion.sendKeys(Key.chord(Key.CONTROL, "a"), '1');
      await entityPage.entityDescription.sendKeys('Person description');
      await entityPage.entityURI.sendKeys('Person URI');
      console.log('add properties to Person entity');
      let lastProperty = entityPage.lastProperty;
      // add id property
      console.log('add id property');
      await entityPage.addProperty.click();
      await entityPage.getPropertyName(lastProperty).sendKeys('id');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('id description');
      await entityPage.getPropertyPrimaryKey(lastProperty).click();
      // add fname property
      console.log('add fname property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('fname');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('fname description');
      await entityPage.getPropertyRangeIndex(lastProperty).click();
      // add lname property
      console.log('add lname property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('lname');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('lname description');
      await entityPage.getPropertyPii(lastProperty).click();
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Person')));
      expect(entityPage.getEntityBox('Person').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      await expect(entityPage.getEntityBoxVersion('Person')).toEqual('v1');
      await expect(entityPage.getEntityBoxDescription('Person')).toEqual('Person description');
      await expect(entityPage.getEntityBoxURI('Person')).toEqual('Person URI');
    });

    it('should verify properties to Person entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('verify properties to Person entity');
      await entityPage.clickEditEntity('Person');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      let idProperty = entityPage.getPropertyByPosition(1);
      expect(entityPage.getPropertyName(idProperty).getAttribute('value')).toEqual('id');
      expect(entityPage.getPropertyType(idProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(idProperty).getAttribute('value')).toEqual('id description');
      expect(entityPage.hasClass(entityPage.getPropertyPrimaryKey(idProperty), 'active')).toBe(true);
      let fnameProperty = entityPage.getPropertyByPosition(2);
      expect(entityPage.getPropertyName(fnameProperty).getAttribute('value')).toEqual('fname');
      expect(entityPage.getPropertyType(fnameProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(fnameProperty).getAttribute('value')).toEqual('fname description');
      expect(entityPage.hasClass(entityPage.getPropertyRangeIndex(fnameProperty), 'active')).toBe(true);
      let lnameProperty = entityPage.getPropertyByPosition(3);
      expect(entityPage.getPropertyName(lnameProperty).getAttribute('value')).toEqual('lname');
      expect(entityPage.getPropertyType(lnameProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(lnameProperty).getAttribute('value')).toEqual('lname description');
      browser.sleep(180000);
      expect(entityPage.hasClass(entityPage.getPropertyPii(lnameProperty), 'active')).toBe(true);
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    /**
     * Modify entity, add description and URI
     */
    it('should add description and URI to Order entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //add properties
      console.log('add description and URI to Order entity');
      await entityPage.clickEditEntity('Order');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityDescription.sendKeys('Order description');
      await entityPage.entityURI.sendKeys('Order URI');
      await expect(entityPage.getEntityBoxDescription('Order')).toEqual('Order description');
      await expect(entityPage.getEntityBoxURI('Order')).toEqual('Order URI');
    });

    /**
     * Modify entity, change description and URI
     */
    it('should modify the Product entity change description and URI', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //modify Product entity
      console.log('modify Product entity');
      await entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      console.log('modify description');
      await entityPage.entityDescription.sendKeys(Key.chord(Key.CONTROL, "a"), 'Modified Product description');
      console.log('modify URI');
      await entityPage.entityURI.sendKeys(Key.chord(Key.CONTROL, "a"), 'Modified Product URI');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Product')));
      expect(entityPage.getEntityBox('Product').isDisplayed()).toBe(true);
      await expect(entityPage.getEntityBoxDescription('Product')).toEqual('Modified Product description');
      await expect(entityPage.getEntityBoxURI('Product')).toEqual('Modified Product URI');
    });

    /**
     * Modify entity, remove description and URI
     */
    it('should modify the Product entity remove description and URI', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //modify Product entity
      console.log('modify Product entity');
      await entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      console.log('remove description');
      await entityPage.entityDescription.sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE);
      console.log('remove URI');
      await entityPage.entityURI.sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE);
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Product')));
      expect(entityPage.getEntityBox('Product').isDisplayed()).toBe(true);
      await expect(entityPage.getEntityBoxDescription('Product')).toEqual('No description yet');
      await expect(entityPage.getEntityBoxURI('Product')).toEqual('No Base URI yet');
    });

    /**
     * Modify entity, add properties.
     */
    it('should add properties to Product entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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
    });

    it('should verify properties to Product entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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

    it('should add properties to Order entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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
    });

    it('should verify properties to Order entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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
      entityPage.getPropertiesCount().then(function (props) {
        expect(props).toEqual(3)
      });
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    /**
     * Modify entity, change properties.
     */
    it('should modify properties to Product entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //add properties
      console.log('modify properties of Product entity');
      await entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      // modify id property
      console.log('modify id property');
      let idProperty = entityPage.getPropertyByPosition(1);
      await entityPage.getPropertyType(idProperty).element(by.cssContainingText('option', 'integer')).click();
      await entityPage.getPropertyDescription(idProperty).sendKeys(Key.chord(Key.CONTROL, "a"), 'Modified id description');
      expect(entityPage.getPropertyType(idProperty).getAttribute('value')).toContain('integer');
      expect(entityPage.getPropertyDescription(idProperty).getAttribute('value')).toEqual('Modified id description');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
    });

    /**
     * Modify entity, remove properties.
     */
    it('should remove properties from Product entity', async function () {
      await browser.refresh();
      await appPage.entitiesTab.click();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //add properties
      console.log('modify properties of Product entity');
      await entityPage.clickEditEntity('Product');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      entityPage.getPropertiesCount().then(function (props) {
        expect(props).toEqual(3)
      });
      let lastProperty = entityPage.lastProperty;
      // remove 1 property
      console.log('remove 1 property');
      expect(lastProperty.isDisplayed());
      browser.wait(EC.visibilityOf(entityPage.getPropertyCheckBox(lastProperty)));
      await entityPage.getPropertyCheckBox(lastProperty).click();
      await entityPage.deleteProperty.click();
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(entityPage.saveEntity));
      entityPage.getPropertiesCount().then(function (props) {
        expect(props).toEqual(2)
      });
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
    });

    it('should create a new entity for PII', async function () {
      await appPage.entitiesTab.click();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('PIIEntity');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.clickConfirmDialogNoButton;
      //await entityPage.confirmDialogNoButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('PIIEntity')));
      expect(entityPage.getEntityBox('PIIEntity').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity PIIEntity
      await entityPage.selectEntity('PIIEntity');
      await browser.actions().dragAndDrop(entityPage.entityBox('PIIEntity'), {x: 10, y: 350}).perform();
    });

    it('should create a pii property', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.clickEditEntity('PIIEntity');
      browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      //tell the UI to add the visual row
      await entityPage.addProperty.click();
      //now compare to see if the current count is 1
      entityPage.getPropertiesCount().then(function (props) {
        expect(props).toEqual(1)
      });

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
    });

    it('should verify pii property to PII entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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

    it('should verify naming conventions on properties', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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

    it('should not be able to create duplicate properties', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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

    it('should not be able to use invalid character and space as title', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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

    it('should logout and login', async function () {
      await entityPage.logout();
      loginPage.isLoaded();
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it('should go to the entity page', async function () {
      await appPage.entitiesTab.click();
      entityPage.isLoaded();
    });

    it('should verify pii property is retained after logout', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
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

    it('should create a new entity for WorldBank', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      browser.sleep(5000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('WorldBank');
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      //await entityPage.confirmDialogNoButton.click();
      await entityPage.clickConfirmDialogNoButton;
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('WorldBank')));
      expect(entityPage.getEntityBox('WorldBank').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity WorldBank
      await entityPage.selectEntity('WorldBank');
      await browser.actions().dragAndDrop(entityPage.entityBox('WorldBank'), {x: 550, y: 550}).perform();
    });

    it('should copy attachment-pii.json file to protect title on attachment', function () {
      //copy attachment-pii.json
      console.log('copy attachment-pii.json');
      let attachmentPiiFilePath = 'e2e/qa-data/protected-paths/attachment-pii.json';
      fs.copy(attachmentPiiFilePath, qaProjectDir + '/src/main/ml-config/security/protected-paths/attachment-pii.json');
    });

    it('should redeploy hub to make the pii takes effect', async function () {
      await appPage.settingsTab.click();
      settingsPage.isLoaded();
      await settingsPage.redeployButton.click();
      browser.wait(EC.elementToBeClickable(settingsPage.redeployConfirmation));
      await settingsPage.redeployConfirmation.click();
      browser.wait(EC.visibilityOf(settingsPage.redeployStatus));
      expect(settingsPage.redeployStatus.isDisplayed()).toBe(true);
      browser.sleep(180000);
      browser.wait(EC.invisibilityOf(settingsPage.redeployStatus));
    });

    /**
     * remove entity
     */
    it('should remove Order entity', async function () {
      await appPage.entitiesTab.click();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('remove Order entity');
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Order')));
      //await entityPage.toolsButton.click();
      await entityPage.clickDeleteEntity('Order');
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //count entities
      console.log('verify entity is deleted by count');
      entityPage.getEntitiesCount().then(function (entities) {
        expect(entities === 4)
      });
    });

    it('should remove Product entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('remove Product entity');
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Product')));
      await entityPage.toolsButton.click();
      await entityPage.clickDeleteEntity('Product');
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //count entities
      console.log('verify entity is deleted by count');
      entityPage.getEntitiesCount().then(function (entities) {
        expect(entities === 3)
      });
    });

    it('should remove Person entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('remove Person entity');
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Person')));
      await entityPage.toolsButton.click();
      await entityPage.clickDeleteEntity('Person');
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //count entities
      console.log('verify entity is deleted by count');
      entityPage.getEntitiesCount().then(function (entities) {
        expect(entities === 2)
      });
    });

    it('should remove PIIEntity entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('remove PIIEntity entity');
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('PIIEntity')));
      await entityPage.toolsButton.click();
      await entityPage.clickDeleteEntity('PIIEntity');
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //count entities
      console.log('verify entity is deleted by count');
      entityPage.getEntitiesCount().then(function (entities) {
        expect(entities === 1)
      });
    });

    it('should remove WorldBank entity', async function () {
      await browser.refresh();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('remove WorldBank entity');
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('WorldBank')));
      await entityPage.toolsButton.click();
      await entityPage.clickDeleteEntity('WorldBank');
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //count entities
      console.log('verify entity is deleted by count');
      entityPage.getEntitiesCount().then(function (entities) {
        expect(entities === 0)
      });
    });
  });
}
