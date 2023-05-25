const defaultEnv = {
  serviceName: "",
  dataHubVersion: "",
  markLogicVersion: "",
  hubCentralVersion: "",
};

export function getEnvironment(): any {
  let env: any;
  env = localStorage.getItem("environment");
  if (env) {
    return JSON.parse(env);
  } else {
    return defaultEnv;
  }
}

export function parseVersion(value): any {
  if (value === "") {
    return "";
  } else {
    let version = "";
    let flag = false;
    for (let c in value) {
      if (value[c] !== "." && value[c] !== "-") {
        version += value[c];
      } else if (value[c] === "." && flag === false) {
        flag = true;
        version += value[c];
      } else {
        break;
      }
    }
    return version;
  }
}

export function resetEnvironment() {
  localStorage.setItem("environment", JSON.stringify(defaultEnv));
}

export function getAppVersion() {
  const environment = getEnvironment();
  return parseVersion(environment.dataHubVersion);
}

export default {getEnvironment, resetEnvironment};
