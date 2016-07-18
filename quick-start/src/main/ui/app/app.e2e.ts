describe('App', () => {

  beforeEach(() => {
    browser.get('/');
  });


  it('should have a title', () => {
    let subject = browser.getTitle();
    let result  = 'Data Hub QuickStart';
    expect(subject).toEqual(result);
  });

  it('should not have the nav bar', () => {
    let subject = element(by.css('header')).isPresent();
    let result  = false;
    expect(subject).toEqual(result);
  });

  it('should have <login>', () => {
    let subject = element(by.css('app login')).isPresent();
    let result  = true;
    expect(subject).toEqual(result);
  });

  // it('should have buttons', () => {
  //   let subject = element(by.css('button')).getText();
  //   let result  = 'Index';
  //   expect(subject).toEqual(result);
  // });

});
