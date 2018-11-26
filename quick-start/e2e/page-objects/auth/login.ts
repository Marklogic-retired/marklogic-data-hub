import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class LoginPage extends AppPage {

  get browseButton(){
    return element(by.buttonText('Browse'));
  }

  nextButton(id) {
    return element(by.cssContainingText('#' + id + ' button', 'Next'));
  }

  get projectList() {
    return element(by.tagName('app-select-list'));
  }

  get folderBrowser() {
    return element(by.tagName('app-login app-folder-browser'));
  }

  get currentFolder() {
    return element(by.css('.current-folder input'));
  }

  get currentFolderValue() {
    return element(by.css('.current-folder input')).getAttribute('value');
  }

  async setCurrentFolder(path) {
    await this.currentFolder.clear();
    await this.currentFolder.sendKeys(path);
    await this.currentFolder.sendKeys(protractor.Key.ENTER);
  }

  get projectDirTab() {
    return element(by.css('app-login #ProjectDirTab'));
  }

  get initIfNeededTab() {
    return element(by.css('app-login #InitIfNeededTab'));
  }

  get postInitTab() {
    return element(by.css('app-login #PostInit'));
  }

  get environmentTab() {
    return element(by.css('#EnvironmentTab'));
  }

  get loginTab() {
    return element(by.css('app-login #LoginTab'));
  }

  get installedCheckTab() {
    return element(by.css('#InstalledCheckTab'));
  }

  get requiresUpdateUpdateTab() {
    return element(by.css('#RequiresUpdateUpdateTab'));
  }

  get preInstallCheckTab() {
    return element(by.css('#PreInstallCheck'));
  }

  get installerTab() {
    return element(by.css('#InstallerTab'));
  }

  get odhIcon() {
    return element(by.css('app-login .odh-icon'));
  }

  get installProgress() {
    return element(by.css('.install-progress mdl-progress'));
  }

  get installComplete() {
    return element(by.cssContainingText('.install-complete p', 'Installation into MarkLogic is complete!'));
  }

  get finishedButton() {
    return element(by.css('#finished-button'));
  }

  get dataHubNameLabel() {
    return element(by.cssContainingText('#InitIfNeededTab', 'DataHub Name'));
  }

  get dataHubName() {
    return element(by.css('mdl-textfield[label="DataHub Name"] input'));
  }

  async setDataHubName(dataHubName) {
    await this.dataHubName.clear();
    await this.dataHubName.sendKeys(dataHubName);
  }

  get marklogicHostLabel() {
    return element(by.css('mdl-textfield[name="host"]'));
  }

  async clickAdvancedSettings() {
    console.log('clicking advanced settings');
    await element(by.buttonText('Advanced Settings')).click();
  }

  get stagingAppserverNameLabel() {
    return element(by.css('mdl-textfield[name="stagingHttpName"]'));
  }

  advancedSettingsValue(labelName: string) {
    return element(by.css(`mdl-textfield[label="${labelName}"] input`));
  }

  async clickRestoreDefaults() {
    console.log('restore default settings');
    await element(by.buttonText('Restore Defaults')).click();
  }

  get restoreButton() {
    return element(by.buttonText('Restore'));
  }

  async clickRestore() {
    await element(by.buttonText('Restore')).click();
  }

  async selectOnlineStore() {
    await element(by.cssContainingText('div.entry p', '..')).click();
    await element(by.cssContainingText('div.entry p', 'examples')).click();
    await element(by.cssContainingText('div.entry p', 'online-store')).click();
  }

  async clickInitialize() {
    await element(by.buttonText('Initialize')).click();
  }

  async clickNext(id) {
    console.log('clicking next in '+id);
    await this.nextButton(id).click();
  }

  async clickInstall() {
    await element(by.css('#installer-button')).click();
  }

  //get userName element
  get userName(){
    return element(by.css('input#username'))
  }

  //get password element
  get password(){
    return element(by.css('[label="MarkLogic Password"]')).element(by.tagName('input'));
  }

  //to get the login box locater
  locator() {
    return by.css('.credentials-prompt')
  }

  //To enter user and password
  async enterCredentials(user: string, password: string) {
    await this.userName.clear()
    await this.password.clear()
    await this.enterUserName(user);
    await this.enterPassword(password);
  }

  //enter username text
  async enterUserName(userName: string){
    await this.userName.clear()
    await this.userName.sendKeys(userName)
  }

  //enter password text
  async enterPassword(password: string){
    await this.password.clear()
    await this.password.sendKeys(password)
  }

  //click on login button
  async clickLogin() {
    await element(by.buttonText('Login')).click();
  }

  //Login successful
  async login() {
    await this.enterCredentials('admin', 'admin');
    await this.clickLogin();
  }

  //Login successful
  async loginUsingCredentials(user:string, pass:string) {
    await this.enterCredentials(user, pass);
    await this.clickLogin();
  }

  //to get the login button locator
  loginButtonLocator() {
    return element(by.buttonText('Login'))
  }

  //login into application
  async loginAs(username: string, password: string) {
    await this.enterCredentials(username, password)
    await this.clickLogin()
  }

  //login invalid credential error message
  get loginInvalidCredentialsError() {
    return element(by.cssContainingText('#LoginTab', 'Invalid credentials'));
  }
}

var loginPage = new LoginPage();
export default loginPage;
pages.addPage(loginPage);
