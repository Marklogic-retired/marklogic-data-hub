function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/security/" + module, args));
}

function describeRole(roleName) {
  return invoke("describeRole.sjs", {roleName});
}

function describeUser(username) {
  return invoke("describeUser.sjs", {username});
}

module.exports = {
  describeRole,
  describeUser
};
