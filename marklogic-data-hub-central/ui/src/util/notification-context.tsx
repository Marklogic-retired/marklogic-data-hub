import React, {useState} from "react";

export interface NotificationContextInterface {
  notifications: any[],
  totalCount: number,
  currentPage: number
}

const defaultNotificationOptions = {
  notifications: [],
  totalCount: 0,
  currentPage: 1
};

export interface INotificationContextInterface {
    notificationOptions: NotificationContextInterface;
    setNotificationsObj: (notifications: any[], totalCoount: number) => void;
}

export const NotificationContext = React.createContext<INotificationContextInterface>({
  notificationOptions: defaultNotificationOptions,
  setNotificationsObj: () => { },
});

const NotificationProvider: React.FC<{ children: any }> = ({children}) => {

  const [notificationOptions, setNotificationOptions] = useState<NotificationContextInterface>(defaultNotificationOptions);

  const setNotificationsObj = (notificationsList: any[], count: number) => {
    setNotificationOptions({...notificationOptions, notifications: notificationsList, totalCount: count});
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
