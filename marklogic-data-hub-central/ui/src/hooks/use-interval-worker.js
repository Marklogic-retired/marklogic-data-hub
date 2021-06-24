/* eslint-disable no-restricted-globals */

// this worker will run an interval on a separate thread
export default () => {
  let started = false;
  let interval;
  self.addEventListener("message", function(e) {
    switch (e.data.action) {
    case "start":
      if (!started) {
        started = true;
        interval = setInterval(function() {
          self.postMessage({action: "tick"});
        }, e.data.delay);
      }
      break;
    case "stop":
      clearInterval(interval);
      started = false;
      break;
    }
  }, false);
};