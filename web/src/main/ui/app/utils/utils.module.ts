import {NgModule} from "@angular/core";
import {StoryCardComponent} from "./stories/story-card.component";
import {RouterLinkStubDirective, RouterOutletStubComponent} from "./stories/router-stubs";

@NgModule({
  declarations: [StoryCardComponent, RouterLinkStubDirective, RouterOutletStubComponent]
})
export class UtilsModule {
}
