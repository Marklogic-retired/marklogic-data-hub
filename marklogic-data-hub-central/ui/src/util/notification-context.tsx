import React, {useState} from "react";

export interface NotificationContextInterface {
  notifications: any[],
  totalCount: number,
  currentPage: number,
  pageLength: number
}

export const defaultNotificationOptions = {
  notifications: [],
  totalCount: 0,
  currentPage: 1,
  pageLength: 10
};

export interface INotificationContextInterface {
    notificationOptions: NotificationContextInterface;
    setNotificationsObj: (notifications: any[], totalCount: number, pageLength:number) => void;
}

export const NotificationContext = React.createContext<INotificationContextInterface>({
  notificationOptions: defaultNotificationOptions,
  setNotificationsObj: () => { },
});

const NotificationProvider: React.FC<{ children: any }> = ({children}) => {

  const [notificationOptions, setNotificationOptions] = useState<NotificationContextInterface>(defaultNotificationOptions);

  const setNotificationsObj = (notificationsList: any[], count: number, length: number) => {
    setNotificationOptions({...notificationOptions, notifications: notificationsList, totalCount: count, pageLength: length});
  };

  return (
    <NotificationContext.Provider value={{
      notificationOptions,
      setNotificationsObj
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
