class MonitorSidebar {

  getStartTimeSelect() {
    return cy.get("#date-select-wrapper");
  }

  getStartTimeSelectOption(option: string) {
    return cy.get(`[data-testid="${option}-option"]`);
  }

  getDateRangePicker() {
    return cy.get(`[data-testid="range-picker"]`);
  }

  getTodayItemInDateRangePicker() {
    return cy.get(".table-condensed:nth-child(1) tbody td.today").first();
  }

  getAllAvailableDaysInDateRangePicker() {
    return cy.get(".table-condensed:nth-child(1) tbody td.available");
  }
}
const monitorSidebar = new MonitorSidebar();
export default monitorSidebar;
