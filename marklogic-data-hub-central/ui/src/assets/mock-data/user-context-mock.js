export const userSessionWarning = {
  user: {
    error : {
      title: '',
      message: '',
      type: ''
    },
    authenticated: true,
    maxSessionTime: 300
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearErrorMessage: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(29)
}

export const userModalError = {
  user: {
    error : {
      title: '500 Internal Server Error',
      message: 'java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011',
      type: 'MODAL'
    },
    maxSessionTime: 300
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearErrorMessage: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(300)
}

export const userNoErrorNoSessionWarning = {
  user: {
    error : {
      title: '',
      message: '',
      type: ''
    },
    maxSessionTime: 300
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearErrorMessage: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(300)
}

export const userHasModalErrorHasSessionWarning = {
  user: {
    error : {
      title: '500 Internal Server Error',
      message: 'java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011',
      type: 'MODAL'
    },
    maxSessionTime: 300
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(29)
}

export const userAuthenticated = {
  user: {
    error : {
      type: ''
    },
    authenticated: true,
    redirect: true
  },
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  clearRedirect: jest.fn(),
  getSessionTime: jest.fn().mockReturnValue(300)
}