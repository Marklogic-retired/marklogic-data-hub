import React from "react";
import {render, cleanup} from "@testing-library/react";
import NotificationModal from "../notification-modal/notification-modal";
import {BrowserRouter as Router} from "react-router-dom";
import {NotificationContext} from "@util/notification-context";
import {notificationsMock} from "../../../assets/mock-data/notification-context-mock";

const emptyNotificationData = {
  notifications: [],
  totalCount: 0,
  currentPage: 1,
  pageLength: 10,
  runUpdated: false
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
});