import moment from 'moment';

export const dateConverter = (date:string) => {
  return moment(date).format("YYYY-MM-DD HH:mm");
}

export const relativeTimeConverter = (date:string) => {
  return moment(date).fromNow();
}

