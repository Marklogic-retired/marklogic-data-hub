import moment from 'moment';

export const dateConverter = (date:string) => {
  return moment(date).format("YYYY-MM-DD HH:mm");
};

export const relativeTimeConverter = (date:string) => {
  return moment(date).fromNow();
};

export const queryDateConverter = (date:string) => {
  return moment(date).format("DD-MMM-YY HH:mm");
};

export const CardViewDateConverter = (date:string) => {
  return moment(date).format("YYYY-MMMM-DD");
}; 