import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {parse} from "iso8601-duration";
import React from "react";

dayjs.extend(relativeTime);

export const dateConverter = (date:string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

export const relativeTimeConverter = (date:string) => {
  return dayjs(date).fromNow();
};

export const durationFromDateTime = (date:string) => {
  let currentTime = dayjs().toDate();
  return dayjs.duration(currentTime.getTime() - dayjs(date).toDate().getTime(), "milliseconds").toISOString();
};

export const queryDateConverter = (date:string) => {
  return dayjs(date).format("DD-MMM-YY HH:mm");
};

export const CardViewDateConverter = (date:string) => {
  return dayjs(date).format("YYYY-MMMM-DD");
};

export const renderDuration = (duration) => {
  if (duration) {
    let durationObj = parse(duration);
    let days = durationObj.days && durationObj.days > 0 ? durationObj.days + "d" : " ";
    let hours = durationObj.hours && durationObj.hours > 0 ? durationObj.hours + "h" : " ";
    let min = durationObj.minutes && durationObj.minutes > 0 ? durationObj.minutes + "m" : " ";
    let seconds = durationObj.seconds && durationObj.seconds > 0 ? Math.trunc(durationObj.seconds) + "s" : " ";
    let milliseconds = durationObj.seconds && durationObj.seconds > 0 ?   Math.trunc(((durationObj.seconds - Math.trunc(durationObj.seconds))*1000)) + "ms": "";
    let finalDuration = days + " " + hours + " " + min + " " + seconds+ " "+ milliseconds;
    return <span>{finalDuration}</span>;
  }
};

