import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder, ElementArrayFinder} from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class TraceViewerPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('app-trace-viewer');
  }
  
  traceId() {
    return element(by.css('.summary > div:nth-of-type(2)'));
  }

  pluginButton(pluginName: string) {
    return element(by.cssContainingText('.plugins .plugin-name', pluginName));
  }

  pluginSubheader(pluginName: string) {
    return element(by.cssContainingText('.subheader', `${pluginName} Plugin`));
  }
}

var traceViewerPage = new TraceViewerPage();
export default traceViewerPage;
pages.addPage(traceViewerPage);
