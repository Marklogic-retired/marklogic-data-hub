import { browser, by, ExpectedConditions as EC } from 'protractor';
import loginPage from '../../page-objects/auth/login';
import entityPage from '../../page-objects/entities/entities';
import appPage from '../../page-objects/appPage';
import settingsPage from '../../page-objects/settings/settings'

const fs = require('fs-extra');

const selectCardinalityOneToOneOption = 'select option:nth-child(1)';
const selectCardinalityOneToManyOption = 'select option:nth-child(2)';

export default function (qaProjectDir) {
  describe('create entities', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
      browser.refresh();
    });

    let properties = entityPage.properties;

    xit('should login and go to entities page', async function () {
      //await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      await browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      await browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
    });

    /**
     * Create entity with title
     */
    it('should create a new Order entity', async function () {
      await appPage.entitiesTab.click();
      //create Order entity
      await console.log('create Order entity');
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      await browser.sleep(2000);
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('Order');
      await entityPage.saveEntity.click();
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      await browser.wait(EC.visibilityOf(entityPage.getEntityBox('Order')));
      expect(entityPage.getEntityBox('Order').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      // move entity Order
      await entityPage.selectEntity('Order');
      await browser.actions().dragAndDrop(entityPage.entityBox('Order'), {x: 200, y: 150}).perform();
    });

    /**
     * Create entity with title, version, description, URI and properties
     */
    it('should create a new Person entity with version, description, URI and properties', async function () {
      await browser.refresh();
      await browser.sleep(5000);
      await appPage.entitiesTab.click();
      await browser.sleep(3000);
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      await browser.sleep(5000);
      await expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('Person');
      await entityPage.entityDescription.sendKeys('Person description');
      await console.log('add properties to the entity');
      for (let property of properties) {
        let lastProperty = entityPage.lastProperty;
        await entityPage.addProperty.click();
        await entityPage.getPropertyName(lastProperty).sendKeys(property);
        await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
        await entityPage.getPropertyDescription(lastProperty).sendKeys(property + ' description');
        await entityPage.getPropertyPrimaryKey(lastProperty).click();
      }

      await entityPage.saveEntity.click();
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      await expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      await browser.wait(EC.visibilityOf(entityPage.getEntityBox('Person')));
      await expect(entityPage.getEntityBox('Person').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      await expect(entityPage.getEntityBoxDescription('Person')).toEqual('Person description');
    });

    /**
     * Modify entity, add description and URI
     */
    it('should add description, URI and properties to Order entity', async function () {
      await browser.refresh();
      await browser.waitForAngular();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //add properties
      await console.log('add description and URI to Order entity');
      await entityPage.clickEditEntity('Order');
      await browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityDescription.sendKeys('Order description');
      await entityPage.setEntityURI("http://example.org/orderUri/");
      await expect(entityPage.getEntityBoxDescription('Order')).toEqual('Order description');
      await expect(entityPage.getEntityBoxURI('Order')).toEqual("http://example.org/orderUri/");
      let lastProperty = entityPage.lastProperty;
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
      // add person property
      console.log('add person property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('person');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'Person')).click();
      await entityPage.getPropertyCardinality(lastProperty).element(by.css(selectCardinalityOneToManyOption)).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys('person description');
      await entityPage.getPropertyWordLexicon(lastProperty).click();
      // add pii property
      console.log('add pii_test property');
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys("pii_test");
      await entityPage.getPropertyPii(lastProperty).click();
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.getPropertyDescription(lastProperty).sendKeys("this is a pii property");

      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
    });

    it('should verify properties to Order entity', async function () {
      await browser.refresh();
      await browser.waitForAngular();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('verify properties to Order entity');
      await entityPage.clickEditEntity('Order');
      await browser.wait(EC.visibilityOf(entityPage.entityEditor));
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
      let personProperty = entityPage.getPropertyByPosition(3);
      expect(entityPage.getPropertyName(personProperty).getAttribute('value')).toEqual('person');
      expect(entityPage.getPropertyType(personProperty).getAttribute('value')).toContain('#/definitions/Person');
      expect(entityPage.getPropertyCardinality(personProperty).getAttribute('value')).toContain('ONE_TO_MANY');
      expect(entityPage.getPropertyDescription(personProperty).getAttribute('value')).toEqual('person description');
      expect(entityPage.hasClass(entityPage.getPropertyWordLexicon(personProperty), 'active')).toBe(true);
      let piiProperty = entityPage.getPropertyByPosition(4);
      expect(entityPage.getPropertyName(piiProperty).getAttribute('value')).toEqual('pii_test');
      expect(entityPage.getPropertyType(piiProperty).getAttribute('value')).toContain('string');
      expect(entityPage.getPropertyDescription(piiProperty).getAttribute('value')).toEqual('this is a pii property');
      expect(entityPage.hasClass(entityPage.getPropertyPii(piiProperty), 'active')).toBe(true);
      // verify duplicate property is not created, the count should be 4
      entityPage.getPropertiesCount().then(function (props) {
        expect(props).toEqual(4)
      });
      await entityPage.cancelEntity.click();
      browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    /**
     * Modify entity, remove properties.
     */
    it('should remove properties from Order entity', async function () {
      await browser.refresh();
      await browser.waitForAngular();
      await appPage.entitiesTab.click();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      //add properties
      console.log('modify properties of Order entity');
      await entityPage.clickEditEntity('Order');
      await browser.wait(EC.visibilityOf(entityPage.entityEditor));
      entityPage.getPropertiesCount().then(function (props) {
        expect(props).toEqual(4)
      });
      let lastProperty = entityPage.lastProperty;
      // remove 1 property
      console.log('remove 1 property');
      expect(lastProperty.isDisplayed());
      await browser.wait(EC.visibilityOf(entityPage.getPropertyCheckBox(lastProperty)));
      await entityPage.getPropertyCheckBox(lastProperty).click();
      await entityPage.deleteProperty.click();
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(entityPage.saveEntity));
      await entityPage.getPropertiesCount().then(function (props) {
        expect(props).toEqual(3)
      });
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogNoButton));
      expect(entityPage.confirmDialogNoButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogNoButton.click();
    });

    it('should verify naming conventions on properties', async function () {
      await browser.refresh();
      await browser.waitForAngular();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.clickEditEntity('Order');
      await browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      // add test property to verify white spaces
      console.log('add test property');
      await entityPage.addProperty.click();
      let lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('test white space');
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
      await browser.waitForAngular();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.clickEditEntity('Order');
      await browser.wait(EC.visibilityOf(entityPage.entityEditor));
      expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      // add test property to verify duplicate property
      console.log('add duplicate property');
      await entityPage.addProperty.click();
      let lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('price');
      // verify the error message on white space in property name
      let errorMessage = entityPage.errorWhiteSpaceMessage;
      expect(errorMessage.getText()).toBe('Property names are required, must be unique and whitespaces are not allowed');
      // verify if the Save button is disabled on white space
      expect(entityPage.saveEntity.isEnabled()).toBe(false);
      await entityPage.cancelEntity.click();
      await browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it('should not be able to use invalid character and space as title', async function () {
      await browser.refresh();
      await browser.waitForAngular();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      await browser.sleep(5000);
      await expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('$%# myTitle^&%*');
      await entityPage.saveEntity.click();
      // verify the error message on invalid character on title
      await browser.sleep(500);
      await expect(entityPage.errorInvalidTitleMessage.isDisplayed()).toBe(true);
      await entityPage.cancelEntity.click();
      await browser.wait(EC.invisibilityOf(entityPage.entityEditor));
    });

    it('should copy attachment-pii.json file to protect title on attachment', function () {
      //copy attachment-pii.json
      console.log('copy attachment-pii.json');
      let attachmentPiiFilePath = 'e2e/qa-data/protected-paths/attachment-pii.json';
      fs.copy(attachmentPiiFilePath, qaProjectDir + '/src/main/ml-config/security/protected-paths/attachment-pii.json');
    });

    xit('should redeploy hub to make the pii takes effect', async function () {
      await appPage.settingsTab.click();
      await settingsPage.isLoaded();
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
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      console.log('remove Order entity');
      await browser.wait(EC.visibilityOf(entityPage.getEntityBox('Order')));
      //await entityPage.toolsButton.click();
      await entityPage.clickDeleteEntity('Order');
      await browser.sleep(3000);
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      //count entities
      console.log('verify entity is deleted by count');
      await entityPage.getEntitiesCount().then(function (entities) {
        expect(entities === 1)
      });
    });
  });
}
