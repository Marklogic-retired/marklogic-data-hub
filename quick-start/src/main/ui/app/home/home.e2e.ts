describe('App', () => {

  beforeAll(() => {
    console.log('login.e2e.ts');
  });

  beforeEach(() => {
    // change hash depending on router LocationStrategy
    browser.get('/');
  });

  it('should have a title', () => {
    let subject = browser.getTitle();
    let result  = 'Data Hub QuickStart';
    expect(subject).toEqual(result);

    browser.getCurrentUrl().then(url => {
      expect(url.endsWith('/login')).toBe(false);
      expect(url.endsWith('/')).toBe(true);
    });
  });

  // it('should create an entity', () => {
  //   const inputFlowButton = element(by.css('#new-input-flow'));
  //   inputFlowButton.click();
  //   browser.waitForAngular();
  // });

});
