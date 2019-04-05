import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class CustomStep extends AppPage {
  
  get inputCustomModuleURI() {
    return element(by.css(".custom-container input"));
  }

  async setInputCustomModuleURI(uri: string) {
    let inputField = this.inputCustomModuleURI;
    await inputField.clear();
    return await inputField.sendKeys(uri);  
  }
  
}

let customStepPage = new CustomStep();
export default customStepPage;
pages.addPage(customStepPage);