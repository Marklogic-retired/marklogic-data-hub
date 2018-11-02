import {NgModule} from "@angular/core";
import {StoryCardComponent} from "./story-card/story-card.component";
import {RouterLinkStubDirective} from './test/router-stubs';

@NgModule({
  declarations: [StoryCardComponent, RouterLinkStubDirective]
})
export class UtilsModule {}
