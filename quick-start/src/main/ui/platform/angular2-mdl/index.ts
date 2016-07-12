/* tslint:disable:max-line-length */
import {
  MdlButtonRippleDirective,
  MdlCheckboxRippleDirective,
  MdlRadioRippleDirective,
  MdlIconToggleRippleDirective,
  MdlSwitchRippleDirective,
  MdlMenuItemRippleDirective
} from 'angular2-mdl/dist/components/common/mdl-ripple.directive';
import { MdlButtonComponent } from 'angular2-mdl/dist/components/button/mdl-button.component';
import {
  MdlBadgeDirective,
  MdlBadgeNoBackgroundDirective,
  MdlBadgeOverlapDirective
} from 'angular2-mdl/dist/components/badge/mdl-badge.directive';
import { MdlShadowDirective } from 'angular2-mdl/dist/components/shadow/mdl-shadow.directive';
import {
  MdlCardComponent,
  MdlCardTitleComponent,
  MdlCardSupportingTextComponent,
  MdlCardActionsComponent,
  MdlCardMenuComponent,
  MdlCardTitleTextDirective,
  MdlCardBorderDirective,
  MdlCardExpandDirective
} from 'angular2-mdl/dist/components/card/mdl-card.component';
import { MdlCheckboxComponent } from 'angular2-mdl/dist/components/checkbox/mdl-checkbox.component';
import { MdlRadioComponent } from 'angular2-mdl/dist/components/radio/mdl-radio.component';
import {
  MdlProgressComponent
} from 'angular2-mdl/dist/components/progress/mdl-progress.component';
import { MdlIconComponent } from 'angular2-mdl/dist/components/icon/mdl-icon.component';
import { MdlIconToggleComponent } from 'angular2-mdl/dist/components/icon-toggle/mdl-icon-toggle.component';
import {
  MdlListComponent,
  MdlListItemComponent,
  MdlListItemPrimaryContentComponent,
  MdlListItemIconDirective,
  MdlListItemAvatarDirective,
  MdlListItemSecondaryContentComponent,
  MdlListItemSecondaryActionComponent,
  MdlListItemSubTitleComponent,
  MdlListItemSecondaryInfoComponent,
  MdlListItemTextBodyComponent
} from 'angular2-mdl/dist/components/list/mdl-list.component';
import { MdlSpinnerComponent } from 'angular2-mdl/dist/components/spinner/mdl-spinner.component';
import { MdlSliderComponent }  from 'angular2-mdl/dist/components/slider/mdl-slider.component';
import { MdlSwitchComponent } from 'angular2-mdl/dist/components/switch/mdl-switch.component';
import {
  MdlSnackbarService
} from 'angular2-mdl/dist/components/snackbar/mdl-snackbar.service';
import {
  MdlTooltipComponent,
  MdlTooltipDirective,
  MdlTooltipLargeDirective
} from 'angular2-mdl/dist/components/tooltip/index';
// import {
//   MdlTableComponent,
//   MdlSelectableTableComponent
// } from 'angular2-mdl/dist/components/table/index';
import {
  MdlMenuComponent,
  MdlMenuItemComponent,
  MdlMenuItemFullBleedDeviderComponent
} from 'angular2-mdl/dist/components/menu/index';
// import {
//   MdlLayoutComponent,
//   MdlLayoutHeaderComponent,
//   MdlLayoutDrawerComponent,
//   MdlLayoutContentComponent,
//   MdlLayoutHeaderTransparentDirective,
//   MdlLayoutHeaderRowComponent,
//   MdlLayoutTitleComponent,
//   MdlLayoutSpacerComponent,
//   MdlLayoutTabPanelComponent
// } from 'angular2-mdl/dist/components/layout/index';
// import {
//   MdlTabsComponent,
//   MdlTabPanelComponent
// } from 'angular2-mdl/dist/components/tabs/index';
import {
  MdlTextFieldComponent
} from 'angular2-mdl/dist/components/textfield/mdl-textfield.component';

export * from 'angular2-mdl/dist/components/common/mdl-ripple.directive';
export * from 'angular2-mdl/dist/components/badge/mdl-badge.directive';
export * from 'angular2-mdl/dist/components/button/mdl-button.component';
export * from 'angular2-mdl/dist/components/card/mdl-card.component';
export * from 'angular2-mdl/dist/components/checkbox/mdl-checkbox.component';
export * from 'angular2-mdl/dist/components/icon/mdl-icon.component';
export * from 'angular2-mdl/dist/components/list/mdl-list.component';
export * from 'angular2-mdl/dist/components/icon-toggle/mdl-icon-toggle.component';
export * from 'angular2-mdl/dist/components/progress/mdl-progress.component';
export * from 'angular2-mdl/dist/components/radio/mdl-radio.component';
export * from 'angular2-mdl/dist/components/shadow/mdl-shadow.directive';
export * from 'angular2-mdl/dist/components/spinner/mdl-spinner.component';
export * from 'angular2-mdl/dist/components/slider/mdl-slider.component';
export * from 'angular2-mdl/dist/components/snackbar/mdl-snackbar.service';
export * from 'angular2-mdl/dist/components/switch/mdl-switch.component';
export * from 'angular2-mdl/dist/components/table/index'
export * from 'angular2-mdl/dist/components/tooltip/index';
export * from 'angular2-mdl/dist/components/menu/index';
export * from 'angular2-mdl/dist/components/layout/index';
export * from 'angular2-mdl/dist/components/tabs/index';
export * from 'angular2-mdl/dist/components/textfield/mdl-textfield.component';

export const MDL_SERVICES = [
  MdlSnackbarService
];

export const MDL_DIRECTIVES = [
  MdlButtonRippleDirective,
  MdlCheckboxRippleDirective,
  MdlRadioRippleDirective,
  MdlIconToggleRippleDirective,
  MdlSwitchRippleDirective,
  MdlBadgeDirective,
  MdlBadgeNoBackgroundDirective,
  MdlBadgeOverlapDirective,
  MdlButtonComponent,
  MdlCardComponent,
  MdlCardTitleComponent,
  MdlCardSupportingTextComponent,
  MdlCardActionsComponent,
  MdlCardMenuComponent,
  MdlCardTitleTextDirective,
  MdlCardBorderDirective,
  MdlCardExpandDirective,
  MdlCheckboxComponent,
  MdlIconComponent,
  MdlIconToggleComponent,
  MdlListComponent,
  MdlListItemComponent,
  MdlListItemPrimaryContentComponent,
  MdlListItemIconDirective,
  MdlListItemAvatarDirective,
  MdlListItemSecondaryContentComponent,
  MdlListItemSecondaryActionComponent,
  MdlListItemSubTitleComponent,
  MdlListItemSecondaryInfoComponent,
  MdlListItemTextBodyComponent,
  MdlProgressComponent,
  MdlRadioComponent,
  MdlShadowDirective,
  MdlSliderComponent,
  MdlSpinnerComponent,
  MdlSwitchComponent,
  MdlTooltipComponent,
  MdlTooltipDirective,
  MdlTooltipLargeDirective,
  // MdlTableComponent,
  // MdlSelectableTableComponent,
  MdlMenuComponent,
  MdlMenuItemComponent,
  MdlMenuItemRippleDirective,
  MdlMenuItemFullBleedDeviderComponent,
  // MdlLayoutComponent,
  // MdlLayoutHeaderComponent,
  // MdlLayoutDrawerComponent,
  // MdlLayoutContentComponent,
  // MdlLayoutHeaderTransparentDirective,
  // MdlLayoutHeaderRowComponent,
  // MdlLayoutTitleComponent,
  // MdlLayoutSpacerComponent,
  // MdlTabsComponent,
  // MdlTabPanelComponent,
  // MdlLayoutTabPanelComponent,
  MdlTextFieldComponent
];
