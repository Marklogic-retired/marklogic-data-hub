import ModalDialogBase from "../common/modal-dialog";
class MergeStrategyModal extends ModalDialogBase {

  setStrategyName(str: string) {
    cy.get("#strategy-name").focus().clear().type(str);
  }

  addSliderOptionsButton() {
    return cy.findByLabelText("add-slider-button");
  }

  cancelButton() {
    return cy.findByLabelText("cancel-merge-strategy");
  }

  saveButton() {
    return cy.findByLabelText("confirm-merge-strategy");
  }

  maxValue(str: string) {
    cy.get("#maxValuesStrategyInput").focus().clear().type(str);
  }

  strategyMaxScoreInput(value: string) {
    cy.get("#maxSourcesStrategyInput").clear().type(value).type("{enter}");
  }

  maxValueOtherRadio() {
    return cy.findByLabelText("maxValuesOtherRadio");
  }

  maxSourcesOtherRadio() {
    return cy.findByLabelText("maxSourcesOtherRadio");
  }

  defaultStrategyYes() {
    return cy.findByLabelText("defaultStrategyYes");
  }
}

const mergeStrategyModal = new MergeStrategyModal();
export default mergeStrategyModal;
