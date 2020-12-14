The final-database.xml file in this directory will be written to a user's project in the 
src/main/ml-config/database-fields directory. That implies to the user that they are free to make modifications to it.
Thus, when the user upgrades their local project, the upgrade process cannot replace the file because it may have user
modifications in it. 

Anytime this file is changed, the change needs to be accounted for in the FinalDatabaseXmlFileUpgrader class so that 
if the file does exist, the change can be applied to the existing file. 
