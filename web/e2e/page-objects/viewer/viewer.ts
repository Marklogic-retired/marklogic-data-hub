import { element, by } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class ViewerPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('app-search-viewer');
  }

  searchResultUri() {
    return element(by.css('.title > h4'));
  }

  verifyVariableName(variableName: string) {
    return element(by.cssContainingText('.cm-variable', variableName));
  }

  verifyStringName(stringName: string) {
    return element(by.cssContainingText('.cm-string', stringName));
  }

  verifyTagName(tagName: string) {
    return element(by.cssContainingText('.cm-tag', tagName));
  }

  verifyAttributeName(attributeName: string) {
    return element(by.cssContainingText('.cm-attribute', attributeName));
  }

  verifyHarmonizedProperty(propertyName: string, harmonizedValue: string) {
    return element(by.xpath(`//span[@class="cm-variable" and contains(text(), "${propertyName}")]/../span[@class="cm-string" and contains(text(), "${harmonizedValue}")]`));
  }

  verifyHarmonizedPropertyAtomicValue(propertyName: string, harmonizedValue: number) {
    return element(by.xpath(`//span[@class="cm-variable" and contains(text(), "${propertyName}")]/../span[@class="cm-atom" and . = ${harmonizedValue}]`));
  }

  verifyHarmonizedPropertyXml(propertyName: string, harmonizedValue: string) {
    return element(by.xpath(`//span[@class="cm-tag" and contains(text(), "${propertyName}")]/../span[@class="cm-variable" and contains(text(), "${harmonizedValue}")]`));
  }
}

var viewerPage = new ViewerPage();
export default viewerPage;
pages.addPage(viewerPage);
