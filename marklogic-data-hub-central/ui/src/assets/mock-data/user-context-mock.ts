import { UserContextInterface, IUserContextInterface } from '../../types/user-types';

const defaultUserData: UserContextInterface = {
  name: '',
  authenticated: false,
  error : {
    title: '',
    message: '',
    type: ''
  },
  pageRoute: '/',
  maxSessionTime: 300
}

const defaultUserContext: IUserContextInterface = {
  user: defaultUserData,
  loginAuthenticated: jest.fn(),
  sessionAuthenticated: jest.fn(),
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  clearErrorMessage: jest.fn(),
  setPageRoute: jest.fn(),
  setAlertMessage: jest.fn(),
  resetSessionTime: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(300)
};

export const userNotAuthenticated: IUserContextInterface = defaultUserContext;

export const userAuthenticated: IUserContextInterface = Object.assign(defaultUserContext, {
  user: {
    name: '',
    authenticated: true,
    error : {
      type: ''
    },
    pageRoute: '/',
    maxSessionTime: 300
  }
})

export const userSessionWarning: IUserContextInterface = {
  user: {
    name: '',
    authenticated: true,
    error : {
      title: '',
      message: '',
      type: ''
    },
    pageRoute: '/',
    maxSessionTime: 300
  },
  loginAuthenticated: jest.fn(),
  sessionAuthenticated: jest.fn(),
  setPageRoute: jest.fn(),
  setAlertMessage: jest.fn(),
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearErrorMessage: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(29)
}

export const userModalError: IUserContextInterface = {
  user: {
    name: '',
    authenticated: false,
    error : {
      title: '500 Internal Server Error',
      message: 'java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011',
      type: 'MODAL'
    },
    pageRoute: '/',
    maxSessionTime: 300
  },
  loginAuthenticated: jest.fn(),
  sessionAuthenticated: jest.fn(),
  setPageRoute: jest.fn(),
  setAlertMessage: jest.fn(),
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearErrorMessage: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(300)
}

export const userNoErrorNoSessionWarning: IUserContextInterface = {
  user: {
    name: '',
    authenticated: false,
    error : {
      title: '',
      message: '',
      type: ''
    },
    pageRoute: '/',
    maxSessionTime: 300
  },
  loginAuthenticated: jest.fn(),
  sessionAuthenticated: jest.fn(),
  setPageRoute: jest.fn(),
  setAlertMessage: jest.fn(),
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearErrorMessage: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(300)
}

export const userHasModalErrorHasSessionWarning: IUserContextInterface = {
  user: {
    name: '',
    authenticated: false,
    error : {
      title: '500 Internal Server Error',
      message: 'java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011',
      type: 'MODAL'
    },
    pageRoute: '/',
    maxSessionTime: 300
  },
  loginAuthenticated: jest.fn(),
  sessionAuthenticated: jest.fn(),
  setPageRoute: jest.fn(),
  setAlertMessage: jest.fn(),
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearErrorMessage: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(29)
}
