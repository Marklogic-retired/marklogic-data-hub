import {Component, Input} from "@angular/core";
import {StepType} from '../../models/step.model';

@Component({
  selector: 'step-icons-ui',
  templateUrl: './step-icons-ui.component.html',
  styleUrls: ['./step-icons-ui.component.scss']
})
export class StepIconsUiComponent {
  @Input() steps: Array<Object> = new Array<Object>();

  createStepHeader(step: any): string {
    if (step.stepDefinitionType === StepType.INGESTION){
      if(step.stepDefinitionName === 'default-ingestion'){
        return 'INGESTION';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === StepType.MAPPING){
      if(step.stepDefinitionName === 'default-mapping'){
        return 'MAPPING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === StepType.MASTERING){
      if(step.stepDefinitionName === 'default-mastering'){
        return 'MASTERING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else {
        return 'CUSTOM';
    }
  }

}
