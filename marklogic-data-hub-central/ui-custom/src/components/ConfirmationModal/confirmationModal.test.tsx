import {render, fireEvent} from "@testing-library/react";
import ConfirmationModal from "./ConfirmationModal";

describe("Confirmation modal component", () => {
  test("Verify Confirmation is rendered", () => {
    const toggleModalMock = jest.fn();
    const confirmationMock = jest.fn();
    const {getByTestId, getByText} = render(<ConfirmationModal isVisible={true} toggleModal={toggleModalMock} confirmAction={confirmationMock} bodyContent={"Text on body"} headerContent={"Text on header"} title={"Modal"} />);
    expect(getByTestId("Modal-resetConfirmationModal")).toBeInTheDocument();
    expect(getByText("Text on body")).toBeInTheDocument();
    expect(getByText("Text on header")).toBeInTheDocument();
  });
  test("Verify Confirmation callbacks are executed", () => {
    const toggleModalMock = jest.fn();
    const confirmationMock = jest.fn();
    const {getByTestId, getByText} = render(<ConfirmationModal isVisible={true} toggleModal={toggleModalMock} confirmAction={confirmationMock} bodyContent={"Text on body"} headerContent={"Text on header"} title={"Modal"} />);
    expect(getByTestId("Modal-resetConfirmationModal")).toBeInTheDocument();
    fireEvent.click(getByTestId("yesButton"));
    expect(toggleModalMock).toHaveBeenCalled();
    expect(confirmationMock).toHaveBeenCalled();
  });
})