class MultiSlider {

  getHandleName(name: string) {
    return cy.findAllByText(`${name}`);
  }

  getHandleNameMulti(name: string) {
    return cy.findAllByTestId(`${name}-active`);
  }

  getThresholdHandleNameAndType(name: string, type: string) {
    return cy.get("[data-testid='active-threshold-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`);
    });
  }

  getThresholdDefaultHandleNameAndType(name: string, type: string) {
    return cy.get("[data-testid='default-threshold-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`);
    });
  }

  getRulesetHandleNameAndType(name: string, type: string) {
    return cy.get("[data-testid='active-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`);
    });
  }

  assertRulesetHandleNameAndType(name: string, type: string, assertion: string) {
    return cy.get("[data-testid='active-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`).should(assertion);
    });
  }

  getRulesetDefaultHandleNameAndType(name: string, type: string) {
    return cy.get("[data-testid='default-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findAllByText(`${name} - ${type}`);
    });
  }

  thresholdEditOptionActive(name: string, type: string) {
    cy.get("[data-testid='active-threshold-timeline']").scrollIntoView().within(() => {
      cy.findAllByText(`${name} - ${type}`).should("be.visible").then($option => {
        $option[0].click();
      });
    });
  }

  thresholdEditOptionDefault(name: string, type: string) {
    cy.get("[data-testid='active-threshold-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`).should("be.visible").then($option => {
        $option[0].click();
      });
    });
  }

  ruleSetEditOptionActive(name: string, type: string) {
    cy.get("[data-testid='active-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findAllByText(`${name} - ${type}`).should("be.visible").then($option => {
        $option[0].click();
      });
    });
  }

  ruleSetEditOptionDefault(name: string, type: string) {
    cy.get("[data-testid='active-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findAllByText(`${name} - ${type}`).should("be.visible").then($option => {
        $option[0].click();
      });
    });
  }

  ruleSetDefaultEditOptionMulti(name: string) {
    cy.get("[data-testid='default-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findAllByText(`${name}`).should("be.visible").then($option => {
        $option[0].click();
      });
    });
  }

  ruleSetActiveEditOptionMulti(name: string) {
    cy.get("[data-testid='active-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findAllByText(`${name}`).should("be.visible").then($option => {
        $option[0].click();
      });
    });
  }

  deleteOptionActiveThreshold(name: string, type: string) {
    cy.get("[data-testid='active-threshold-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`).click();
    }).then(() => {
      cy.get(`[aria-label="editThresholdDeleteIcon"]`).click();
    });
  }

  deleteOptionDefaultThreshold(name: string, type: string) {
    cy.get("[data-testid='default-threshold-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`).click();
    }).then(() => {
      cy.get(`[aria-label="editThresholdDeleteIcon"]`).click();
    });
  }

  deleteOptionActiveRuleset(name: string, type: string) {
    cy.get("[data-testid='active-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`).click();
    }).then(() => {
      cy.get(`[aria-label="editSingleRulesetDeleteIcon"]`).click();
    });
  }

  deleteOptionDefaultRuleset(name: string, type: string) {
    cy.get("[data-testid='default-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name} - ${type}`).click();
    }).then(() => {
      cy.get(`[aria-label="editSingleRulesetDeleteIcon"]`).click();
    });
  }

  ruleSetDefaultDeleteOptionMulti(name: string) {
    cy.get("[data-testid='default-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name}`).should("be.visible").click();
    }).then(() => {
      cy.get(`[aria-label="editMultipleRulesetDeleteIcon"]`).click();
    });
  }

  ruleSetActiveDeleteOptionMulti(name: string) {
    cy.get("[data-testid='active-ruleset-timeline']").scrollIntoView().within(() => {
      cy.findByText(`${name}`).should("be.visible").click();
    }).then(() => {
      cy.get(`[aria-label="editMultipleRulesetDeleteIcon"]`).click();
    });
  }

  getRulesetSliderRail() {
    return cy.findByTestId("ruleSet-slider-rail");
  }

  getRulesetSliderOptions() {
    return cy.findByTestId("ruleSet-slider-options");
  }

  sliderTooltipValue(val: string) {
    cy.get("div[class=\"tooltipValue\"]").should("contain.text", val);
  }

  sliderTicksHover(sliderName: string, val: string) {
    cy.findByTestId(`${sliderName}-ticks`).find(`div[style*="left: ${val}%;"]`).trigger("mouseover", {force: true});
  }

  sliderTicksMove(sliderName: string, val: string) {
    cy.findByTestId(`${sliderName}-ticks`).find(`div[style*="left: ${val}%;"]`).trigger("mousemove", {force: true});
  }

  confirmDelete(name: string, type: string) {
    cy.findByLabelText(`confirm-${name} - ${type}-yes`).click();
  }

  confirmDeleteThreshold(name: string) {
    cy.findByLabelText(`confirm-${name}-yes`).click();
  }

  confirmDeleteMulti(name: string) {
    cy.findByLabelText(`confirm-${name}-yes`).click();
  }

  enableEdit(name: string) {
    cy.get(`[aria-label="${name}-scale-switch"]`).scrollIntoView().click({force: true});
  }

  sliderIsActive(name: string) {
    return cy.get(`[aria-label="${name}-scale-switch"]`).should("be.checked");
  }
}

const multiSlider = new MultiSlider();
export default multiSlider;
