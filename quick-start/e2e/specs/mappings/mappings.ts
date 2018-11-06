import { browser, ExpectedConditions as EC} from 'protractor';
import flowPage from '../../page-objects/flows/flows';
import appPage from '../../page-objects/appPage';
import browsePage from '../../page-objects/browse/browse';
import mappingsPage from '../../page-objects/mappings/mappings';
import viewerPage from '../../page-objects/viewer/viewer';

export default function() {
    describe('Run Mappings', () => {
      it('should go to flows tab', function() {
        appPage.flowsTab.click();
        flowPage.isLoaded();
      });

      it ('should redeploy modules', function() {
        flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it('should create a mapping for Product entity with sku source', function() {
        // get the document uri with sku - board_games_accessories.csv-0-1
        appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        browsePage.searchBox().clear();
        browsePage.searchBox().sendKeys('442403950907');
        browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        let sourceDocUriWithSmallSku = 
          browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1?doc=yes&type=foo').getText(); 
        // create the map with specific sku doc uri
        appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.newMapButton('Product')));
        mappingsPage.newMapButton('Product').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.mapNameInputField()));
        mappingsPage.mapNameInputField().sendKeys('MapProduct');
        mappingsPage.mapDescriptionInputField().sendKeys('description for Product map');
        mappingsPage.mapCreateButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(8000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        expect(mappingsPage.mapTitle.getText()).toContain('MapProduct');
        // change the source URI to document containing sku
        mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        mappingsPage.inputSourceURI().clear();
        mappingsPage.inputSourceURI().sendKeys(sourceDocUriWithSmallSku);
        mappingsPage.editSourceURITick().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // select source for sku
        mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        mappingsPage.sourceTypeAheadInput('sku').sendKeys('sku');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('sku', 'sku')));
        mappingsPage.mapSourceProperty('sku', 'sku').click();
        // select source for price
        mappingsPage.sourcePropertyDropDown('price').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('price')));
        mappingsPage.sourceTypeAheadInput('price').sendKeys('price');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('price', 'price')));
        mappingsPage.mapSourceProperty('price', 'price').click();
        // verify the source property
        expect(mappingsPage.verifySourcePropertyName('sku').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isPresent()).toBeTruthy();
        // verify the property icon
        expect(mappingsPage.entityPropertyIcon('sku', 'key').isPresent()).toBeTruthy();
        expect(mappingsPage.entityPropertyIcon('price', 'bolt').isPresent()).toBeTruthy();
        // save the map
        browser.wait(EC.elementToBeClickable(mappingsPage.saveMapButton()));
        mappingsPage.saveMapButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(8000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        expect(mappingsPage.verifySourcePropertyName('sku').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isPresent()).toBeTruthy();
      });

      it('should update MapProduct with SKU source', function() {
        // get the document uri with SKU - board_games.csv-0-10
        appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        browsePage.searchBox().clear();
        browsePage.searchBox().sendKeys('159929577929');
        browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        let sourceDocUriWithBigSku = 
          browsePage.resultsSpecificUri('/board_games.csv-0-10?doc=yes&type=foo').getText();
        // update the map with specific SKU doc uri
        appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // change the source URI
        mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        mappingsPage.inputSourceURI().clear();
        mappingsPage.inputSourceURI().sendKeys(sourceDocUriWithBigSku);
        mappingsPage.editSourceURITick().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editSourceURIConfirmationOK()));
        mappingsPage.editSourceURIConfirmationOK().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // change the source to SKU
        mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        mappingsPage.sourceTypeAheadInput('sku').sendKeys('SKU');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('SKU', 'sku')));
        mappingsPage.mapSourceProperty('SKU', 'sku').click();
        // select source for price
        mappingsPage.sourcePropertyDropDown('price').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('price')));
        mappingsPage.sourceTypeAheadInput('price').sendKeys('price');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('price', 'price')));
        mappingsPage.mapSourceProperty('price', 'price').click();
        // verify the source property
        expect(mappingsPage.verifySourcePropertyName('SKU').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyValue('159929577929').isPresent()).toBeTruthy();
        // save the map
        browser.wait(EC.elementToBeClickable(mappingsPage.saveMapButton()));
        mappingsPage.saveMapButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(8000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
      }); 

      it('should go to flows tab', function() {
        appPage.flowsTab.click();
        flowPage.isLoaded();
      });

      it('should create Harmonize SKU flow on Product', function() {
        flowPage.clickEntityDisclosure('Product');
        browser.sleep(5000);
        flowPage.createHarmonizeFlow('Product', 'Harmonize SKU', 'json', 'sjs', true, 'MapProduct');
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE')));
        expect(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE').isDisplayed()).
          toBe(true, 'Harmonize Product' + ' is not present');
      });

      it ('should redeploy modules', function() {
        flowPage.redeployButton.click();
        browser.sleep(5000);
      });
      
      it('should run Harmonize SKU flow with mapping', async function() {
        await flowPage.clickEntityDisclosure('Product');
        browser.sleep(5000);
        await browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE')));
        await expect(flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE').isPresent()).toBe(true);
        await flowPage.getFlow('Product', 'Harmonize SKU', 'HARMONIZE').click();
        await browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()), 10000);
        await expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
        await flowPage.runHarmonizeButton().click();
        browser.sleep(10000);
      });

      it('should verify the harmonized SKU data with mappings', function() {
        appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        browsePage.databaseDropDown().click();
        browsePage.selectDatabase('FINAL').click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        browsePage.searchBox().clear();
        browsePage.searchBox().sendKeys('159929577929');
        browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 3 of 3');
        expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/board_games.csv-0-10');
        expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-5').getText()).toContain('/board_games_accessories.csv-0-5');
        expect(browsePage.resultsSpecificUri('/board_games_extensions.csv-0-7').getText()).toContain('/board_games_extensions.csv-0-7');
        browsePage.resultsSpecificUri('/board_games.csv-0-10').click();
        viewerPage.isLoaded();
        expect(viewerPage.searchResultUri().getText()).toContain('/board_games.csv-0-10');
        // verify that SKU data is harmonized to sku on instance section
        expect(viewerPage.verifyHarmonizedProperty('sku', '159929577929').isPresent()).toBeTruthy();
        // verify original SKU data on attachment secion
        expect(viewerPage.verifyHarmonizedProperty('SKU', '159929577929').isPresent()).toBeTruthy();
      });

      it('should rollback to current URI when providing invalid URI', function() {
        appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // get the original doc URI
        let originalDocUri = mappingsPage.getSourceURITitle();
        // change the source URI
        mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        mappingsPage.inputSourceURI().clear();
        mappingsPage.inputSourceURI().sendKeys('invalidURI');
        mappingsPage.editSourceURITick().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editSourceURIConfirmationOK()));
        mappingsPage.editSourceURIConfirmationOK().click();
        browser.sleep(3000);
        browser.wait(EC.elementToBeClickable(mappingsPage.docNotFoundConfirmationOK()));
        expect(mappingsPage.docNotFoundMessage().getText()).toContain('Document URI not found: invalidURI');
        mappingsPage.docNotFoundConfirmationOK().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // verify that the old valid URI persists
        expect(mappingsPage.getSourceURITitle()).toEqual(originalDocUri);
        // verify that the selected properties persist
        expect(mappingsPage.verifySourcePropertyName('SKU').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyValue('159929577929').isPresent()).toBeTruthy();
      });

      it('should verify the behavior on reset cancel', function() {
        appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // get the original doc URI
        let originalDocUri = mappingsPage.getSourceURITitle();
        // change the sku source
        mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        mappingsPage.sourceTypeAheadInput('sku').sendKeys('game_id');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('game_id', 'sku')));
        mappingsPage.mapSourceProperty('game_id', 'sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetButton()));
        // verify reset - cancel behavior
        mappingsPage.resetButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetConfirmationCancel()));
        mappingsPage.resetConfirmationCancel().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // verify that the source URI and the properties persist (still game_id, but not saved)
        expect(mappingsPage.getSourceURITitle()).toEqual(originalDocUri);
        expect(mappingsPage.verifySourcePropertyName('game_id').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isPresent()).toBeTruthy();
      });

      it('should verify the behavior on reset ok', function() {
        appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapProduct')));
        mappingsPage.entityMapping('MapProduct').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        // get the original doc URI
        let originalDocUri = mappingsPage.getSourceURITitle();
        // change the sku source
        mappingsPage.sourcePropertyDropDown('sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('sku')));
        mappingsPage.sourceTypeAheadInput('sku').sendKeys('game_id');
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('game_id', 'sku')));
        mappingsPage.mapSourceProperty('game_id', 'sku').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetButton()));
        // verify reset - cancel behavior
        mappingsPage.resetButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.resetConfirmationCancel()));
        mappingsPage.resetConfirmationOK().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('sku')));
        // verify that the properties reset to old SKU (rollback to previous version)
        expect(mappingsPage.getSourceURITitle()).toEqual(originalDocUri);
        expect(mappingsPage.verifySourcePropertyName('SKU').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('price').isPresent()).toBeTruthy();
      });
    });
  }
