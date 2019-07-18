# External Security 
This example demonstrates how to use external security for the user that deploys the application as well as allowing ldsp users to authenticate to the application server

For additional information on External Security see [Chapter 12 of the Security Guide](https://docs.marklogic.com/guide/security/external-auth).

# What's required
### An External Security
This example shows how to use an already setup external security. You will need to have one set up ahead of time. See [Creating an External Authentication Configuration Object](https://docs.marklogic.com/guide/security/external-auth#id_35317) on how to create one.

### An Assign Role with adequate permissions
The LDAP or AD user needs to have a role assigned to it with adequate permissions in order to deploy the application. 

See [Assigning an External Name to a Role](https://docs.marklogic.com/guide/security/external-auth#id_34690) on how to assign roles to external users.

### Turn on External Security on out of the box Application Servers
The External Security that will be used in the gradle deployment has to be turned on  the 8000, 8001 and 8002 Application Servers. The authenticate type will also have to be set to basic or kerberos-ticket.

See [Configuring an App Server for External Authentication](https://docs.marklogic.com/guide/security/external-auth#id_63262) for details on how this can be done.

### Configuring gradle properties files
There are example properties files in this folder and below are the required changes.

a custom property will need to be defined in order to be referenced in the server configuration files.  
```
#this should match the name of the exteranl security configuration 
cpExternalSecurity=LDAPConfig
```

Any environment that needs to use External Security needs to have its authentication type changed for the application servers that are going to be using it
```
#basic is used in this example but kerberos-ticket could also work
mlJobAuth=basic
mlTraceAuth=basic
mlFinalAuth=basic
mlStagingAuth=basic

mlRestAuthentication=basic

mlAppServicesAuthentication=basic
mlAdminAuthentication=basic
mlManageAuthentication=basic
```

If there is an environment that you dont have to use the External Security on such as a local environment then you can simplely leave the value of cpExternalSecurity empty
```
#intentionally left empty.
#empty means there will be no External Security Configuration set 
cpExternalSecurity=
```

Each of the data hub server, (final, job, staging, trace), will have to have their configuration changed to set the external-security like such.
```
{
  "external-security":["%%cpExternalSecurity%%"]
}
```
