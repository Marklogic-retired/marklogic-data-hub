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
    return element(by.tagName('app-folder-browser'));
  }

  get currentFolder() {
    return element(by.css('.current-folder input'));
  }

  get currentFolderValue() {
    return element(by.css('.current-folder input')).getAttribute('value');
  }

  setCurrentFolder(path) {
    this.currentFolder.clear();
    this.currentFolder.sendKeys(path);
    this.currentFolder.sendKeys(protractor.Key.ENTER);
  }

  get projectDirTab() {
    return element(by.css('#ProjectDirTab'));
  }

  get initIfNeededTab() {
    return element(by.css('#InitIfNeededTab'));
  }

  get postInitTab() {
    return element(by.css('#PostInit'));
  }

  get environmentTab() {
    return element(by.css('#EnvironmentTab'));
  }

  get loginTab() {
    return element(by.css('#LoginTab'));
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
    return element(by.css('.odh-icon'));
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

  setDataHubName(dataHubName) {
    this.dataHubName.clear();
    return this.dataHubName.sendKeys(dataHubName);
  }

  get marklogicHostLabel() {  
    return element(by.name('host'));
  }

  clickAdvancedSettings() {
    return element(by.buttonText('Advanced Settings')).click();
  } 

  get stagingAppserverNameLabel() {
    return element(by.name('stagingHttpName'));
  }

  get stagingAppserverName() {
    return element(by.css('mdl-textfield[label="Staging Appserver Name"] input'));
  }

  get modulesDbName() {
    return element(by.css('mdl-textfield[label="Modules Database Name"] input'));
  }

  clickRestoreDefaults() {
    return element(by.buttonText('Restore Defaults')).click();
  }

  get restoreButton() {
    return element(by.buttonText('Restore'));
  }

  clickRestore() {
    return element(by.buttonText('Restore')).click();
  }

  selectOnlineStore() {
    element(by.cssContainingText('div.entry p', '..')).click();
    element(by.cssContainingText('div.entry p', 'examples')).click();
    return element(by.cssContainingText('div.entry p', 'online-store')).click();
  }

  clickInitialize() {
    return element(by.buttonText('Initialize')).click();
  }

  clickNext(id) {
    return this.nextButton(id).click();
  }

  clickInstall() {
    return element(by.css('#installer-button')).click();
  }

  //get userName element
  get userName(){
    return element(by.name('username')).element(by.tagName('input'));
  }

  //get password element
  get password(){
    return element(by.name('password')).element(by.tagName('input'));
  }

  //to get the login box locater
  locator() {
    return by.css('.credentials-prompt')
  }

  //To enter user and password
  enterCredentials(user: string, password: string) {
    this.userName.clear()
    this.password.clear()
    this.enterUserName(user);
    this.enterPassword(password);
  }

  //enter username text
  enterUserName(userName: string){
    this.userName.clear()
    return this.userName.sendKeys(userName)
  }

  //enter password text
  enterPassword(password: string){
    this.password.clear()
    return this.password.sendKeys(password)
  }

  //click on login button
  clickLogin() {
    return element(by.buttonText('Login')).click();
  }

  //Login successful
  login() {
    this.enterCredentials('admin', 'admin');
    return this.clickLogin();
  }

  //Login successful
  loginUsingCredentials(user:string, pass:string) {
    this.enterCredentials(user, pass);
    return this.clickLogin();
  }

  //to get the login button locator
  loginButtonLocator() {
    return element(by.buttonText('Login'))
  }

  //login into application
  loginAs(username: string, password: string) {
    this.enterCredentials(username, password)
    return this.clickLogin()
  }

  //login invalid credential error message
  get loginInvalidCredentialsError() {
    return element(by.cssContainingText('#LoginTab', 'Authentication Failed: Invalid credentials'));
  }
}

var loginPage = new LoginPage();
export default loginPage;
pages.addPage(loginPage);
