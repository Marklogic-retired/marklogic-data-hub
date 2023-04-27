function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/data-services/security/" + module, args));
}

function describeRole(roleName) {
  return invoke("describeRole.mjs", {roleName});
}

function describeUser(username) {
  return invoke("describeUser.mjs", {username});
}

export default {
  describeRole,
  describeUser
};
