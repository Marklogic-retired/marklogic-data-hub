export interface UserContextInterface {
    name: string;
    authenticated: boolean;
    error : any;
    pageRoute: string;
    maxSessionTime: number;
}
  
export interface IUserContextInterface {
    user: UserContextInterface;
    loginAuthenticated: (username: string, authResponse: any) => void;
    sessionAuthenticated: (username: string) => void;
    userNotAuthenticated: () => void;
    handleError: (error:any) => void;
    clearErrorMessage: () => void;
    setPageRoute: (route: string) => void;
    setAlertMessage: (title: string, message: string) => void;
    resetSessionTime: () => void;
    getSessionTime: () => number;
}