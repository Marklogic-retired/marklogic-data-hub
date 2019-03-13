import { browser, ExpectedConditions as EC} from 'protractor';
import flowPage from '../../page-objects/flows/flows';
import appPage from '../../page-objects/appPage';
import browsePage from '../../page-objects/browse/browse';
import mappingsPage from '../../page-objects/mappings/mappings';
import viewerPage from '../../page-objects/viewer/viewer';
import entityPage from "../../page-objects/entities/entities";

export default function() {
    describe('Run Mappings', () => {
      it('should go to flows tab', async function() {
        await appPage.flowsTab.click();
        flowPage.isLoaded();
      });

      it ('should redeploy modules', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it('should create a mapping for Product entity with sku source', async function() {
        browser.get('http://localhost:8080/#/browse');
        // get the document uri with sku - board_games_accessories.csv-0-1
        await appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        await browsePage.searchBox().clear();
        await browsePage.searchBox().sendKeys('442403950907');
        await browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        let sourceDocUriWithSmallSku =
          browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1?doc=yes&type=foo').getText();
        browser.get('http://localhost:8080/#/mappings');
        // create the map with specific sku doc uri
        await appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.newMapButton('Product')));
        await mappingsPage.newMapButton('Product').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.mapNameInputField()));
        await mappingsPage.mapNameInputField().sendKeys('MapProduct');
        await mappingsPage.mapDescriptionInputField().sendKeys('description for Product map');
        await mappingsPage.mapCreateButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(8000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        await mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        expect(mappingsPage.mapTitle.getText()).toContain('MapProduct');
        // change the source URI to document containing sku
        await mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        await mappingsPage.inputSourceURI().clear();
        await mappingsPage.inputSourceURI().sendKeys(sourceDocUriWithSmallSku);
        await mappingsPage.editSourceURITick().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // select source for sku
        await mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        await mappingsPage.sourceTypeAheadInput('sku').sendKeys('sku');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('sku', 'sku')));
        await mappingsPage.mapSourceProperty('sku', 'sku').click();
        // select source for price
        await mappingsPage.sourcePropertyDropDown('price').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('price')));
        await mappingsPage.sourceTypeAheadInput('price').sendKeys('price');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('price', 'price')));
        await mappingsPage.mapSourceProperty('price', 'price').click();
        // verify the source property
        expect(mappingsPage.verifySourcePropertyName('sku').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isDisplayed()).toBeTruthy();
        // verify the property icon
        expect(mappingsPage.entityPropertyIcon('sku', 'key').isDisplayed()).toBeTruthy();
        expect(mappingsPage.entityPropertyIcon('price', 'bolt').isDisplayed()).toBeTruthy();
        // save the map
        browser.wait(EC.elementToBeClickable(mappingsPage.saveMapButton()));
        await mappingsPage.saveMapButton().click();
        browser.sleep(5000);
        //browser.wait(EC.presenceOf(entityPage.toast));
        //browser.wait(EC.stalenessOf(entityPage.toast));
        expect(mappingsPage.verifySourcePropertyName('sku').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isDisplayed()).toBeTruthy();
      });

      it('should update MapProduct with SKU source', async function() {
        browser.get('http://localhost:8080/#/browse');
        // get the document uri with SKU - board_games.csv-0-10
        await appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        await browsePage.searchBox().clear();
        await browsePage.searchBox().sendKeys('159929577929');
        await browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        let sourceDocUriWithBigSku =
          browsePage.resultsSpecificUri('/board_games.csv-0-10?doc=yes&type=foo').getText();
        browser.get('http://localhost:8080/#/mappings');
        // update the map with specific SKU doc uri
        await appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        await mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // change the source URI
        await mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        await mappingsPage.inputSourceURI().clear();
        await mappingsPage.inputSourceURI().sendKeys(sourceDocUriWithBigSku);
        await mappingsPage.editSourceURITick().click();
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.editSourceURIConfirmationOK()));
        await mappingsPage.editSourceURIConfirmationOK().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // change the source to SKU
        await mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        await mappingsPage.sourceTypeAheadInput('sku').sendKeys('SKU');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('SKU', 'sku')));
        await mappingsPage.mapSourceProperty('SKU', 'sku').click();
        // select source for price
        await mappingsPage.sourcePropertyDropDown('price').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('price')));
        await mappingsPage.sourceTypeAheadInput('price').sendKeys('price');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('price', 'price')));
        await mappingsPage.mapSourceProperty('price', 'price').click();
        // verify the source property
        expect(mappingsPage.verifySourcePropertyName('SKU').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyValue('159929577929').isDisplayed()).toBeTruthy();
        // save the map
        browser.wait(EC.elementToBeClickable(mappingsPage.saveMapButton()));
        await mappingsPage.saveMapButton().click();
        browser.sleep(5000);
        //browser.wait(EC.presenceOf(entityPage.toast));
        //browser.wait(EC.stalenessOf(entityPage.toast));
      });

      it('should go to flows tab', async function() {
        browser.get('http://localhost:8080/#/flows');
        await appPage.flowsTab.click();
        flowPage.isLoaded();
      });
      
      it ('should redeploy modules', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it('should create Harmonize SKU flow on Product', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.clickEntityDisclosure('Product');
        browser.sleep(5000);
        await flowPage.createHarmonizeFlow('Product', 'Harmonize SKU', 'json', 'sjs', true, 'MapProduct');
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE')));
        expect(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE').isDisplayed()).
          toBe(true, 'Harmonize Product' + ' is not present');
      });

      it ('should redeploy modules', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it('should run Harmonize SKU flow with mapping', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.clickEntityDisclosure('Product');
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE')));
        expect(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE').isPresent()).toBe(true);
        await flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE').click();
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()), 10000);
        expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
        await flowPage.runHarmonizeButton().click();
        browser.sleep(10000);
      });

      it('should verify the harmonized SKU data with mappings', async function() {
        browser.get('http://localhost:8080/#/browse');
        await appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        await browsePage.databaseDropDown().click();
        await browsePage.selectDatabase('FINAL').click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        await browsePage.searchBox().clear();
        await browsePage.searchBox().sendKeys('159929577929');
        await browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 3 of 3');
        expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/board_games.csv-0-10');
        expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-5').getText()).toContain('/board_games_accessories.csv-0-5');
        expect(browsePage.resultsSpecificUri('/board_games_extensions.csv-0-7').getText()).toContain('/board_games_extensions.csv-0-7');
        await browsePage.resultsSpecificUri('/board_games.csv-0-10').click();
        viewerPage.isLoaded();
        expect(viewerPage.searchResultUri().getText()).toContain('/board_games.csv-0-10');
        // verify that SKU data is harmonized to sku on instance section
        expect(viewerPage.verifyHarmonizedProperty('sku', '159929577929').isDisplayed()).toBeTruthy();
        // verify original SKU data on attachment secion
        expect(viewerPage.verifyHarmonizedProperty('SKU', '159929577929').isDisplayed()).toBeTruthy();
      });

      it('should rollback to current URI when providing invalid URI', async function() {
        browser.get('http://localhost:8080/#/mappings');
        await appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        await mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // get the original doc URI
        let originalDocUri = mappingsPage.getSourceURITitle();
        // change the source URI
        await mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        await mappingsPage.inputSourceURI().clear();
        await mappingsPage.inputSourceURI().sendKeys('invalidURI');
        await mappingsPage.editSourceURITick().click();
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.editSourceURIConfirmationOK()));
        await mappingsPage.editSourceURIConfirmationOK().click();
        //browser.sleep(3000);
        browser.wait(EC.elementToBeClickable(mappingsPage.docNotFoundConfirmationOK()));
        expect(mappingsPage.docNotFoundMessage().getText()).toContain('Document URI not found: invalidURI');
        await mappingsPage.docNotFoundConfirmationOK().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // verify that the old valid URI persists
        expect(mappingsPage.getSourceURITitle()).toEqual(originalDocUri);
        // verify that the selected properties persist
        expect(mappingsPage.verifySourcePropertyName('SKU').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyValue('159929577929').isDisplayed()).toBeTruthy();
      });

      it('should verify the behavior on reset cancel', async function() {
        browser.get('http://localhost:8080/#/mappings');
        await appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        await mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // get the original doc URI
        let originalDocUri = mappingsPage.getSourceURITitle();
        // change the sku source
        await mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        await mappingsPage.sourceTypeAheadInput('sku').sendKeys('game_id');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('game_id', 'sku')));
        await mappingsPage.mapSourceProperty('game_id', 'sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetButton()));
        // verify reset - cancel behavior
        await mappingsPage.resetButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetConfirmationCancel()));
        await mappingsPage.resetConfirmationCancel().click();
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // verify that the source URI and the properties persist (still game_id, but not saved)
        expect(mappingsPage.getSourceURITitle()).toEqual(originalDocUri);
        expect(mappingsPage.verifySourcePropertyName('game_id').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isDisplayed()).toBeTruthy();
      });

      it('should verify the behavior on reset ok', async function() {
        browser.get('http://localhost:8080/#/mappings');
        await appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        await mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // get the original doc URI
        let originalDocUri = mappingsPage.getSourceURITitle();
        // change the sku source
        await mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        await mappingsPage.sourceTypeAheadInput('sku').sendKeys('game_id');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('game_id', 'sku')));
        await mappingsPage.mapSourceProperty('game_id', 'sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetButton()));
        // verify reset - cancel behavior
        await mappingsPage.resetButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetConfirmationCancel()));
        await mappingsPage.resetConfirmationOK().click()
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // verify that the properties reset to old SKU (rollback to previous version)
        expect(mappingsPage.getSourceURITitle()).toEqual(originalDocUri);
        expect(mappingsPage.verifySourcePropertyName('SKU').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isDisplayed()).toBeTruthy();
      });
    });
  }
