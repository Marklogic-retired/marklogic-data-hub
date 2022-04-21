
export const isFlowRunning = (jobResponse) => {
  return !jobResponse.timeEnded || jobResponse === "N/A";
};

export const canStopFlow = (flowResponse?) => {
  if (!flowResponse) return false;
  return localStorage.getItem("dataHubUser") === flowResponse.user;
};