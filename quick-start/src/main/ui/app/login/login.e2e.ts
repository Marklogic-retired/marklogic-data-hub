describe('App', () => {

  let ec = protractor.ExpectedConditions;
  let projectDirTab = element(by.css('#ProjectDirTab'));
  let initIfNeededTab = element(by.css('#InitIfNeededTab'));
  let postInitTab = element(by.css('#PostInit'));
  let environmentTab = element(by.css('#EnvironmentTab'));
  let loginTab = element(by.css('#LoginTab'));
  let installerTab = element(by.css('#InstallerTab'));

  beforeAll(() => {
    console.log('login.e2e.ts');
    browser.executeScript("document.body.className += ' notransition';");

    browser.get('/login');

    // // clear out any items in the project list
    // return element.all(by.css('select-list md-list-item .fa-trash')).map(item => {
    //   return item.click().then(() => {
    //     let removeButton = element.all(by.css('confirm-component button')).first();
    //     return browser.wait(ec.elementToBeClickable(removeButton)).then(() => {
    //       return removeButton.click().then(() => {
    //         return browser.wait(ec.not(ec.presenceOf(removeButton)));
    //       });
    //     });
    //   });
    // });
  });

  beforeEach(() => {
    browser.get('/login');
  });

  it('should not have the nav bar', () => {
    let subject = element.all(by.css('header')).first().isPresent();
    let result  = false;
    expect(subject).toEqual(result);
  });

  it('should have <login>', () => {
    let subject = element(by.css('app login')).isPresent();
    let result  = true;
    expect(subject).toEqual(result);
  });

  it('should not have any existing projects', () => {
    expect(projectDirTab.isDisplayed()).toEqual(true);
    expect(initIfNeededTab.isDisplayed()).toEqual(false);
    expect(postInitTab.isDisplayed()).toEqual(false);
    expect(environmentTab.isDisplayed()).toEqual(false);
    expect(loginTab.isDisplayed()).toEqual(false);
    expect(installerTab.isPresent()).toEqual(false);


    let subject = element.all(by.css('select-list md-list-item')).first().isPresent();
    expect(subject).toEqual(false);
  });

  it('should init and login to a project', () => {

    expect(projectDirTab.isDisplayed()).toEqual(true);
    expect(initIfNeededTab.isDisplayed()).toEqual(false);
    expect(postInitTab.isDisplayed()).toEqual(false);
    expect(environmentTab.isDisplayed()).toEqual(false);
    expect(loginTab.isDisplayed()).toEqual(false);
    expect(installerTab.isPresent()).toEqual(false);

    let subject = element(by.css('#ProjectDirTab .init-buttons button'));
    let advButton = element(by.css('#advanced-toggler'));
    let advancedSection = element(by.css('#InitIfNeededTab .advanced'));
    subject.click().then(() => {
      // give it time
      browser.waitForAngular();
      browser.sleep(1000);

      expect(projectDirTab.isDisplayed()).toEqual(false);
      expect(initIfNeededTab.isDisplayed()).toEqual(true);
      expect(postInitTab.isDisplayed()).toEqual(false);
      expect(environmentTab.isDisplayed()).toEqual(false);
      expect(loginTab.isDisplayed()).toEqual(false);
      expect(installerTab.isPresent()).toEqual(false);

      // start out hidden
      expect(advancedSection.getCssValue('max-height')).toEqual('0px');

      // expand the advanced section
      return advButton.click();
    }).then(() => {
      expect(advancedSection.getCssValue('max-height')).toEqual('none');

      // change some settings
      element(by.css('input[name="name"]')).clear();
      element(by.css('input[name="name"]')).sendKeys('e2e-data-hub');
      element(by.css('input[name="stagingPort"]')).clear();
      element(by.css('input[name="stagingPort"]')).sendKeys('8210');
      element(by.css('input[name="finalPort"]')).clear();
      element(by.css('input[name="finalPort"]')).sendKeys('8220');
      element(by.css('input[name="tracePort"]')).clear();
      element(by.css('input[name="tracePort"]')).sendKeys('8230');

      let submitButton = element(by.css('#InitIfNeededTab button[type="submit"]'));
      // click next
      return submitButton.click();
    }).then(() => {
      browser.sleep(1000);

      // ensure proper tabs are shown
      expect(projectDirTab.isDisplayed()).toEqual(false);
      expect(initIfNeededTab.isDisplayed()).toEqual(false);
      expect(postInitTab.isDisplayed()).toEqual(true);
      expect(environmentTab.isDisplayed()).toEqual(false);
      expect(loginTab.isDisplayed()).toEqual(false);
      expect(installerTab.isPresent()).toEqual(false);

      let nextButton = element.all(by.css('#PostInit .init-buttons button')).last();
      // click next
      return nextButton.click();
    }).then(() => {
      // ensure proper tabs are shown
      expect(projectDirTab.isDisplayed()).toEqual(false);
      expect(initIfNeededTab.isDisplayed()).toEqual(false);
      expect(postInitTab.isDisplayed()).toEqual(false);
      expect(environmentTab.isDisplayed()).toEqual(true);
      expect(loginTab.isDisplayed()).toEqual(false);
      expect(installerTab.isPresent()).toEqual(false);

      // make sure local is in the list
      let list = element.all(by.css('#EnvironmentTab select-list .md-list-item'));
      expect(list.count()).toEqual(1);
      expect(list.first().getText()).toEqual('local');

      let nextButton = element.all(by.css('#EnvironmentTab .init-buttons button')).last();
      // click next
      return nextButton.click();
    }).then(() => {
      // ensure proper tabs are shown
      expect(projectDirTab.isDisplayed()).toEqual(false);
      expect(initIfNeededTab.isDisplayed()).toEqual(false);
      expect(postInitTab.isDisplayed()).toEqual(false);
      expect(environmentTab.isDisplayed()).toEqual(false);
      expect(loginTab.isDisplayed()).toEqual(true);
      expect(installerTab.isPresent()).toEqual(false);

      // type in login info
      element(by.css('input[name="username"]')).sendKeys('admin');
      element(by.css('input[name="password"]')).sendKeys('admin');

      let nextButton = element.all(by.css('#LoginTab .init-buttons button')).last();
      // click next
      return nextButton.click();
    }).then(() => {
      browser.sleep(4000);

      // ensure proper tabs are shown
      expect(projectDirTab.isDisplayed()).toEqual(false);
      expect(initIfNeededTab.isDisplayed()).toEqual(false);
      expect(postInitTab.isDisplayed()).toEqual(false);
      expect(environmentTab.isDisplayed()).toEqual(false);
      expect(loginTab.isDisplayed()).toEqual(false);
      expect(installerTab.isDisplayed()).toEqual(true);

      let finishedButton = element(by.css('#finished-button'));
      expect(finishedButton.isEnabled()).toEqual(false);

      let installButton = element(by.css('#installer-button'));
      return installButton.click();
    }).then(() => {
      let finishedButton = element(by.css('#finished-button'));
      browser.wait(() => {
        return finishedButton.isEnabled();
      });

      expect(finishedButton.isEnabled()).toEqual(true);

      return finishedButton.click();
    }).then(() => {
      browser.waitForAngular();
      browser.sleep(5000);
      browser.getCurrentUrl().then(url => {
        expect(url.endsWith('/login')).toBe(false);
        expect(url.endsWith('/')).toBe(true);
      });
    });
  });
});
