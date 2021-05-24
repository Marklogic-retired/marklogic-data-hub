import moment from "moment";
import {parse} from "iso8601-duration";
import React from "react";

export const dateConverter = (date:string) => {
  return moment(date).format("YYYY-MM-DD HH:mm");
};

export const relativeTimeConverter = (date:string) => {
  return moment(date).fromNow();
};

export const durationFromDateTime = (date:string) => {
  let currentTime = moment().toDate();
  return moment.duration(currentTime.getTime() - moment(date).toDate().getTime(), "milliseconds").toISOString();
};

export const queryDateConverter = (date:string) => {
  return moment(date).format("DD-MMM-YY HH:mm");
};

export const CardViewDateConverter = (date:string) => {
  return moment(date).format("YYYY-MMMM-DD");
};

export const renderDuration = (duration) => {
  if (duration) {
    let durationObj = parse(duration);
    let days = durationObj.days && durationObj.days > 0 ? durationObj.days + "d" : " ";
    let hours = durationObj.hours && durationObj.hours > 0 ? durationObj.hours + "h" : " ";
    let min = durationObj.minutes && durationObj.minutes > 0 ? durationObj.minutes + "m" : " ";
    let seconds = durationObj.seconds && durationObj.seconds > 0 ? durationObj.seconds + "s" : " ";
    let finalDuration = days + " " + hours + " " + min + " " + seconds;
    return <span>{finalDuration}</span>;
  }
};

