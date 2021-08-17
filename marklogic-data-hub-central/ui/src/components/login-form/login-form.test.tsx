import React from "react";
import {render, fireEvent, wait} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axiosMock from "axios";
import LoginForm from "./login-form";

jest.mock("axios");

describe("Login page test", () => {

  let userField, passField, loginBtn;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Verify login fields are rendered and can take input", async () => {
    const {getByPlaceholderText, getByText} = await render(<LoginForm />);
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText("Log In");

    expect(userField).toBeInTheDocument();
    expect(passField).toBeInTheDocument();
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn).toBeEnabled();

    fireEvent.change(userField, {target: {value: "user"}});
    expect(loginBtn).toBeEnabled();
    fireEvent.change(passField, {target: {value: "pass"}});
    //Verifying that login button is enabled only when all three input fields are entered by user
    expect(loginBtn).toBeEnabled();

    expect(userField).toHaveAttribute("value", "user");
    expect(passField).toHaveAttribute("value", "pass");
  });

  test("Verify form error when input fields are empty", async () => {
    const {getByPlaceholderText, getByText} = await render(<LoginForm />);
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText("Log In");

    fireEvent.change(userField, {target: {value: "user"}});
    fireEvent.change(userField, {target: {value: ""}});
    let usernameError = getByText("Username is required");
    expect(usernameError).toBeInTheDocument();

    fireEvent.change(passField, {target: {value: "pass"}});
    fireEvent.change(passField, {target: {value: ""}});
    let passwordError = getByText("Password is required");
    expect(passwordError).toBeInTheDocument();
  });

  test("Verify login with status==200", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: {}})));
    const {container, getByPlaceholderText, getByText} = await render(<LoginForm />);
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText("Log In");

    fireEvent.change(userField, {target: {value: "validUser"}});
    fireEvent.change(passField, {target: {value: "pass"}});
    await wait(() => {
      fireEvent.submit(loginBtn);
    });
    let url = "/api/login";
    let payload = {"password": "pass", "username": "validUser"};
    expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(container.querySelector("div .alert")).not.toHaveValue();
  });

  test("Verify login with error status 401", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.reject({response: {status: 401}})));

    const {getByPlaceholderText, getByText} = await render(<LoginForm />);
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText("Log In");

    fireEvent.change(userField, {target: {value: "validUser"}});
    fireEvent.change(passField, {target: {value: "invalidPass"}});
    await wait(() => {
      fireEvent.submit(loginBtn);
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText("The username and password combination is not recognized by MarkLogic.")).toBeInTheDocument();
  });

  test("Verify login with error status 403", async () => {
    axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.reject({response: {status: 403}})));

    const {getByPlaceholderText, getByText} = await render(<LoginForm />);
    userField = getByPlaceholderText("Enter username");
    passField = getByPlaceholderText("Enter password");
    loginBtn = getByText("Log In");

    fireEvent.change(userField, {target: {value: "invalidUser"}});

    fireEvent.change(passField, {target: {value: "pass"}});
    await wait(() => {
      fireEvent.submit(loginBtn);
    });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(getByText("User does not have the required permissions to run Data Hub.")).toBeInTheDocument();
  });

});
