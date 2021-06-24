import {useEffect, useRef} from "react";
import intervalWorkerJS from "./use-interval-worker";

export const useInterval = (callback, delay) => {
  const code = intervalWorkerJS.toString();

  const savedCallback = useRef<any>(null);

  // Remember the last callback ref
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      // Check for Worker available in modern browsers. If not, provide degraded experience (primarily for unit tests)
      if (window.Worker) {
        // Create an Object URL for the Worker JS file
        const blobUrl = URL.createObjectURL(new Blob(["(" + code + ")()"]));
        const intervalWorker = new Worker(blobUrl);
        // tell the to start and pass the delay
        intervalWorker.postMessage({action: "start", delay});
        // add a listener on worker to call the callback
        intervalWorker.addEventListener("message", tick);
        // tell the worker to stop the interval and remove listener
        return () => {
          intervalWorker.postMessage({action: "stop"});
          intervalWorker.removeEventListener("message", tick);
        };
      } else {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }
  }, [delay]);
};