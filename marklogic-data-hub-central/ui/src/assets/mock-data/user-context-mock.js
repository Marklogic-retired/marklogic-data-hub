export const userSessionWarning = {
  user: {
    error : { 
      title: '', 
      message: '',
      type: ''
    },
    maxSessionTime: 300,
    sessionWarning: true
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  setSessionWarning: jest.fn(),
  clearErrorMessage: jest.fn()
}

export const userModalError = {
  user: {
    error : { 
      title: '500 Internal Server Error', 
      message: 'java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011',
      type: 'MODAL'
    },
    maxSessionTime: 300,
    sessionWarning: false
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  setSessionWarning: jest.fn(),
  clearErrorMessage: jest.fn()
}

export const userNoErrorNoSessionWarning = {
  user: {
    error : { 
      title: '', 
      message: '',
      type: ''
    },
    maxSessionTime: 300,
    sessionWarning: false
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  setSessionWarning: jest.fn(),
  clearErrorMessage: jest.fn()
}

export const userHasModalErrorHasSessionWarning = {
  user: {
    error : { 
      title: '500 Internal Server Error', 
      message: 'java.net.ConnectException: Failed to connect to localhost/0:0:0:0:0:0:0:1:8011',
      type: 'MODAL'
    },
    maxSessionTime: 300,
    sessionWarning: true
  },
  userNotAuthenticated: jest.fn(),
  handleError: jest.fn(),
  resetSessionTime: jest.fn(),
  setSessionWarning: jest.fn(),
}