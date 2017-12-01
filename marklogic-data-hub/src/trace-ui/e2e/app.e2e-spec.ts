import { DataHubQuickstartPage } from './app.po';

describe('data-hub-quickstart App', () => {
  let page: DataHubQuickstartPage;

  beforeEach(() => {
    page = new DataHubQuickstartPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
