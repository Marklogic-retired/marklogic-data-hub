import React from "react";
import {render, cleanup} from "@testing-library/react";
import NotificationModal from "../notification-modal/notification-modal";
import {BrowserRouter as Router} from "react-router-dom";
import {NotificationContext} from "@util/notification-context";
import {notificationsMock} from "../../../assets/mock-data/notification-context-mock";
import {AuthoritiesContext, AuthoritiesService} from "@util/authorities";
import {fireEvent, screen} from "@testing-library/dom";

const emptyNotificationData = {
  notifications: [],
  totalCount: 0,
  currentPage: 1,
  pageLength: 10
};

jest.mock("axios");
describe("Update data load settings component", () => {

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify empty notification modal rendering", async () => {
    const {getByText, queryByText} = render(<Router><NotificationContext.Provider value={{notificationOptions: emptyNotificationData, setNotificationsObj: jest.fn()}}>
      <NotificationModal
        notificationModalVisible={true}
        setNotificationModalVisible={jest.fn()}
      />
    </NotificationContext.Provider></Router>);

    expect(queryByText("Merge Notifications")).not.toBeInTheDocument();
    expect(getByText("No Merge Notifications Present")).toBeInTheDocument();
  });

  test("Verify notification modal rendering", async () => {
    const {getByText, queryByText} = render(<Router><NotificationContext.Provider value={notificationsMock}>
      <NotificationModal
        notificationModalVisible={true}
        setNotificationModalVisible={jest.fn()}
      />
    </NotificationContext.Provider></Router>);

    expect(getByText("Merge Notifications")).toBeInTheDocument();
    expect(queryByText("No Merge Notifications Present")).not.toBeInTheDocument();
  });

  test("Merge Icon not available, missing permission", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["readMatching", "readMerging"]);
    const {queryAllByTestId, findByText} = render(
      <Router>
        <AuthoritiesContext.Provider value={authorityService}>
          <NotificationContext.Provider value={notificationsMock}>
            <NotificationModal
              notificationModalVisible={true}
              setNotificationModalVisible={jest.fn()}
            />
          </NotificationContext.Provider>
        </AuthoritiesContext.Provider>
      </Router>);
    screen.debug();
    expect(queryAllByTestId("disabled-merge-icon1")[0]).toHaveClass("mergeIconDisabled");
    // Check Tooltip

    fireEvent.mouseOver(queryAllByTestId("disabled-merge-icon1")[0]);
    expect(await findByText("Merge: Contact your security administrator for access."));
  });

  test("Merge Icon not available", async () => {
    const authorityService = new AuthoritiesService();
    authorityService.setAuthorities(["writeMatching", "writeMerging"]);
    const {queryAllByTestId, findByText} = render(
      <Router>
        <AuthoritiesContext.Provider value={authorityService}>
          <NotificationContext.Provider value={notificationsMock}>
            <NotificationModal
              notificationModalVisible={true}
              setNotificationModalVisible={jest.fn()}
            />
          </NotificationContext.Provider>
        </AuthoritiesContext.Provider>
      </Router>);

    expect(queryAllByTestId("merge-icon1")[0]).toHaveClass("mergeIcon");
    // Check Tooltip
    fireEvent.mouseOver(queryAllByTestId("merge-icon1")[0]);
    expect(await findByText("Merge"));
  });
});
