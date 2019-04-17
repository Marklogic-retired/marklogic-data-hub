# Change Log

# [v4.3.1](https://github.com/marklogic/marklogic-data-hub/tree/v4.3.0) (2019-04-16)

**Fixed bugs:**
- [DHFPROD-1417] - Make the title field required on Entity editor 
- Enable namespace support in dhf [\#1580](https://github.com/marklogic/marklogic-data-hub/issues/1580)

**Improvement**
-  [DHFPROD-1417] - Adopt 3 new roles (Flow Dev, Flow Op, Data Hub Admin) to align with DHS roles


# [v4.2.2](https://github.com/marklogic/marklogic-data-hub/tree/v4.2.2) (2019-03-13)

**Fixed bugs:**
- empty collector result should be finished instead of failed job [\#1715](https://github.com/marklogic/marklogic-data-hub/issues/1715)
- gradle hubRunFlow options does not lose dhf prefix [\#1536](https://github.com/marklogic/marklogic-data-hub/issues/1536)
- [DHFPROD-1930] Data Hub Framework URI handling with diacritics
- [DHFPROD-1929] Triggers dont get deployed to staging-triggers


# [v4.2.1](https://github.com/marklogic/marklogic-data-hub/tree/v4.2.1) (2019-02-27)

**Fixed bugs:**
- Unable to delete harmonize flow with the "trash" icon [\#1877](https://github.com/marklogic/marklogic-data-hub/issues/1877)
- QuickStart - mlcp transform_param shows the wrong entity when defining input flow [\#1858](https://github.com/marklogic/marklogic-data-hub/issues/1858)
- flow name no longer stored for errors [\#1845](https://github.com/marklogic/marklogic-data-hub/issues/1845)

**Improvement**
-  [DHFPROD-1819] - Generate ES-created entity schema




# [v4.2.0](https://github.com/marklogic/marklogic-data-hub/tree/v4.2.0) (2019-02-14)
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v4.1.1...v4.2.0)

**Fixed bugs:**
- Quickstart Upgrade instructions link is malformed [\#1835](https://github.com/marklogic/marklogic-data-hub/issues/1835)
- Unable to generate the TDE of an entity containing references to other entities \(DHF 4.1.0\) [\#1717](https://github.com/marklogic/marklogic-data-hub/issues/1717)
- mlReloadSchemas task deletes all the final DB content \(DHF 4.1.0\) [\#1716](https://github.com/marklogic/marklogic-data-hub/issues/1716)
- 4.1.0 RunWriters errors are not properly accounted. [\#1705](https://github.com/marklogic/marklogic-data-hub/issues/1705)
- Modules fail to deploy [\#825](https://github.com/marklogic/marklogic-data-hub/issues/825)
- Gradle hubRunFlow required entityName to start with a capital letter [\#1827](https://github.com/marklogic/marklogic-data-hub/issues/1827)

**Closed issues:**
- Error when resolving local entity reference [\#1811](https://github.com/marklogic/marklogic-data-hub/issues/1811)
- Example :Single Step Ingest has error on DHF 4.1.x [\#1810](https://github.com/marklogic/marklogic-data-hub/issues/1810)
- hubGenerateTDETemplates fails when there are relations between entities [\#1771](https://github.com/marklogic/marklogic-data-hub/issues/1771)
- How to update a Hub Project link produces error [\#1754](https://github.com/marklogic/marklogic-data-hub/issues/1754)
- Tutorial is still 3.x [\#1733](https://github.com/marklogic/marklogic-data-hub/issues/1733)
- Javascript trace errorCount stuck at 1  [\#1721](https://github.com/marklogic/marklogic-data-hub/issues/1721)
- hubGenerateTDETemplates only generates TDE's for staging database \(v4.0.3\) [\#1618](https://github.com/marklogic/marklogic-data-hub/issues/1618)
- 4.0.0 - "How to update a Hub Project" link returns 404 [\#1371](https://github.com/marklogic/marklogic-data-hub/issues/1371)

**Merged pull requests:**
- Run hubDeployUserArtifacts cmd after mlReloadSchemas to re-generate TDE [\#1881](https://github.com/marklogic/marklogic-data-hub/pull/1881) ([akshaysonvane](https://github.com/akshaysonvane))
- Run hubDeployUserArtifacts cmd after mlReloadSchemas to re-generate TDE - 4.x-develop [\#1880](https://github.com/marklogic/marklogic-data-hub/pull/1880) ([akshaysonvane](https://github.com/akshaysonvane))
- Upgrade ml-gradle to version 3.12.0 in data-hub gradle plugin - 4.x-develop [\#1875](https://github.com/marklogic/marklogic-data-hub/pull/1875) ([akshaysonvane](https://github.com/akshaysonvane))
- Upgrade ml-gradle to version 3.12.0 in data-hub gradle plugin [\#1874](https://github.com/marklogic/marklogic-data-hub/pull/1874) ([akshaysonvane](https://github.com/akshaysonvane))
- Refactoring e-node code [\#1873](https://github.com/marklogic/marklogic-data-hub/pull/1873) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-1675: Upgrade ml-gradle to version 3.12.0 for 4.x-develop [\#1872](https://github.com/marklogic/marklogic-data-hub/pull/1872) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1675: Upgrade ml-gradle to version 3.12.0 [\#1871](https://github.com/marklogic/marklogic-data-hub/pull/1871) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1643- Do a case insensitive equality check for entity name when creating an… [\#1869](https://github.com/marklogic/marklogic-data-hub/pull/1869) ([srinathgit](https://github.com/srinathgit))
- Do a case insensitive equality check for entity name when creating an… [\#1868](https://github.com/marklogic/marklogic-data-hub/pull/1868) ([srinathgit](https://github.com/srinathgit))
- Add RunFlowTask for 5.x flows [\#1867](https://github.com/marklogic/marklogic-data-hub/pull/1867) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1825: Fix for failing EmptyLegacyCollectorTest in Jenkins [\#1866](https://github.com/marklogic/marklogic-data-hub/pull/1866) ([rahulvudutala](https://github.com/rahulvudutala))
- Creating FlowRunner Class [\#1865](https://github.com/marklogic/marklogic-data-hub/pull/1865) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-1428 Improve the usability of text input elements [\#1864](https://github.com/marklogic/marklogic-data-hub/pull/1864) ([brucean52](https://github.com/brucean52))
- DHFPROD-1783: Improved application layout in QuickStart [\#1861](https://github.com/marklogic/marklogic-data-hub/pull/1861) ([alexsmr](https://github.com/alexsmr))
- Deploy process and flow artifacts to the staging db [\#1860](https://github.com/marklogic/marklogic-data-hub/pull/1860) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1795: Debug class [\#1859](https://github.com/marklogic/marklogic-data-hub/pull/1859) ([clockworked247](https://github.com/clockworked247))
- DHFPROD-1781 Fix exceptions In Storybook [\#1857](https://github.com/marklogic/marklogic-data-hub/pull/1857) ([brucean52](https://github.com/brucean52))
- Add custom command to set database field using XML payload [\#1855](https://github.com/marklogic/marklogic-data-hub/pull/1855) ([akshaysonvane](https://github.com/akshaysonvane))
- e2e test fix to setup Express server when e2e testing + warnings off [\#1854](https://github.com/marklogic/marklogic-data-hub/pull/1854) ([clockworked247](https://github.com/clockworked247))
- DHFPROD-1428 Improve the usability of text input elements [\#1853](https://github.com/marklogic/marklogic-data-hub/pull/1853) ([brucean52](https://github.com/brucean52))
- Fixes \#1721, DHFPROD-1680 and DHFPROD-1619 to 4.x-develop [\#1852](https://github.com/marklogic/marklogic-data-hub/pull/1852) ([bsrikan](https://github.com/bsrikan))
- Fixes \#1721, DHFPROD-1680 and DHFPROD-1619 to develop [\#1851](https://github.com/marklogic/marklogic-data-hub/pull/1851) ([bsrikan](https://github.com/bsrikan))
- Job Library, JobMonitor\(and its test\) and refactoring enode code [\#1850](https://github.com/marklogic/marklogic-data-hub/pull/1850) ([srinathgit](https://github.com/srinathgit))
- Dhfprod 1786 [\#1848](https://github.com/marklogic/marklogic-data-hub/pull/1848) ([akshaysonvane](https://github.com/akshaysonvane))
- update version to be 4.2.0-rc1 [\#1847](https://github.com/marklogic/marklogic-data-hub/pull/1847) ([kkanthet](https://github.com/kkanthet))
- Dhfprod 1760 develop [\#1846](https://github.com/marklogic/marklogic-data-hub/pull/1846) ([akshaysonvane](https://github.com/akshaysonvane))
- Dhfprod 1788 - develop PR [\#1844](https://github.com/marklogic/marklogic-data-hub/pull/1844) ([ryanjdew](https://github.com/ryanjdew))
- DHFPROD-1788 Bring in other models for uber model in trigger [\#1843](https://github.com/marklogic/marklogic-data-hub/pull/1843) ([ryanjdew](https://github.com/ryanjdew))
- Dhfprod 1760 - env specific timestamp file [\#1842](https://github.com/marklogic/marklogic-data-hub/pull/1842) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1788 Correct TDEs to work with nested entities and add test \(… [\#1841](https://github.com/marklogic/marklogic-data-hub/pull/1841) ([aebadirad](https://github.com/aebadirad))
- DHFPROD-1775: Added multiple examples to Swagger docs [\#1840](https://github.com/marklogic/marklogic-data-hub/pull/1840) ([clockworked247](https://github.com/clockworked247))
- DHFPROD-1726 - "Update a Hub Project link" produces error [\#1839](https://github.com/marklogic/marklogic-data-hub/pull/1839) ([brucean52](https://github.com/brucean52))
- DHFPROD-1745 Primary key is not displayed on mapping entity table [\#1838](https://github.com/marklogic/marklogic-data-hub/pull/1838) ([brucean52](https://github.com/brucean52))
- DHFPROD-1784- Refactor 4.x Flow, Job, Tracing, Debuging, Collector, gradle plugin, … [\#1834](https://github.com/marklogic/marklogic-data-hub/pull/1834) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-1788 Correct TDEs to work with nested entities and add test [\#1833](https://github.com/marklogic/marklogic-data-hub/pull/1833) ([ryanjdew](https://github.com/ryanjdew))
- DHFPROD-1745: Primary key is not displayed on mapping entity table [\#1831](https://github.com/marklogic/marklogic-data-hub/pull/1831) ([brucean52](https://github.com/brucean52))
- Dhfprod 1662 [\#1830](https://github.com/marklogic/marklogic-data-hub/pull/1830) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1662 - Stop overriding mlAppName if explicitly set - 4.x-develop [\#1828](https://github.com/marklogic/marklogic-data-hub/pull/1828) ([akshaysonvane](https://github.com/akshaysonvane))
- Fixing Issue \#1810: fixed single-step-ingest example [\#1823](https://github.com/marklogic/marklogic-data-hub/pull/1823) ([mhuang-ml](https://github.com/mhuang-ml))
- Remove hub-internal-config/schemas as part of upgrade [\#1821](https://github.com/marklogic/marklogic-data-hub/pull/1821) ([srinathgit](https://github.com/srinathgit))
- Fix for DHFPROD-1773, DHFPROD-1746 [\#1820](https://github.com/marklogic/marklogic-data-hub/pull/1820) ([srinathgit](https://github.com/srinathgit))
- Fix for DHFPROD-1773, DHFPROD-1746 [\#1819](https://github.com/marklogic/marklogic-data-hub/pull/1819) ([srinathgit](https://github.com/srinathgit))
- add wait on uninstall for windows [\#1818](https://github.com/marklogic/marklogic-data-hub/pull/1818) ([ayuwono](https://github.com/ayuwono))
- add wait on uninstall for windows machine [\#1817](https://github.com/marklogic/marklogic-data-hub/pull/1817) ([ayuwono](https://github.com/ayuwono))
- DHFPROD-1774 Stop checking triggers 4.x [\#1816](https://github.com/marklogic/marklogic-data-hub/pull/1816) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1774 Stop checking for triggers directory in hub-internal-config [\#1815](https://github.com/marklogic/marklogic-data-hub/pull/1815) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1604 - Broken link fixes to 4x tut. [\#1814](https://github.com/marklogic/marklogic-data-hub/pull/1814) ([eltesoro-ml](https://github.com/eltesoro-ml))
- Fixing the "Order" entity [\#1813](https://github.com/marklogic/marklogic-data-hub/pull/1813) ([srinathgit](https://github.com/srinathgit))
- Fixing the "Order" entity [\#1812](https://github.com/marklogic/marklogic-data-hub/pull/1812) ([srinathgit](https://github.com/srinathgit))
- Fix for generating TDE templates for DHF style entities with references - 4.x-develop [\#1809](https://github.com/marklogic/marklogic-data-hub/pull/1809) ([srinathgit](https://github.com/srinathgit))
- Fix for generating TDE templates for DHF style entities with references [\#1808](https://github.com/marklogic/marklogic-data-hub/pull/1808) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-1604 QuickStart tutorial for 4.x - code complete, but still hidden. [\#1807](https://github.com/marklogic/marklogic-data-hub/pull/1807) ([eltesoro-ml](https://github.com/eltesoro-ml))
- Upgrade staging schemas path in 5.x [\#1806](https://github.com/marklogic/marklogic-data-hub/pull/1806) ([srinathgit](https://github.com/srinathgit))
- Feature/swagger mapping process [\#1805](https://github.com/marklogic/marklogic-data-hub/pull/1805) ([aebadirad](https://github.com/aebadirad))
- Remove amps during uninstall [\#1804](https://github.com/marklogic/marklogic-data-hub/pull/1804) ([srinathgit](https://github.com/srinathgit))
- Remove amps during uninstall [\#1803](https://github.com/marklogic/marklogic-data-hub/pull/1803) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-1726: "Update a Hub Project link" produces error [\#1802](https://github.com/marklogic/marklogic-data-hub/pull/1802) ([brucean52](https://github.com/brucean52))
- Update modules count after addition of 5.x modules [\#1801](https://github.com/marklogic/marklogic-data-hub/pull/1801) ([srinathgit](https://github.com/srinathgit))
- Deleting project dir before tests [\#1799](https://github.com/marklogic/marklogic-data-hub/pull/1799) ([srinathgit](https://github.com/srinathgit))
- dhfprod 1754 windows run [\#1798](https://github.com/marklogic/marklogic-data-hub/pull/1798) ([ayuwono](https://github.com/ayuwono))
- Feature/dhfprod 1703 Integration Test PR [\#1797](https://github.com/marklogic/marklogic-data-hub/pull/1797) ([aebadirad](https://github.com/aebadirad))
- added dhf4 javascript only examples [\#1796](https://github.com/marklogic/marklogic-data-hub/pull/1796) ([derms](https://github.com/derms))
- DHFPROD-1754 + other issues - develop branch [\#1795](https://github.com/marklogic/marklogic-data-hub/pull/1795) ([srinathgit](https://github.com/srinathgit))
- Dhfprod 1755 hubCreateProcess task [\#1794](https://github.com/marklogic/marklogic-data-hub/pull/1794) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1737 Add swagger mocks for flows [\#1793](https://github.com/marklogic/marklogic-data-hub/pull/1793) ([ryanjdew](https://github.com/ryanjdew))
- DHFPROD-1754 + other issues [\#1792](https://github.com/marklogic/marklogic-data-hub/pull/1792) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-1740, Create 5.x FlowManager and refactor 4.x FlowManager to LegacyFlowManager [\#1791](https://github.com/marklogic/marklogic-data-hub/pull/1791) ([srinathgit](https://github.com/srinathgit))
- Dhfprod 1718 process manager [\#1790](https://github.com/marklogic/marklogic-data-hub/pull/1790) ([akshaysonvane](https://github.com/akshaysonvane))
- add wait after entity checkbox [\#1789](https://github.com/marklogic/marklogic-data-hub/pull/1789) ([ayuwono](https://github.com/ayuwono))
- DHFPROD-1710 - create space for the new dhf5 code \(still rewriting to… [\#1788](https://github.com/marklogic/marklogic-data-hub/pull/1788) ([aebadirad](https://github.com/aebadirad))
- 4.0 to 4.1 snapshot change [\#1787](https://github.com/marklogic/marklogic-data-hub/pull/1787) ([aebadirad](https://github.com/aebadirad))
- DHFPROD-1751 - update develop snapshot version [\#1786](https://github.com/marklogic/marklogic-data-hub/pull/1786) ([aebadirad](https://github.com/aebadirad))
- wait after checking entity box [\#1785](https://github.com/marklogic/marklogic-data-hub/pull/1785) ([ayuwono](https://github.com/ayuwono))
- Develop bug fixes related to LoadUserArtifactsCommand [\#1782](https://github.com/marklogic/marklogic-data-hub/pull/1782) ([srinathgit](https://github.com/srinathgit))
- Fix LoadUserArtifactsCommand and tests in 4.x [\#1781](https://github.com/marklogic/marklogic-data-hub/pull/1781) ([srinathgit](https://github.com/srinathgit))
- Loading to staging schemas db from database-specific directory in develop [\#1780](https://github.com/marklogic/marklogic-data-hub/pull/1780) ([srinathgit](https://github.com/srinathgit))
- Revert "DHFPROD-1428: Improve the usability of text input elements" [\#1777](https://github.com/marklogic/marklogic-data-hub/pull/1777) ([aebadirad](https://github.com/aebadirad))
- DHFPROD-1633 - more fixes [\#1767](https://github.com/marklogic/marklogic-data-hub/pull/1767) ([eltesoro-ml](https://github.com/eltesoro-ml))
- DHFPROD-1693 Use CMA with ml-gradle 3.11 [\#1766](https://github.com/marklogic/marklogic-data-hub/pull/1766) ([ryanjdew](https://github.com/ryanjdew))
- DHFPROD-1741 Add a generic Process class [\#1765](https://github.com/marklogic/marklogic-data-hub/pull/1765) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1693 Use CMA with ml-gradle 3.11 [\#1764](https://github.com/marklogic/marklogic-data-hub/pull/1764) ([ryanjdew](https://github.com/ryanjdew))
- DHFPROD-1428: Improve the usability of text input elements [\#1763](https://github.com/marklogic/marklogic-data-hub/pull/1763) ([brucean52](https://github.com/brucean52))
- E2e/no toaster wait -- comment out waiting for toaster after updating index [\#1762](https://github.com/marklogic/marklogic-data-hub/pull/1762) ([ayuwono](https://github.com/ayuwono))
- Updated tests to exclude those that are bound to fail in DHS [\#1761](https://github.com/marklogic/marklogic-data-hub/pull/1761) ([bsrikan](https://github.com/bsrikan))
- Dhfprod 1667 [\#1760](https://github.com/marklogic/marklogic-data-hub/pull/1760) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1427 - Improve the usability of switch elements [\#1759](https://github.com/marklogic/marklogic-data-hub/pull/1759) ([brucean52](https://github.com/brucean52))
- Calling hubInstallModules in Installer class when running tests in DHS [\#1758](https://github.com/marklogic/marklogic-data-hub/pull/1758) ([bsrikan](https://github.com/bsrikan))
- Update npm packages for security vulns [\#1757](https://github.com/marklogic/marklogic-data-hub/pull/1757) ([aebadirad](https://github.com/aebadirad))
- E2e/qs misc test [\#1756](https://github.com/marklogic/marklogic-data-hub/pull/1756) ([ayuwono](https://github.com/ayuwono))
- Create 'LoadUserArtifactsCommand' for loading entities, mappings [\#1755](https://github.com/marklogic/marklogic-data-hub/pull/1755) ([srinathgit](https://github.com/srinathgit))
- Updating gradle-dhs.properties to run DHF core tests in DHS [\#1753](https://github.com/marklogic/marklogic-data-hub/pull/1753) ([bsrikan](https://github.com/bsrikan))
- 2019 copyright update [\#1752](https://github.com/marklogic/marklogic-data-hub/pull/1752) ([aebadirad](https://github.com/aebadirad))
- Feature: Swagger powered mock api framework [\#1745](https://github.com/marklogic/marklogic-data-hub/pull/1745) ([clockworked247](https://github.com/clockworked247))
- Es alignment for 4.x [\#1742](https://github.com/marklogic/marklogic-data-hub/pull/1742) ([aebadirad](https://github.com/aebadirad))


## JIRA Issues 

Bug

    [DHFPROD-1619] - Ran into writeTraceError when running harmonization flow for 2.0.4 project upgraded to 4.1 
    [DHFPROD-1643] - Entity name and case-sensitive issue while running flow
    [DHFPROD-1662] - Don't override app name if a user has set it
    [DHFPROD-1667] - 4.1.0 RunWriters errors are not properly accounted
    [DHFPROD-1675] - mlReloadSchemas task deletes all the final DB content
    [DHFPROD-1680] - Javascript trace errorCount stuck at 1
    [DHFPROD-1730] - QuickStart: In "Congratulations on updating ...", "How to update..." link points to localhost:8080/null
    [DHFPROD-1745] - Primary key is not displayed on mapping entity table
    [DHFPROD-1746] - hubGenerateTDETemplates fails when there are relations between entities
    [DHFPROD-1754] - Quickstart install, uninstall, and redeploy hub take a long time
    [DHFPROD-1760] - module deploy timestamp is not environment specific
    [DHFPROD-1772] - Example :Single Step Ingest has error on DHF 4.1.x
    [DHFPROD-1774] - Cannot upgrade from 4.1.0 to 4.x
    [DHFPROD-1788] - Triggers from es-alignment do not generate tde for already nested entity


Improvement

    [DHFPROD-1428] - Improve the usability of text input elements

Sub-task


    [DHFPROD-1688] - Add Mock API framework for node.js

Story


    [DHFPROD-1553] - Make DHF reliant on Entity Services for entity model generation
    [DHFPROD-1604] - Update Quickstart tutorial for DHF 4.x
    [DHFPROD-1692] - Technical story: Update ml-gradle to 3.11
    [DHFPROD-1734] - Address high security vulnerability from github
    [DHFPROD-1758] - Document new 'hubDeployUserArtifacts' ml-gradle command


## [v4.1.1](https://github.com/marklogic/marklogic-data-hub/tree/v4.1.1) (2019-01-15)
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/4.1.0...v4.1.1)

**Implemented enhancements:**

- Better handling of nested objects as properties when property is not defined as a formal entity, array, or scalar value  [\#1652](https://github.com/marklogic/marklogic-data-hub/issues/1652)

**Confirmed fixed bugs:**

- mlFinalForestsPerHost is ignored [\#1596](https://github.com/marklogic/marklogic-data-hub/issues/1596)
- mlDeployDatabases ignores config files under entity-config [\#1437](https://github.com/marklogic/marklogic-data-hub/issues/1437)
- mlWatch doesn't load from src/main/ml-modules [\#1429](https://github.com/marklogic/marklogic-data-hub/issues/1429)
- certificate-templates and external-security config not being deployed from ml-config [\#1384](https://github.com/marklogic/marklogic-data-hub/issues/1384)
- DHF 4.0.0: mlDeployDatabases not deploying config from src/main/ml-config \(same for mlDeploySecurity\) [\#1382](https://github.com/marklogic/marklogic-data-hub/issues/1382)
- DHF 4.0.0: mlDeploy fails \(in some conditions\) if project contains REST extension in ml-config [\#1378](https://github.com/marklogic/marklogic-data-hub/issues/1378)
- Modules location and deployment in DHF400 [\#1362](https://github.com/marklogic/marklogic-data-hub/issues/1362)

**Closed issues:**

- hubinit task should create a "stub" gradle-local.properties [\#1736](https://github.com/marklogic/marklogic-data-hub/issues/1736)
- Require workaround for deploying flexrep for data-hub-FINAL [\#1724](https://github.com/marklogic/marklogic-data-hub/issues/1724)
- if you call your mapping "mapping", it doesn't work \(v4.1.0\) [\#1710](https://github.com/marklogic/marklogic-data-hub/issues/1710)
- If you call your input flow "input", it doesn't work \(v4.1.0\) [\#1709](https://github.com/marklogic/marklogic-data-hub/issues/1709)
- If you call your harmonize flow "harmonize", it doesn't work \(v4.1.0\) [\#1708](https://github.com/marklogic/marklogic-data-hub/issues/1708)
- Adding server namespaces in final-server.json breaks redeployment [\#1631](https://github.com/marklogic/marklogic-data-hub/issues/1631)
- mlLoadSchemas only loads to data-hub-staging-SCHEMAS  [\#1619](https://github.com/marklogic/marklogic-data-hub/issues/1619)
- Tutorial Documentation: Wrong Product Ingest folder? [\#1578](https://github.com/marklogic/marklogic-data-hub/issues/1578)
- \[WORKAROUND\] DHF does not deploy REST extensions [\#1574](https://github.com/marklogic/marklogic-data-hub/issues/1574)
- Support for mlConfigPaths and mlModulePaths properties like ml-gradle has [\#1464](https://github.com/marklogic/marklogic-data-hub/issues/1464)
- Traces not capturing error message or stack [\#1402](https://github.com/marklogic/marklogic-data-hub/issues/1402)

**Merged pull requests:**

- Revert Spring boot version upgrade for QS [\#1748](https://github.com/marklogic/marklogic-data-hub/pull/1748) ([akshaysonvane](https://github.com/akshaysonvane))
- Es alignment - Fix failing tests [\#1747](https://github.com/marklogic/marklogic-data-hub/pull/1747) ([ryanjdew](https://github.com/ryanjdew))
- Setting content db to final db [\#1744](https://github.com/marklogic/marklogic-data-hub/pull/1744) ([srinathgit](https://github.com/srinathgit))
- Revert "Dhfprod 662 qs stuck \(\#1726\)" [\#1743](https://github.com/marklogic/marklogic-data-hub/pull/1743) ([akshaysonvane](https://github.com/akshaysonvane))
- Fix for DHFPROD-590 and DHFPROD-1698 [\#1741](https://github.com/marklogic/marklogic-data-hub/pull/1741) ([srinathgit](https://github.com/srinathgit))
- Updating test for DHFPROD-1581 [\#1740](https://github.com/marklogic/marklogic-data-hub/pull/1740) ([bsrikan](https://github.com/bsrikan))
- Incorporate referenced entity model definitions in same definitions [\#1739](https://github.com/marklogic/marklogic-data-hub/pull/1739) ([ryanjdew](https://github.com/ryanjdew))
- Support for ES models in content creation [\#1738](https://github.com/marklogic/marklogic-data-hub/pull/1738) ([srinathgit](https://github.com/srinathgit))
- fixing \#1736 [\#1737](https://github.com/marklogic/marklogic-data-hub/pull/1737) ([paxtonhare](https://github.com/paxtonhare))
- Move entity management logic from QS to core lib [\#1735](https://github.com/marklogic/marklogic-data-hub/pull/1735) ([akshaysonvane](https://github.com/akshaysonvane))
- Add triggers for entity model TDE generation [\#1734](https://github.com/marklogic/marklogic-data-hub/pull/1734) ([ryanjdew](https://github.com/ryanjdew))
- gradle-dhs.properties for DHS integration tests [\#1731](https://github.com/marklogic/marklogic-data-hub/pull/1731) ([bsrikan](https://github.com/bsrikan))
- add redeploy to stabilize [\#1730](https://github.com/marklogic/marklogic-data-hub/pull/1730) ([ayuwono](https://github.com/ayuwono))
- GH \#1652 If $type is undefined, don't nest [\#1729](https://github.com/marklogic/marklogic-data-hub/pull/1729) ([ryanjdew](https://github.com/ryanjdew))
- Fix for DHFPROD-1161 [\#1728](https://github.com/marklogic/marklogic-data-hub/pull/1728) ([clockworked247](https://github.com/clockworked247))
- Send percentComplete as -1 in case of an error [\#1727](https://github.com/marklogic/marklogic-data-hub/pull/1727) ([akshaysonvane](https://github.com/akshaysonvane))
- Dhfprod 662 qs stuck [\#1726](https://github.com/marklogic/marklogic-data-hub/pull/1726) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1581 fix [\#1725](https://github.com/marklogic/marklogic-data-hub/pull/1725) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-490 - added invalid character check for entity title [\#1723](https://github.com/marklogic/marklogic-data-hub/pull/1723) ([brucean52](https://github.com/brucean52))
-  Passing more than one options in input flows using mlcp [\#1722](https://github.com/marklogic/marklogic-data-hub/pull/1722) ([srinathgit](https://github.com/srinathgit))
- Fix for DHFPROD-1663, 1664, 1665 [\#1719](https://github.com/marklogic/marklogic-data-hub/pull/1719) ([srinathgit](https://github.com/srinathgit))
- DHFPROD-1526 - Beautify trace errors on QuickStart UI [\#1718](https://github.com/marklogic/marklogic-data-hub/pull/1718) ([brucean52](https://github.com/brucean52))
- 1580 Added DHF4 project with test cases for verifying the deployment … [\#1714](https://github.com/marklogic/marklogic-data-hub/pull/1714) ([rjrudin](https://github.com/rjrudin))
- Doc bug fixes [\#1707](https://github.com/marklogic/marklogic-data-hub/pull/1707) ([eltesoro-ml](https://github.com/eltesoro-ml))
- DHFPROD-1658 fix mapping view [\#1706](https://github.com/marklogic/marklogic-data-hub/pull/1706) ([wooldridge](https://github.com/wooldridge))
- Changed to SNAPSHOT version [\#1703](https://github.com/marklogic/marklogic-data-hub/pull/1703) ([akshaysonvane](https://github.com/akshaysonvane))
- DHFPROD-1652 fixed broken links and other tweaks [\#1702](https://github.com/marklogic/marklogic-data-hub/pull/1702) ([eltesoro-ml](https://github.com/eltesoro-ml))
- Bring develop up to date [\#1701](https://github.com/marklogic/marklogic-data-hub/pull/1701) ([aebadirad](https://github.com/aebadirad))
- HubAppDeployer no longer loses functionality in SimpleAppDeployer [\#1700](https://github.com/marklogic/marklogic-data-hub/pull/1700) ([rjrudin](https://github.com/rjrudin))
- MLUI-257: dashboard.component.ts [\#1699](https://github.com/marklogic/marklogic-data-hub/pull/1699) ([brucean52](https://github.com/brucean52))
- Upgrade Spring boot ver for QS [\#1698](https://github.com/marklogic/marklogic-data-hub/pull/1698) ([akshaysonvane](https://github.com/akshaysonvane))
- Integrate mlui-integration branch into develop [\#1696](https://github.com/marklogic/marklogic-data-hub/pull/1696) ([alexsmr](https://github.com/alexsmr))
- MLUI-258: externaldef-dialog.component.ts [\#1685](https://github.com/marklogic/marklogic-data-hub/pull/1685) ([brucean52](https://github.com/brucean52))
- Added DHF4 project with test cases for verifying the deployment [\#1640](https://github.com/marklogic/marklogic-data-hub/pull/1640) ([rjrudin](https://github.com/rjrudin))
- DHS e2e example changes [\#1585](https://github.com/marklogic/marklogic-data-hub/pull/1585) ([bsrikan](https://github.com/bsrikan))


## [v4.1.0](https://github.com/marklogic/marklogic-data-hub/releases/tag/4.1.0) (2018-12-19)

Bug

    [DHFPROD-1193] - #1261 ⁃ "gradle createEntity" does not create an entity descriptor file
    [DHFPROD-1263] - DataHub.runPreInstallCheck() returning incorrect results
    [DHFPROD-1304] - mlDeploySecurity is not deploying protected-paths and query-rolesets
    [DHFPROD-1328] - Able to create duplicate flow (input or harmonize)
    [DHFPROD-1400] - Gradle Tasks using incorrect datahub.isInstalled() check to verify DHF installation
    [DHFPROD-1433] - QuickStart entity editor: too many properties, buttons are hidden
    [DHFPROD-1557] - Memory leak on gradle runFlow
    [DHFPROD-1561] - DataHub installation fails
    [DHFPROD-1576] - ./gradlew build fails with no user provided error
    [DHFPROD-1592] - hubUpdate should work even when the project fails an initialization check
    [DHFPROD-1595] - mlDeploy fails post hubUpdate in 4.1-rc1 DHF version
    [DHFPROD-1601] - Deploy fails when mlModulePermissions does not exist in gradle.properties
    [DHFPROD-1605] - mlDeploy fails when an amp exists under src/main/ml-config
    [DHFPROD-1608] - QuickStart 4.1.0-rc fails to display flows
    [DHFPROD-1615] - Upgrade issues in DHF with versions 4.0.x
    [DHFPROD-1617] - Update documentation for 4.1.0 
    [DHFPROD-1636] - hubGeneratePii task is failing
    [DHFPROD-1637] - Docs: "Independent STAGING and FINAL App Server Stacks Stacks" link redirection error
    [DHFPROD-1640] - Triggers config from hub-internal-config is making post request to data-hub-final-TRIGGERS database
    [DHFPROD-1645] - 4.1.0 'mlUpdateIndexes' command is giving error with in provisioned environment
    [DHFPROD-1646] - Deployment fails with non default hub admin role and user


Story

    [DHFPROD-1338] - Create spring application context and make properties file a singleton configuration
    [DHFPROD-1339] - Rework application architecture to use Spring IoC
    [DHFPROD-1422] - Clarify through the QuickStart UI the origin of the source URI field in the Mapping Screen
    [DHFPROD-1436] - Upgrade to Java 10 and OpenJDK
    [DHFPROD-1518] - Design the ml-gradle solution
    [DHFPROD-1519] - Separation of DHF override code from vanilla ml-gradle tasks
    [DHFPROD-1524] - Stitch together quick-start Spring Context with core .
    [DHFPROD-1554] - Release Notes and Upgrade guidance for 4.1



## [v4.0.3](https://github.com/marklogic/marklogic-data-hub/tree/v4.0.3) (2018-11-19)

Bug

    [DHFPROD-1512] - #1462 ⁃ SSL with mlRedeploy/mlReloadModules doesn't work
    
   

## [v4.0.2](https://github.com/marklogic/marklogic-data-hub/releases/tag/4.0.2) (2018-11-05)

Bug

    [DHFPROD-1095] - #1152 ⁃ Trace content plugin on harmonized data is broken
    [DHFPROD-1246] - 'data-hub-user' able to deploy flows
    [DHFPROD-1306] - HubInit command does not generate mlSecurityUserName and mlSecurityPassword place holders
    [DHFPROD-1401] - Unable to save and update indexes using gradle tasks
    [DHFPROD-978] - Verify fix: #1062 ⁃ Online shopping tutorial repository code missing an element index in Order entity
    [DHFPROD-1307] - hubPreInstallCheck command displays object hashcode
    [DHFPROD-1418] - DHS documentation has incorrect values for 'mUsername' and 'mlManageUSername'
    [DHFPROD-1420] - Bad link to upgrade instructions.
    [DHFPROD-1448] - data-hub-MODULES is hard-coded somewhere
    [DHFPROD-1483] - hubPreInstallCheck returning incorrect result
    [DHFPROD-1495] - every mlcp job from quick start throws an error
    [DHFPROD-1502] - Unable to redeploy hub
    [DHFPROD-1302] - Issues in trace UI rendering in 4.0
 


## [v4.0.1](https://github.com/marklogic/marklogic-data-hub/releases/tag/4.0.1) (2018-10-05)

Bug

    [DHFPROD-653] - #799 ⁃ Tests failing on AWS if host is set to ELB host
    [DHFPROD-760] - #873 ⁃ RFE: Single location for all resource configuration
    [DHFPROD-789] - FlowManager.getFlow() and Mlcp flows failing with ELB
    [DHFPROD-1045] - #1120 ⁃ On Harmonize flow page, the plus sign for Options is not aligned
    [DHFPROD-1126] - #1183 ⁃ Outdated references to dhf.xqy
    [DHFPROD-1175] - gradle mlUndeploy is throwing 401 unauthorized error
    [DHFPROD-1248] - LoadUserModules not loading mappings if force load is set to 'false'
    [DHFPROD-1250] - #1279 ⁃ main.sjs not properly updated during upgrade
    [DHFPROD-1278] - QuickStart uninstall status is delayed
    [DHFPROD-1299] - Installation/Uninstallation fails when App-Services set to ssl/cert-auth
    [DHFPROD-1343] - QuickStart install has 404 not found error message when changing the data-hub modules db name
    [DHFPROD-1346] - Test failures in VPC environment in AWS
    [DHFPROD-1368] - Incompatibility between DHF and DHaaS with respect to usage of 'finalClient'
    [DHFPROD-1374] - Unable to load user modules from gradle
    [DHFPROD-1376] - Unable to create flows with "FlowDeveloper" role
    [DHFPROD-1378] - Unable to getFlow()
    [DHFPROD-1399] - DHS - hubRunFlowTask is failing as final AppServer details are MISSING
    [DHFPROD-1402] - DHS - hubExportJobs and hubDeleteJobs are failing due to missing indexes in Jobs Database

Task

    [DHFPROD-1373] - Unable to load hub modules in DHaaS environment
    [DHFPROD-1375] - Specify permissions for modules in gradle.properties
    [DHFPROD-1380] - Replace java client api static binary to publicly available one

Sub-task

    [DHFPROD-1329] - On upgrade, new databases created should not have default names

Epic

    [DHFPROD-1084] - Upgrade improvements - Doc and e-node changes

Story

    [DHFPROD-1085] - Upgrade to 3.0 overall guidance
    [DHFPROD-1087] - Upgrade instructions
    [DHFPROD-1228] - Integrated Testing for DHaaS in a simulated environment
    [DHFPROD-1229] - Install DHF via lambda/appdeployer task
    [DHFPROD-1234] - Create roles and test DHF with hardened RBAC model for DHaaS
    [DHFPROD-1240] - Release DHaaS-related work as 4.0.1
    [DHFPROD-1251] - Integrated Testing for DHaaS in a 'real' environment
    [DHFPROD-1261] - Document differences in managing a data hub on-prem. vs in DHaaS
    [DHFPROD-1310] - Refactor DHF to use a single modules database (again)
    [DHFPROD-1335] - Deprecate mlLoadBalancerHosts with error checking



## [v4.0.0](https://github.com/marklogic/marklogic-data-hub/releases/tag/v4.0.0) (2018-09-11)

Bugs

    [DHFPROD-859] - #989 ⁃ DHF 3.0 upgrade path not clear
    [DHFPROD-890] - #1009 ⁃ 9.0-5 Upgrade : make sure to update the path of the rewriter on the Trace Server
    [DHFPROD-1100] - #1155 ⁃ Upgrading in Quickstart (with Quickstart.war) doesn't always work
    [DHFPROD-1174] - Running input flow after fresh install from a DHF project doesnt surface all the previously saved maps
    [DHFPROD-1252] - XDMP-NOSUCHDB error on running hubUpdate task to upgrade to 4.0.0
    [DHFPROD-1254] - QuickStart project needs to be initialized although DHF is already installed
    [DHFPROD-1298] - Installation fails with non default staging modules db
    [DHFPROD-1308] - Traces are created after disabling traces
    [DHFPROD-1309] - Incorrect content.sjs generated for input flows when 'requireEs' set to true

    [DHFPROD-434] - #458 ⁃ Document the roles available and what each one does
    [DHFPROD-495] - #673 ⁃ Problem with clipboard button
    [DHFPROD-651] - #796 ⁃ Hub tracing fails (silently) if XQuery plugins return XML
    [DHFPROD-774] - Compatibiilty -- quickstart 3.0 to 3.1
    [DHFPROD-788] - #893 ⁃ accept header ignored by /v1/resources/flow
    [DHFPROD-790] - #894 ⁃ Clearer documentation with respect to the Java prerequisite
    [DHFPROD-791] - gradlew hubInfo task returns garbage
    [DHFPROD-797] - #902 ⁃ xml options in entity-config get saved with JSON content and fail to deploy
    [DHFPROD-844] - #976 ⁃ add mldeploy step
    [DHFPROD-847] - #979 ⁃ list ports in use by dhf
    [DHFPROD-848] - #977 ⁃ explain databases created by dhf project
    [DHFPROD-850] - #980 ⁃ Update documentation for transform renames
    [DHFPROD-872] - #1000 ⁃ XML Processing Instructions break DHF ingest
    [DHFPROD-927] - #1029 ⁃ The total number of jobs is incorrect after running a flow
    [DHFPROD-931] - #1034 ⁃ UI messaging on entity that has no properties on Map
    [DHFPROD-933] - #1036 ⁃ Unable to save map
    [DHFPROD-942] - #1051 ⁃ On mapping, a data that starts with a number then followed by non-number character is interpreted as number
    [DHFPROD-944] - #1052 ⁃ Scaffolding allows white space in the Entity properties.
    [DHFPROD-945] - #1053 ⁃ incorrect label for triggers db setting in QS advanced options.
    [DHFPROD-948] - #1057 ⁃ Trace UI is showing nothing on ingested xml document
    [DHFPROD-958] - #1061 ⁃ DHF is not being installed from quick-start UI
    [DHFPROD-1001] - Unable to set different SSL context for (staging, final)client and (staging, final)manageclient
    [DHFPROD-1008] - TrustManager is not set when creating client objects
    [DHFPROD-1017] - #1104 ⁃ Some icons on QuickStart UI login page are missing if you start QuickStart war
    [DHFPROD-1033] - Differences in <attachments> content in the envelope generated by xqy and sjs
    [DHFPROD-1034] - Unmapped properties shows up as null with mapping generated content.sjs
    [DHFPROD-1045] - #1120 ⁃ On Harmonize flow page, the plus sign for Options is not aligned
    [DHFPROD-1046] - The source xpath returns incorrect result with mapping generated content.sjs
    [DHFPROD-1051] - #1124 ⁃ Map doesn't retain the properties if you change the source (on map revisit)
    [DHFPROD-1061] - #1134 ⁃ Unable to create a harmonize flow that uses the mapping if not redeploying the modules
    [DHFPROD-1062] - #1135 ⁃ After creating and modeling the map, the first mapping property on content.sjs is not indented
    [DHFPROD-1065] - #1138 ⁃ Performance decrease if you have multiple maps
    [DHFPROD-1074] - #1144 ⁃ Able to save an entity with duplicate property names
    [DHFPROD-1082] - #1146 ⁃ Harmonized flow with mapping on second entity is broken
    [DHFPROD-1094] - #1151 ⁃ Cannot edit the source of an already existing map
    [DHFPROD-1096] - #1153 ⁃ HTTP 500: Internal Server Error while retrieving a map with a name
    [DHFPROD-1097] - #1154 ⁃ Overlapped facet counts if it has 4 digits or more
    [DHFPROD-1110] - #1165 ⁃ content.sjs creates incorrect variables for properties having underscore in the entity
    [DHFPROD-1112] - #1166 ⁃ Hub Graphic corrupted / missing
    [DHFPROD-1113] - #1168 ⁃ content.xqy generates extract-instance-X() with empty mapping
    [DHFPROD-1114] - #1170 ⁃ Mapping doesnt allow to save an edited version of a map
    [DHFPROD-1118] - Mapping generates incorrect content
    [DHFPROD-1119] - #1175 ⁃ Click of + button for entity 2 mapping when on a map for entity 1 doesnt bring up the new-map modal
    [DHFPROD-1120] - #1176 ⁃ Able to create maps with duplicate names
    [DHFPROD-1122] - #1179 ⁃ Map created from QuickStart should not be deployed to Modules database until map is saved
    [DHFPROD-1124] - #1180 ⁃ Updating description of a mapping should prompt to Save the map again
    [DHFPROD-1125] - #1181 ⁃ Using an invalid source URI should first check for validity before resetting existing selection/mapping
    [DHFPROD-1127] - #1184 ⁃ Input flow/mlcp failing in QuickStart when any datatype other than string is used
    [DHFPROD-1131] - source xpath generates JS content with syntax error
    [DHFPROD-1151] - #1201 ⁃ Issue when using a collector on a huge amount of URIs
    [DHFPROD-1159] - #1217 ⁃ ResourceNotFound exception if mapping name contains whitespace
    [DHFPROD-1164] - Overflowing mapping value if it's too long
    [DHFPROD-1165] - #1229 ⁃ Tracing database exist on DHF Upgrade from 3.0.0 to 3.1.0


Task

    [DHFPROD-964] - Upgrade testing from DHF-3.0.0 to DHF-3.1.0
    [DHFPROD-225] - Design and implement security model to preempt needs for PII story
    [DHFPROD-338] - Atomic return value as a response header
    [DHFPROD-640] - JSON Schema for API First function declaration
    [DHFPROD-909] - Create E2E test Plan for Flat Model-to-Model mapping
    [DHFPROD-911] - Create test plan for Security policy
    [DHFPROD-924] - Investigate and create POC to create framework to run unit and integration tests for sprint boot layer API's
    [DHFPROD-1056] - Document PII support


Epic

    [DHFPROD-234] - Flat model-to-model mapping
    [DHFPROD-1084] - Upgrade improvements - Doc and e-node changes

Story

    [DHFPROD-1078] - Update tutorial to showcase model-to-model mapping
    [DHFPROD-1085] - Upgrade to 3.0 overall guidance
    [DHFPROD-1087] - Upgrade instructions
    [DHFPROD-1101] - Technical story: Understand the upgrade path
    [DHFPROD-1103] - Documentation for model-to-model mapping
    [DHFPROD-1133] - Execute the DHF Release (4.0)
    [DHFPROD-1168] - Release notes for 4.0
    [DHFPROD-1192] - Return e-node modules to modules db
    [DHFPROD-1194] - Provide modules, schemas and triggers databases for FINAL
    [DHFPROD-254] - Document Error Codes
    [DHFPROD-278] - API Service Developer can generate Java database function
    [DHFPROD-279] - Data Service Developer can support proxy requests in the appserver
    [DHFPROD-307] - Data Architect manipulates the mapping of property-to-property
    [DHFPROD-308] - Data Architect can run flow
    [DHFPROD-311] - API Service Developer can generate simplest Java proxy function
    [DHFPROD-341] - Mapping experience for long lists of attributes
    [DHFPROD-346] - API Service Developer can generate a Java proxy with payloads
    [DHFPROD-350] - API Service Developer can generate a class from a bundle
    [DHFPROD-351] - PII Configuration artifacts get deployed to data hub
    [DHFPROD-583] - Default document permissions (read) for harmonized entities
    [DHFPROD-606] - Default document permissions (update) for harmonized entities
    [DHFPROD-607] - API Service Developer can generate a Java database function with multipart payloads
    [DHFPROD-608] - Build a demo that showcases pii
    [DHFPROD-612] - API Service Developer can map Java datatypes to server datatypes
    [DHFPROD-615] - API Service Developer can call a database function from AWS middle tier
    [DHFPROD-619] - Move base support for generated classes into the Java API
    [DHFPROD-625] - Toggle PII on entity property as part of modeling UI activities
    [DHFPROD-666] - Data Service Developer can opt into efficient but constrained HTTP transport
    [DHFPROD-678] - Determine what is PII
    [DHFPROD-816] - CLONE - Default document permissions (read + write) for harmonized entities
    [DHFPROD-819] - CLONE - Default document permissions (update) for harmonized entities
    [DHFPROD-839] - Security vulnerability in package-lock.json
    [DHFPROD-949] - Ability to change source doc
    [DHFPROD-956] - Execute the code generation from Gradle
    [DHFPROD-1024] - Orient example in tutorial to current model to model mapping scenario (eg all same source doc)




## [v3.0.0](https://github.com/marklogic/marklogic-data-hub/releases/tag/v3.0.0) (2018-05-03)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.4...v3.0.0)

**Implemented enhancements:**

- Update Spring Batch example to version 1.4.0 [\#622](https://github.com/marklogic/marklogic-data-hub/issues/622)
- Update writers to be batched vs individualized - delete/dupe [\#617](https://github.com/marklogic/marklogic-data-hub/issues/617)
- Quickstart data hub job status/error popup needs word wrap [\#582](https://github.com/marklogic/marklogic-data-hub/issues/582)
- Export traces [\#571](https://github.com/marklogic/marklogic-data-hub/issues/571)
- Create gradle command to generate a TDE Template [\#551](https://github.com/marklogic/marklogic-data-hub/issues/551)
- Allow specifying flow options for harmonization flows run from quickstart [\#504](https://github.com/marklogic/marklogic-data-hub/issues/504)
- Migration guidance from 1.0 \(8\) to 2.0 \(9\) [\#373](https://github.com/marklogic/marklogic-data-hub/issues/373)

**Fixed bugs:**

- Loading documents through input flow is failing [\#883](https://github.com/marklogic/marklogic-data-hub/issues/883)
- gradlew quick-start:e2eLaunch could not find or load main class com.marklogic.quickstart.Application [\#877](https://github.com/marklogic/marklogic-data-hub/issues/877)
- Tutorial: version numbers don't match [\#852](https://github.com/marklogic/marklogic-data-hub/issues/852)
- Example in documentation is incorrect [\#845](https://github.com/marklogic/marklogic-data-hub/issues/845)
- README.md link to "Data Hub Framework website" in "Advanced Hub Usage" is broken [\#837](https://github.com/marklogic/marklogic-data-hub/issues/837)
- defaults are missing on hub init tab [\#833](https://github.com/marklogic/marklogic-data-hub/issues/833)
- Getting Started Tutorial: More issues [\#818](https://github.com/marklogic/marklogic-data-hub/issues/818)
- Running input flow produces error "MISSING\_CURRENT\_TRACE" and the documents are not loaded [\#814](https://github.com/marklogic/marklogic-data-hub/issues/814)
- Missing dhf.sjs when creating a new flow \(blocker\) [\#813](https://github.com/marklogic/marklogic-data-hub/issues/813)
- Upgrade npmVersion to 5.6.0 on build.gradle to avoid error on Windows [\#804](https://github.com/marklogic/marklogic-data-hub/issues/804)
- Tutorial link hard coded to old \(2.0.3\) release [\#801](https://github.com/marklogic/marklogic-data-hub/issues/801)
- Reverse DB EndToEndFlowTests fail on AWS [\#800](https://github.com/marklogic/marklogic-data-hub/issues/800)
- quickstart harmonize flow view elides tab labels to meaninglessness [\#798](https://github.com/marklogic/marklogic-data-hub/issues/798)
- QuickStart Browse Data throws XDMP-LEXVAL [\#797](https://github.com/marklogic/marklogic-data-hub/issues/797)
- Documents are not shown under Browse Data STAGING database after running the input flow [\#788](https://github.com/marklogic/marklogic-data-hub/issues/788)
- Remove mimetypes from gradle config [\#780](https://github.com/marklogic/marklogic-data-hub/issues/780)
- Install screen on quickstart is broken, unable to install hub \[blocker\] [\#778](https://github.com/marklogic/marklogic-data-hub/issues/778)
- Run undeploy tasks with configured mlManageUsername [\#766](https://github.com/marklogic/marklogic-data-hub/issues/766)
- Error when running gradlew mlUndeploy [\#762](https://github.com/marklogic/marklogic-data-hub/issues/762)
- MLCPBean doesn't have -ssl option [\#760](https://github.com/marklogic/marklogic-data-hub/issues/760)
- mlDeploy fails when run by an LDAP user with full admin rights [\#759](https://github.com/marklogic/marklogic-data-hub/issues/759)
- QuickStart won't connect to HTTPS-enabled App Services [\#752](https://github.com/marklogic/marklogic-data-hub/issues/752)
- Search results on jobs page is showing the wrong results when searching for "input" jobs [\#746](https://github.com/marklogic/marklogic-data-hub/issues/746)
- Trace view is not displayed after clicking the trace link [\#738](https://github.com/marklogic/marklogic-data-hub/issues/738)
- One entity's indexes configurations clobber all the others' [\#711](https://github.com/marklogic/marklogic-data-hub/issues/711)
- When modeling Order entity, needs to add element range index on "id" property [\#705](https://github.com/marklogic/marklogic-data-hub/issues/705)
- Quickstart tutorial doesn't have $version on content.sjs, but the screenshots have it [\#701](https://github.com/marklogic/marklogic-data-hub/issues/701)
- QuickStart harmonize flow settings not persisted during browser session [\#684](https://github.com/marklogic/marklogic-data-hub/issues/684)
- Primary key is not retained if it's clicked first when adding a property [\#679](https://github.com/marklogic/marklogic-data-hub/issues/679)
- Huge ID lists from a collector fail with FRAGTOOLARGE if Tracing is on [\#658](https://github.com/marklogic/marklogic-data-hub/issues/658)
- Old entity name is still retained on property entities type [\#651](https://github.com/marklogic/marklogic-data-hub/issues/651)
- run-flow rest extension is not setting a default job-id [\#620](https://github.com/marklogic/marklogic-data-hub/issues/620)
- Tutorial - Can not create "Harmonize Orders" flow [\#602](https://github.com/marklogic/marklogic-data-hub/issues/602)
- Collector's disk queue is filling up [\#601](https://github.com/marklogic/marklogic-data-hub/issues/601)
- QuickStart Project Initialize does not recognize change to hostname [\#585](https://github.com/marklogic/marklogic-data-hub/issues/585)
- Object type changed after upgrade to Hub 2.0 so fields are missing or undefined [\#583](https://github.com/marklogic/marklogic-data-hub/issues/583)
- The mlUndeploy task does not completely remove a data hub [\#580](https://github.com/marklogic/marklogic-data-hub/issues/580)
- MLCP failing on INPUT FLOW after upgrade [\#579](https://github.com/marklogic/marklogic-data-hub/issues/579)
- info block for JSON [\#577](https://github.com/marklogic/marklogic-data-hub/issues/577)
- QuickStart - Browse Data does not display content for certain URIs [\#557](https://github.com/marklogic/marklogic-data-hub/issues/557)
- Add Spring-Batch jobRepo configuration to data-hub-JOBS database & app-server? [\#493](https://github.com/marklogic/marklogic-data-hub/issues/493)
- Added Price, but didn't see it in the Product entity [\#408](https://github.com/marklogic/marklogic-data-hub/issues/408)
- A trace is created with an invalid format [\#397](https://github.com/marklogic/marklogic-data-hub/issues/397)
- Hub \(un\)install time on windows is horrible [\#253](https://github.com/marklogic/marklogic-data-hub/issues/253)
- Add --disable-host-check to allow external access [\#773](https://github.com/marklogic/marklogic-data-hub/pull/773) ([wooldridge](https://github.com/wooldridge))

**Closed issues:**

- Some broken links on docs-3.0 DHF Tutorial [\#930](https://github.com/marklogic/marklogic-data-hub/issues/930)
- Data Hub Framework website links still refer to old marklogic-community address [\#899](https://github.com/marklogic/marklogic-data-hub/issues/899)
- Error when harmonising literal in triple [\#878](https://github.com/marklogic/marklogic-data-hub/issues/878)
- One of the links to the data hub framework website on readme.md is broken [\#864](https://github.com/marklogic/marklogic-data-hub/issues/864)
- Tutorial: need a goal [\#854](https://github.com/marklogic/marklogic-data-hub/issues/854)
- Clean up inconsistencies in content/instance in documentation [\#848](https://github.com/marklogic/marklogic-data-hub/issues/848)
- Error when trying to run mlDeploy from online store example on development branch [\#835](https://github.com/marklogic/marklogic-data-hub/issues/835)
- Include verb in example curl command [\#808](https://github.com/marklogic/marklogic-data-hub/issues/808)
- Code edited externally not updating on quickstart editor windows [\#795](https://github.com/marklogic/marklogic-data-hub/issues/795)
- Harmonization fails [\#756](https://github.com/marklogic/marklogic-data-hub/issues/756)
- Missing custom webservices in DHF [\#716](https://github.com/marklogic/marklogic-data-hub/issues/716)
- problem with instance-json-from document when extracting array of string [\#708](https://github.com/marklogic/marklogic-data-hub/issues/708)
- Final content.sjs is out of date in tutorial [\#676](https://github.com/marklogic/marklogic-data-hub/issues/676)
- Add documentation for gradle task to uninstall data-hub [\#670](https://github.com/marklogic/marklogic-data-hub/issues/670)
- Clarify docs: REST resources can be added without being connected to an entity [\#629](https://github.com/marklogic/marklogic-data-hub/issues/629)
- Update Hub ES code to get inline with newer ES features [\#553](https://github.com/marklogic/marklogic-data-hub/issues/553)
- Example: Single-step ingest [\#476](https://github.com/marklogic/marklogic-data-hub/issues/476)
- Invoking harmonize flow via post-commit trigger fails with non-admin user [\#378](https://github.com/marklogic/marklogic-data-hub/issues/378)
- Getting Started tutorial shows a stack trace for step 8, sub-step 6 [\#316](https://github.com/marklogic/marklogic-data-hub/issues/316)
- Refine JavaDocs [\#222](https://github.com/marklogic/marklogic-data-hub/issues/222)
- Epic: MDM support [\#126](https://github.com/marklogic/marklogic-data-hub/issues/126)

**Merged pull requests:**

- 3.x develop fast forward [\#958](https://github.com/marklogic/marklogic-data-hub/pull/958) ([aebadirad](https://github.com/aebadirad))
- Add Javadoc info to docs README [\#956](https://github.com/marklogic/marklogic-data-hub/pull/956) ([wooldridge](https://github.com/wooldridge))
- Add javadocs version 3.0.0 to docs [\#955](https://github.com/marklogic/marklogic-data-hub/pull/955) ([wooldridge](https://github.com/wooldridge))
- Update Java Client API dependency to 4.0.4 [\#954](https://github.com/marklogic/marklogic-data-hub/pull/954) ([grechaw](https://github.com/grechaw))
- Fix old finished example link [\#952](https://github.com/marklogic/marklogic-data-hub/pull/952) ([wooldridge](https://github.com/wooldridge))
- Fix links in Tutorial Wrapping Up [\#951](https://github.com/marklogic/marklogic-data-hub/pull/951) ([wooldridge](https://github.com/wooldridge))
- Fix link to QuickStart .war file in tutorial [\#950](https://github.com/marklogic/marklogic-data-hub/pull/950) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-646 misc 3.x docs fixes [\#949](https://github.com/marklogic/marklogic-data-hub/pull/949) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-646 remove link in setup, no content [\#948](https://github.com/marklogic/marklogic-data-hub/pull/948) ([wooldridge](https://github.com/wooldridge))
- Fix update test develop [\#947](https://github.com/marklogic/marklogic-data-hub/pull/947) ([grechaw](https://github.com/grechaw))
- DHFPROD-663 improve sample-data setup info [\#946](https://github.com/marklogic/marklogic-data-hub/pull/946) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-493, DHFPROD-646 3.x documentation updates [\#945](https://github.com/marklogic/marklogic-data-hub/pull/945) ([wooldridge](https://github.com/wooldridge))
- Updated legal notices [\#944](https://github.com/marklogic/marklogic-data-hub/pull/944) ([grechaw](https://github.com/grechaw))
- QuickStart UI fixes for 2.x-develop [\#942](https://github.com/marklogic/marklogic-data-hub/pull/942) ([wooldridge](https://github.com/wooldridge))
- Develop [\#941](https://github.com/marklogic/marklogic-data-hub/pull/941) ([aebadirad](https://github.com/aebadirad))
- E2e/save index new entity [\#940](https://github.com/marklogic/marklogic-data-hub/pull/940) ([ayuwono](https://github.com/ayuwono))
- DHFPROD-502 fix tutorial, primary key does not add element range index [\#939](https://github.com/marklogic/marklogic-data-hub/pull/939) ([wooldridge](https://github.com/wooldridge))
- First pass on 2.x flow upgrade to 3, and removing unneeded modules [\#938](https://github.com/marklogic/marklogic-data-hub/pull/938) ([aebadirad](https://github.com/aebadirad))
- Updating Issue \#578: Update the deletion message [\#937](https://github.com/marklogic/marklogic-data-hub/pull/937) ([mhuang-ml](https://github.com/mhuang-ml))
- Develop [\#936](https://github.com/marklogic/marklogic-data-hub/pull/936) ([aebadirad](https://github.com/aebadirad))
- DHFPROD-675 add index confirm for save new entity [\#935](https://github.com/marklogic/marklogic-data-hub/pull/935) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-496 crop terminal screenshot in tutorial [\#934](https://github.com/marklogic/marklogic-data-hub/pull/934) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-496 make consistent with current tutorial [\#933](https://github.com/marklogic/marklogic-data-hub/pull/933) ([wooldridge](https://github.com/wooldridge))
- Latest batch of develop approved changes [\#932](https://github.com/marklogic/marklogic-data-hub/pull/932) ([aebadirad](https://github.com/aebadirad))
- Add let variable declarations [\#929](https://github.com/marklogic/marklogic-data-hub/pull/929) ([wooldridge](https://github.com/wooldridge))
- Update README for docs branch [\#928](https://github.com/marklogic/marklogic-data-hub/pull/928) ([wooldridge](https://github.com/wooldridge))
- E2E/bug fixes -- tests for some bug fixes [\#927](https://github.com/marklogic/marklogic-data-hub/pull/927) ([ayuwono](https://github.com/ayuwono))
- DHFPROD-646 3.x documentation, Tutorial [\#926](https://github.com/marklogic/marklogic-data-hub/pull/926) ([wooldridge](https://github.com/wooldridge))
- Updating Issue \#578: Update the deletion message [\#925](https://github.com/marklogic/marklogic-data-hub/pull/925) ([mhuang-ml](https://github.com/mhuang-ml))
- DHFPROD-646 3.x documentation, Understanding [\#924](https://github.com/marklogic/marklogic-data-hub/pull/924) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-646 3.x documentation, Ingest [\#923](https://github.com/marklogic/marklogic-data-hub/pull/923) ([wooldridge](https://github.com/wooldridge))
- Entity box css fix [\#922](https://github.com/marklogic/marklogic-data-hub/pull/922) ([ayuwono](https://github.com/ayuwono))
- Develop [\#921](https://github.com/marklogic/marklogic-data-hub/pull/921) ([aebadirad](https://github.com/aebadirad))
- Develop update [\#920](https://github.com/marklogic/marklogic-data-hub/pull/920) ([aebadirad](https://github.com/aebadirad))
- Updating Issue \#578: Update the deletion message [\#919](https://github.com/marklogic/marklogic-data-hub/pull/919) ([mhuang-ml](https://github.com/mhuang-ml))
- DHFPROD-664 adjust offset, size of new entities in UI [\#918](https://github.com/marklogic/marklogic-data-hub/pull/918) ([wooldridge](https://github.com/wooldridge))
- Fix for Issue \#578 [\#917](https://github.com/marklogic/marklogic-data-hub/pull/917) ([clockworked247](https://github.com/clockworked247))
- Rework of fix for issue \#557 where URI in request to /doc API [\#916](https://github.com/marklogic/marklogic-data-hub/pull/916) ([clockworked247](https://github.com/clockworked247))
- Rework of fix for issue \#557 where URI in request to /doc API [\#915](https://github.com/marklogic/marklogic-data-hub/pull/915) ([clockworked247](https://github.com/clockworked247))
- Fixes \#582 - should be reviewed for UX before merging. [\#914](https://github.com/marklogic/marklogic-data-hub/pull/914) ([clockworked247](https://github.com/clockworked247))
- Fix tab bar layout issue \#798 [\#913](https://github.com/marklogic/marklogic-data-hub/pull/913) ([clockworked247](https://github.com/clockworked247))
- DHFPROD-730 update “content” to “instance” in docs [\#912](https://github.com/marklogic/marklogic-data-hub/pull/912) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-496 update tutorial documentation for 3.x [\#911](https://github.com/marklogic/marklogic-data-hub/pull/911) ([wooldridge](https://github.com/wooldridge))
- Fix tab bar layout issue \#798 [\#909](https://github.com/marklogic/marklogic-data-hub/pull/909) ([clockworked247](https://github.com/clockworked247))
- Fixing Issue \#440: Adding example w/ gradle props [\#908](https://github.com/marklogic/marklogic-data-hub/pull/908) ([mhuang-ml](https://github.com/mhuang-ml))
- Fixing Issue \#440: Adding example w/ gradle props [\#907](https://github.com/marklogic/marklogic-data-hub/pull/907) ([mhuang-ml](https://github.com/mhuang-ml))
- Data hub job status/error popup word wrap change [\#906](https://github.com/marklogic/marklogic-data-hub/pull/906) ([clockworked247](https://github.com/clockworked247))
- Update 3.x from head [\#905](https://github.com/marklogic/marklogic-data-hub/pull/905) ([aebadirad](https://github.com/aebadirad))
- Updating the docs for the repo move [\#904](https://github.com/marklogic/marklogic-data-hub/pull/904) ([aebadirad](https://github.com/aebadirad))
- Update urls for the repository move [\#903](https://github.com/marklogic/marklogic-data-hub/pull/903) ([aebadirad](https://github.com/aebadirad))
- DHFPROD-497 fix property index selection [\#900](https://github.com/marklogic/marklogic-data-hub/pull/900) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-496 fix QuickStart naming in app [\#898](https://github.com/marklogic/marklogic-data-hub/pull/898) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-496 add let variable declarations [\#896](https://github.com/marklogic/marklogic-data-hub/pull/896) ([wooldridge](https://github.com/wooldridge))
- Update README.md [\#891](https://github.com/marklogic/marklogic-data-hub/pull/891) ([aebadirad](https://github.com/aebadirad))
- Fixing Issue \#578: Adding deletion dialog [\#889](https://github.com/marklogic/marklogic-data-hub/pull/889) ([mhuang-ml](https://github.com/mhuang-ml))
- Ignore mlcp test.  False failures occur and the test is redundant [\#885](https://github.com/marklogic/marklogic-data-hub/pull/885) ([grechaw](https://github.com/grechaw))
- Issue \#883 quickstart cannnot load delimited text [\#884](https://github.com/marklogic/marklogic-data-hub/pull/884) ([grechaw](https://github.com/grechaw))
- DHFPROD-645 add -X PUT to curl command [\#881](https://github.com/marklogic/marklogic-data-hub/pull/881) ([wooldridge](https://github.com/wooldridge))
- DHFPROD-731 display install tree as dynamic text [\#880](https://github.com/marklogic/marklogic-data-hub/pull/880) ([wooldridge](https://github.com/wooldridge))
- Develop [\#879](https://github.com/marklogic/marklogic-data-hub/pull/879) ([aebadirad](https://github.com/aebadirad))
- Dhfprod 602 issue780 mimetypes [\#876](https://github.com/marklogic/marklogic-data-hub/pull/876) ([grechaw](https://github.com/grechaw))
- DHFPROD-466 Improving tests for quickstart host config [\#875](https://github.com/marklogic/marklogic-data-hub/pull/875) ([grechaw](https://github.com/grechaw))
- updating  quick-start test task to remove dependency on gui tests [\#867](https://github.com/marklogic/marklogic-data-hub/pull/867) ([kkanthet](https://github.com/kkanthet))
- Develop fast forward the 3.x branch [\#859](https://github.com/marklogic/marklogic-data-hub/pull/859) ([aebadirad](https://github.com/aebadirad))
- Last known good [\#858](https://github.com/marklogic/marklogic-data-hub/pull/858) ([grechaw](https://github.com/grechaw))
- Bugfixes, issues with truncation and mime types removal. [\#851](https://github.com/marklogic/marklogic-data-hub/pull/851) ([grechaw](https://github.com/grechaw))
- Remove mimetypes from deployed configuration \#780 [\#850](https://github.com/marklogic/marklogic-data-hub/pull/850) ([grechaw](https://github.com/grechaw))
- 3.0.0 versioning update [\#847](https://github.com/marklogic/marklogic-data-hub/pull/847) ([aebadirad](https://github.com/aebadirad))
- Develop [\#846](https://github.com/marklogic/marklogic-data-hub/pull/846) ([aebadirad](https://github.com/aebadirad))
- Feature/dhfprod 522 java doc update [\#844](https://github.com/marklogic/marklogic-data-hub/pull/844) ([aebadirad](https://github.com/aebadirad))
- Update MarkLogic server version in readme [\#843](https://github.com/marklogic/marklogic-data-hub/pull/843) ([aebadirad](https://github.com/aebadirad))
- Truncate the response being logged to something reasonable [\#842](https://github.com/marklogic/marklogic-data-hub/pull/842) ([aebadirad](https://github.com/aebadirad))
- Issue \#557 fix [\#841](https://github.com/marklogic/marklogic-data-hub/pull/841) ([clockworked247](https://github.com/clockworked247))
- DHFPROD-263 - addition of license and notice files [\#839](https://github.com/marklogic/marklogic-data-hub/pull/839) ([aebadirad](https://github.com/aebadirad))
- Refactor of unit tests to make DHFPROD-630 actionable [\#838](https://github.com/marklogic/marklogic-data-hub/pull/838) ([grechaw](https://github.com/grechaw))
- fixing issue \#833 [\#834](https://github.com/marklogic/marklogic-data-hub/pull/834) ([paxtonhare](https://github.com/paxtonhare))
- fixing bad writer.sjs paths [\#832](https://github.com/marklogic/marklogic-data-hub/pull/832) ([paxtonhare](https://github.com/paxtonhare))
- More harmonize flow validation [\#829](https://github.com/marklogic/marklogic-data-hub/pull/829) ([ayuwono](https://github.com/ayuwono))
- Fix for DHFPROD-412, other failing tests [\#828](https://github.com/marklogic/marklogic-data-hub/pull/828) ([srinathgit](https://github.com/srinathgit))
- Bugfix/dhfprod 660 \#814 running input flow produces [\#816](https://github.com/marklogic/marklogic-data-hub/pull/816) ([aebadirad](https://github.com/aebadirad))
- fixes \#788 - db string comparison when setting query manager [\#812](https://github.com/marklogic/marklogic-data-hub/pull/812) ([wooldridge](https://github.com/wooldridge))
- Fixing hard-coding of admin/admin in project setup [\#811](https://github.com/marklogic/marklogic-data-hub/pull/811) ([grechaw](https://github.com/grechaw))
- Upgrade to Angular CLI latest [\#805](https://github.com/marklogic/marklogic-data-hub/pull/805) ([aebadirad](https://github.com/aebadirad))
- Feature/java doc updates [\#803](https://github.com/marklogic/marklogic-data-hub/pull/803) ([aebadirad](https://github.com/aebadirad))
- Adding test for input flow using DMSDK [\#802](https://github.com/marklogic/marklogic-data-hub/pull/802) ([srinathgit](https://github.com/srinathgit))
- Feature/sjs perf [\#789](https://github.com/marklogic/marklogic-data-hub/pull/789) ([paxtonhare](https://github.com/paxtonhare))
- Update README.md [\#787](https://github.com/marklogic/marklogic-data-hub/pull/787) ([popzip](https://github.com/popzip))
- Add telemetetry call via eval + setup test for it [\#786](https://github.com/marklogic/marklogic-data-hub/pull/786) ([aebadirad](https://github.com/aebadirad))
- Cert auth and simple SSL tests [\#785](https://github.com/marklogic/marklogic-data-hub/pull/785) ([srinathgit](https://github.com/srinathgit))
- Fix for \#778, return back precheck json string instead of directly re… [\#779](https://github.com/marklogic/marklogic-data-hub/pull/779) ([aebadirad](https://github.com/aebadirad))
- E2E - more traces tests [\#776](https://github.com/marklogic/marklogic-data-hub/pull/776) ([ayuwono](https://github.com/ayuwono))
- Add exposed SSL settings [\#772](https://github.com/marklogic/marklogic-data-hub/pull/772) ([aebadirad](https://github.com/aebadirad))
- adding notes about quickstart not being supported [\#768](https://github.com/marklogic/marklogic-data-hub/pull/768) ([dmcassel](https://github.com/dmcassel))
- adding support document [\#767](https://github.com/marklogic/marklogic-data-hub/pull/767) ([dmcassel](https://github.com/dmcassel))
- E2E tests stabilization and traces tests  [\#765](https://github.com/marklogic/marklogic-data-hub/pull/765) ([ayuwono](https://github.com/ayuwono))
- Feature/3.x refactor [\#764](https://github.com/marklogic/marklogic-data-hub/pull/764) ([aebadirad](https://github.com/aebadirad))
- Refactor install info [\#763](https://github.com/marklogic/marklogic-data-hub/pull/763) ([dmcassel](https://github.com/dmcassel))
- \#571 updating docs for Export Traces [\#761](https://github.com/marklogic/marklogic-data-hub/pull/761) ([dmcassel](https://github.com/dmcassel))
- fixes for trace-ui [\#755](https://github.com/marklogic/marklogic-data-hub/pull/755) ([dmcassel](https://github.com/dmcassel))
- E2E tests on jobs page [\#751](https://github.com/marklogic/marklogic-data-hub/pull/751) ([ayuwono](https://github.com/ayuwono))
- making it a bit more clear [\#750](https://github.com/marklogic/marklogic-data-hub/pull/750) ([paxtonhare](https://github.com/paxtonhare))
- fixing tracing stuff [\#749](https://github.com/marklogic/marklogic-data-hub/pull/749) ([paxtonhare](https://github.com/paxtonhare))
- cleaning up things I noticed while working on docs [\#748](https://github.com/marklogic/marklogic-data-hub/pull/748) ([dmcassel](https://github.com/dmcassel))
- \#738 allowing for trace URIs with extensions [\#745](https://github.com/marklogic/marklogic-data-hub/pull/745) ([dmcassel](https://github.com/dmcassel))
- fixing \#711 [\#743](https://github.com/marklogic/marklogic-data-hub/pull/743) ([paxtonhare](https://github.com/paxtonhare))
- adding Windows instructions [\#742](https://github.com/marklogic/marklogic-data-hub/pull/742) ([dmcassel](https://github.com/dmcassel))
- fixing \#701 [\#741](https://github.com/marklogic/marklogic-data-hub/pull/741) ([paxtonhare](https://github.com/paxtonhare))
- fixing \#620 [\#740](https://github.com/marklogic/marklogic-data-hub/pull/740) ([paxtonhare](https://github.com/paxtonhare))
- E2E tests on run harmonize with flow options [\#737](https://github.com/marklogic/marklogic-data-hub/pull/737) ([ayuwono](https://github.com/ayuwono))
- \#591 - Show 2.0 features for server versions \>= 9 [\#646](https://github.com/marklogic/marklogic-data-hub/pull/646) ([wooldridge](https://github.com/wooldridge))
- \#622 - update to MarkLogic Spring Batch 1.7.0 [\#625](https://github.com/marklogic/marklogic-data-hub/pull/625) ([sastafford](https://github.com/sastafford))

## [v2.0.4](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.4) (2018-02-13)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/2.0.3...v2.0.4)

**Implemented enhancements:**

- Need ability to specify cluster hostnames in configuration, override automatic host detection [\#662](https://github.com/marklogic/marklogic-data-hub/issues/662)
- Allow me to set custom SSL Context and Hostname verifiers  [\#647](https://github.com/marklogic/marklogic-data-hub/issues/647)
- Stream uris list [\#633](https://github.com/marklogic/marklogic-data-hub/issues/633)

**Fixed bugs:**

- Collector throws null pointer exception when there is nothing to process [\#735](https://github.com/marklogic/marklogic-data-hub/issues/735)
- SSL not working with collector [\#734](https://github.com/marklogic/marklogic-data-hub/issues/734)
- Browse Data Entities Only Error [\#726](https://github.com/marklogic/marklogic-data-hub/issues/726)
- Setting up QuickStart UI takes me to the update screen, then vicious cycle [\#698](https://github.com/marklogic/marklogic-data-hub/issues/698)
- Performance example gradle hubinit task throws a directory error on windows [\#674](https://github.com/marklogic/marklogic-data-hub/issues/674)
- deleting an entity property causes quickstart to forget the existing primary key/range index/required field settings [\#616](https://github.com/marklogic/marklogic-data-hub/issues/616)
- DataMovementServices is holdover from DHF 1.0 [\#613](https://github.com/marklogic/marklogic-data-hub/issues/613)
- Quickstart runs in 2.0 mode only for version 9, not \> 9.x [\#591](https://github.com/marklogic/marklogic-data-hub/issues/591)

**Closed issues:**

- Put min ML version in docs and error message [\#229](https://github.com/marklogic/marklogic-data-hub/issues/229)
- publish javadocs to a website [\#212](https://github.com/marklogic/marklogic-data-hub/issues/212)

**Merged pull requests:**

- 203 fixes [\#736](https://github.com/marklogic/marklogic-data-hub/pull/736) ([paxtonhare](https://github.com/paxtonhare))
- Export jobs ui [\#733](https://github.com/marklogic/marklogic-data-hub/pull/733) ([dmcassel](https://github.com/dmcassel))
- updating CONTRIBUTING for e-node changes [\#732](https://github.com/marklogic/marklogic-data-hub/pull/732) ([paxtonhare](https://github.com/paxtonhare))
- Copyrights [\#731](https://github.com/marklogic/marklogic-data-hub/pull/731) ([grechaw](https://github.com/grechaw))
- Center the actions icons, narrow the space between them [\#730](https://github.com/marklogic/marklogic-data-hub/pull/730) ([wooldridge](https://github.com/wooldridge))
- updating the performance example to run all combos of xqy,sjs,xml,json [\#729](https://github.com/marklogic/marklogic-data-hub/pull/729) ([paxtonhare](https://github.com/paxtonhare))
- DHFPROD-274 put sample data and model into an example project. [\#728](https://github.com/marklogic/marklogic-data-hub/pull/728) ([grechaw](https://github.com/grechaw))
- Feature/e node baby [\#727](https://github.com/marklogic/marklogic-data-hub/pull/727) ([paxtonhare](https://github.com/paxtonhare))
- React to changes in the harmonize flow options on blur [\#723](https://github.com/marklogic/marklogic-data-hub/pull/723) ([wooldridge](https://github.com/wooldridge))
- reversing the order of the javadoc links [\#722](https://github.com/marklogic/marklogic-data-hub/pull/722) ([paxtonhare](https://github.com/paxtonhare))
- Tests for E2E/flow options  [\#720](https://github.com/marklogic/marklogic-data-hub/pull/720) ([ayuwono](https://github.com/ayuwono))
- Update for 2.0.3 javadocs and update version [\#719](https://github.com/marklogic/marklogic-data-hub/pull/719) ([aebadirad](https://github.com/aebadirad))
- Export jobs [\#718](https://github.com/marklogic/marklogic-data-hub/pull/718) ([dmcassel](https://github.com/dmcassel))
- Feature/617 write batching [\#717](https://github.com/marklogic/marklogic-data-hub/pull/717) ([paxtonhare](https://github.com/paxtonhare))
- Test on other hosts [\#715](https://github.com/marklogic/marklogic-data-hub/pull/715) ([grechaw](https://github.com/grechaw))
- Allow key-value options to be passed in for harmonization flows in UI [\#713](https://github.com/marklogic/marklogic-data-hub/pull/713) ([wooldridge](https://github.com/wooldridge))
- Place ignore amps on several evals within code to prevent priviledge … [\#712](https://github.com/marklogic/marklogic-data-hub/pull/712) ([aebadirad](https://github.com/aebadirad))
- Update harmonize flow options screenshots [\#710](https://github.com/marklogic/marklogic-data-hub/pull/710) ([wooldridge](https://github.com/wooldridge))
- additional tests on login, advanced settings, and entities page [\#709](https://github.com/marklogic/marklogic-data-hub/pull/709) ([ayuwono](https://github.com/ayuwono))
- Release 2.0.3 back to develop [\#707](https://github.com/marklogic/marklogic-data-hub/pull/707) ([aebadirad](https://github.com/aebadirad))
- Fixing Issue \#476: creating a single step example [\#697](https://github.com/marklogic/marklogic-data-hub/pull/697) ([mhuang-ml](https://github.com/mhuang-ml))
- \#551 Create gradle command to generate a TDE Template [\#685](https://github.com/marklogic/marklogic-data-hub/pull/685) ([derms](https://github.com/derms))
- 2.0.3 documentation & ml8 deprecation update [\#681](https://github.com/marklogic/marklogic-data-hub/pull/681) ([aebadirad](https://github.com/aebadirad))

## [2.0.3](https://github.com/marklogic/marklogic-data-hub/tree/2.0.3) (2018-01-30)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.3...2.0.3)

## [v2.0.3](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.3) (2018-01-30)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.2...v2.0.3)

**Implemented enhancements:**

- Deprecate ML8 support [\#618](https://github.com/marklogic/marklogic-data-hub/issues/618)
- MLCP options: Add ability to select individual files [\#413](https://github.com/marklogic/marklogic-data-hub/issues/413)
- Long collection names wrap \(ugly\) [\#409](https://github.com/marklogic/marklogic-data-hub/issues/409)

**Fixed bugs:**

- Dollar \($\) sign on title and version on final document [\#704](https://github.com/marklogic/marklogic-data-hub/issues/704)
- Quickstart doesn't have "Delimited Text Options" anymore, the documentation and tutorial should be changed [\#683](https://github.com/marklogic/marklogic-data-hub/issues/683)
- Unable to load data on Input Flows [\#682](https://github.com/marklogic/marklogic-data-hub/issues/682)
- double parent XML elements created when serializing complex type  [\#619](https://github.com/marklogic/marklogic-data-hub/issues/619)
- setting sourceDB in custom task extending RunFlowTaks in v2.0.2 fails [\#608](https://github.com/marklogic/marklogic-data-hub/issues/608)
- Fixes to closing input stream as recommended @paxtonhare also clean u… [\#700](https://github.com/marklogic/marklogic-data-hub/pull/700) ([aebadirad](https://github.com/aebadirad))
- Fixed \#616 [\#627](https://github.com/marklogic/marklogic-data-hub/pull/627) ([aebadirad](https://github.com/aebadirad))

**Closed issues:**

- Having issue in ingesting data via MLCP, with transform\_module  [\#667](https://github.com/marklogic/marklogic-data-hub/issues/667)
- No job document after running input flow thru MLCP [\#665](https://github.com/marklogic/marklogic-data-hub/issues/665)
- Unable to create Harmonize Flow [\#637](https://github.com/marklogic/marklogic-data-hub/issues/637)
- Error on Harmonize batch on a F5 LB [\#632](https://github.com/marklogic/marklogic-data-hub/issues/632)
- dhf.makeEnvelope does not include $version and $type [\#626](https://github.com/marklogic/marklogic-data-hub/issues/626)
- gradle tasks broken in 2.0.1 [\#599](https://github.com/marklogic/marklogic-data-hub/issues/599)

**Merged pull requests:**

- fixing borked tests [\#706](https://github.com/marklogic/marklogic-data-hub/pull/706) ([paxtonhare](https://github.com/paxtonhare))
- fixing failing test [\#703](https://github.com/marklogic/marklogic-data-hub/pull/703) ([paxtonhare](https://github.com/paxtonhare))
- fixing $version and $title [\#702](https://github.com/marklogic/marklogic-data-hub/pull/702) ([paxtonhare](https://github.com/paxtonhare))
- fixing \#698 [\#699](https://github.com/marklogic/marklogic-data-hub/pull/699) ([paxtonhare](https://github.com/paxtonhare))
- Addressing a change to fix double-quotes being submitted through spri… [\#696](https://github.com/marklogic/marklogic-data-hub/pull/696) ([aebadirad](https://github.com/aebadirad))
- Feature/fix for pr \#649 [\#695](https://github.com/marklogic/marklogic-data-hub/pull/695) ([aebadirad](https://github.com/aebadirad))
- Reverting the pull request for flow options for now [\#693](https://github.com/marklogic/marklogic-data-hub/pull/693) ([aebadirad](https://github.com/aebadirad))
- Simple fix for \#674 for windows to be able to create the directory fo… [\#692](https://github.com/marklogic/marklogic-data-hub/pull/692) ([aebadirad](https://github.com/aebadirad))
- Feature/ssl fixup [\#690](https://github.com/marklogic/marklogic-data-hub/pull/690) ([paxtonhare](https://github.com/paxtonhare))
- Feature/\#229   ml8 deprecation [\#687](https://github.com/marklogic/marklogic-data-hub/pull/687) ([aebadirad](https://github.com/aebadirad))
- Return jobTicket that was previously created with new method to provi… [\#686](https://github.com/marklogic/marklogic-data-hub/pull/686) ([aebadirad](https://github.com/aebadirad))
- removed older versions of MarkLogic [\#678](https://github.com/marklogic/marklogic-data-hub/pull/678) ([dmcassel](https://github.com/dmcassel))
- Feature/harmonization options [\#677](https://github.com/marklogic/marklogic-data-hub/pull/677) ([dmcassel](https://github.com/dmcassel))
- \#673 disable the clipboard button for now; real fix later [\#675](https://github.com/marklogic/marklogic-data-hub/pull/675) ([dmcassel](https://github.com/dmcassel))
- Feature/add whitelist [\#672](https://github.com/marklogic/marklogic-data-hub/pull/672) ([paxtonhare](https://github.com/paxtonhare))
- Fixing Issue \#409: add dynamic sizing to facets [\#669](https://github.com/marklogic/marklogic-data-hub/pull/669) ([mhuang-ml](https://github.com/mhuang-ml))
- Feature/ml8 deprecation [\#659](https://github.com/marklogic/marklogic-data-hub/pull/659) ([aebadirad](https://github.com/aebadirad))
- Added resources needed for the tests I checked in [\#657](https://github.com/marklogic/marklogic-data-hub/pull/657) ([dmcassel](https://github.com/dmcassel))
- Handle a null "range-path-index" value [\#656](https://github.com/marklogic/marklogic-data-hub/pull/656) ([wooldridge](https://github.com/wooldridge))
- \#504 send options along with harmonization flows [\#654](https://github.com/marklogic/marklogic-data-hub/pull/654) ([dmcassel](https://github.com/dmcassel))
- fixing tests [\#652](https://github.com/marklogic/marklogic-data-hub/pull/652) ([paxtonhare](https://github.com/paxtonhare))
- fixing busted test for streaming uris [\#650](https://github.com/marklogic/marklogic-data-hub/pull/650) ([paxtonhare](https://github.com/paxtonhare))
- Issue 575 [\#649](https://github.com/marklogic/marklogic-data-hub/pull/649) ([RobertSzkutak](https://github.com/RobertSzkutak))
- fixed \#633 [\#648](https://github.com/marklogic/marklogic-data-hub/pull/648) ([paxtonhare](https://github.com/paxtonhare))
- Issue 503 [\#645](https://github.com/marklogic/marklogic-data-hub/pull/645) ([RobertSzkutak](https://github.com/RobertSzkutak))
- Updates to the trace-ui as well to mirror ng client & material 2 upgr… [\#644](https://github.com/marklogic/marklogic-data-hub/pull/644) ([aebadirad](https://github.com/aebadirad))
- Feature/fix for \#608 custom source db [\#641](https://github.com/marklogic/marklogic-data-hub/pull/641) ([aebadirad](https://github.com/aebadirad))
- Range indexes must be properties. [\#639](https://github.com/marklogic/marklogic-data-hub/pull/639) ([dmcassel](https://github.com/dmcassel))
- \#629 Clarifying directory structure [\#638](https://github.com/marklogic/marklogic-data-hub/pull/638) ([dmcassel](https://github.com/dmcassel))
- \#631 - moving to ml-gradle 3.3.0 [\#636](https://github.com/marklogic/marklogic-data-hub/pull/636) ([aebadirad](https://github.com/aebadirad))
- Feature/ng cli upgrade [\#635](https://github.com/marklogic/marklogic-data-hub/pull/635) ([aebadirad](https://github.com/aebadirad))
- Feature/fix for \#608 custom source db [\#634](https://github.com/marklogic/marklogic-data-hub/pull/634) ([aebadirad](https://github.com/aebadirad))
- updating ml-gradle version [\#631](https://github.com/marklogic/marklogic-data-hub/pull/631) ([paxtonhare](https://github.com/paxtonhare))
- adding list of dependencies [\#630](https://github.com/marklogic/marklogic-data-hub/pull/630) ([dmcassel](https://github.com/dmcassel))
- Feature/update examples [\#624](https://github.com/marklogic/marklogic-data-hub/pull/624) ([dmcassel](https://github.com/dmcassel))
- \#580 this turned out to be a configuration inconsistency [\#610](https://github.com/marklogic/marklogic-data-hub/pull/610) ([dmcassel](https://github.com/dmcassel))
- Revert "Feature/delete hub" [\#609](https://github.com/marklogic/marklogic-data-hub/pull/609) ([dmcassel](https://github.com/dmcassel))
- fixing bad link [\#607](https://github.com/marklogic/marklogic-data-hub/pull/607) ([paxtonhare](https://github.com/paxtonhare))
- updating docs based on feedback [\#606](https://github.com/marklogic/marklogic-data-hub/pull/606) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#212 [\#605](https://github.com/marklogic/marklogic-data-hub/pull/605) ([paxtonhare](https://github.com/paxtonhare))
- added 2.0.2 docs to the docs site [\#604](https://github.com/marklogic/marklogic-data-hub/pull/604) ([paxtonhare](https://github.com/paxtonhare))
- Feature/delete hub [\#603](https://github.com/marklogic/marklogic-data-hub/pull/603) ([dmcassel](https://github.com/dmcassel))
- updated dhf version [\#600](https://github.com/marklogic/marklogic-data-hub/pull/600) ([paxtonhare](https://github.com/paxtonhare))
- updating support info in LICENSE and README [\#597](https://github.com/marklogic/marklogic-data-hub/pull/597) ([paxtonhare](https://github.com/paxtonhare))
- \#553 [\#595](https://github.com/marklogic/marklogic-data-hub/pull/595) ([paxtonhare](https://github.com/paxtonhare))

## [v2.0.2](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.2) (2017-12-04)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/2.0.1...v2.0.2)

**Implemented enhancements:**

- Update hubCreateEntity task to use ES too [\#547](https://github.com/marklogic/marklogic-data-hub/issues/547)
- Delete old jobs [\#534](https://github.com/marklogic/marklogic-data-hub/issues/534)

**Fixed bugs:**

- Main is executed in staging db even when setting -PsourceDB=Final  [\#565](https://github.com/marklogic/marklogic-data-hub/issues/565)
- Blank harmonization page [\#558](https://github.com/marklogic/marklogic-data-hub/issues/558)

**Closed issues:**

- Add e2e tests for Quickstart [\#555](https://github.com/marklogic/marklogic-data-hub/issues/555)

**Merged pull requests:**

- Feature/bug 558 [\#598](https://github.com/marklogic/marklogic-data-hub/pull/598) ([dmcassel](https://github.com/dmcassel))
- fixed \#565 [\#596](https://github.com/marklogic/marklogic-data-hub/pull/596) ([paxtonhare](https://github.com/paxtonhare))
- adding the userOrg property [\#586](https://github.com/marklogic/marklogic-data-hub/pull/586) ([dmcassel](https://github.com/dmcassel))
- fixed \#547 [\#568](https://github.com/marklogic/marklogic-data-hub/pull/568) ([paxtonhare](https://github.com/paxtonhare))
- Feature/delete old jobs [\#566](https://github.com/marklogic/marklogic-data-hub/pull/566) ([dmcassel](https://github.com/dmcassel))

## [2.0.1](https://github.com/marklogic/marklogic-data-hub/tree/2.0.1) (2017-11-20)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.1...2.0.1)

**Implemented enhancements:**

- Browse Data: Reset search when changing databases [\#535](https://github.com/marklogic/marklogic-data-hub/issues/535)

**Fixed bugs:**

- Harmonization code generation fails for a relationships where entities hold mutual references [\#544](https://github.com/marklogic/marklogic-data-hub/issues/544)
- Out of memory when flow has too many errors [\#543](https://github.com/marklogic/marklogic-data-hub/issues/543)
- admin role required for quick start login [\#542](https://github.com/marklogic/marklogic-data-hub/issues/542)
- mlWatch broken for deploying REST extensions  [\#538](https://github.com/marklogic/marklogic-data-hub/issues/538)
- Options not deployed for Final [\#529](https://github.com/marklogic/marklogic-data-hub/issues/529)

**Closed issues:**

- Add README.md at top of examples folder [\#549](https://github.com/marklogic/marklogic-data-hub/issues/549)
- Quickstart build fails [\#541](https://github.com/marklogic/marklogic-data-hub/issues/541)
- hubPreinstallCheck, AdminConfig ignores SSL setting [\#539](https://github.com/marklogic/marklogic-data-hub/issues/539)
- Enhance command line to build entity indexes via entity JSON descriptors [\#526](https://github.com/marklogic/marklogic-data-hub/issues/526)

## [v2.0.1](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.1) (2017-11-20)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0...v2.0.1)

**Implemented enhancements:**

- Harmonize Writer could benefit from more context like $type [\#564](https://github.com/marklogic/marklogic-data-hub/issues/564)
- Update 2.x version checker to omit pre-release version [\#485](https://github.com/marklogic/marklogic-data-hub/issues/485)

**Fixed bugs:**

- Error running sample product-catalog example [\#560](https://github.com/marklogic/marklogic-data-hub/issues/560)
- Entity definition partially written, everything hosed [\#435](https://github.com/marklogic/marklogic-data-hub/issues/435)

**Closed issues:**

- REST search options deployed to wrong location in modules db [\#567](https://github.com/marklogic/marklogic-data-hub/issues/567)
- Getting MISSING\_FLOW error when invoking from DMSDK [\#552](https://github.com/marklogic/marklogic-data-hub/issues/552)
- Add support for mlcp -input\_file\_pattern [\#550](https://github.com/marklogic/marklogic-data-hub/issues/550)
- Browse Data: not obvious that I needed to click Search [\#530](https://github.com/marklogic/marklogic-data-hub/issues/530)
- Add detailed documentation on traces [\#527](https://github.com/marklogic/marklogic-data-hub/issues/527)
- incorrect scaffolding [\#525](https://github.com/marklogic/marklogic-data-hub/issues/525)
- Issue upgrade from rc1 to rc2 [\#511](https://github.com/marklogic/marklogic-data-hub/issues/511)
- Create Performance Sample [\#492](https://github.com/marklogic/marklogic-data-hub/issues/492)
- Prevent install if ports are in use [\#477](https://github.com/marklogic/marklogic-data-hub/issues/477)
- MLCP fails if no "jobId" parameter specified even with trace off [\#426](https://github.com/marklogic/marklogic-data-hub/issues/426)
- Test deploy against ssl enabled server [\#417](https://github.com/marklogic/marklogic-data-hub/issues/417)
- Epic - error handling [\#289](https://github.com/marklogic/marklogic-data-hub/issues/289)

**Merged pull requests:**

- Issue413 [\#559](https://github.com/marklogic/marklogic-data-hub/pull/559) ([tcfenstermaker](https://github.com/tcfenstermaker))
- adds performance sample [\#556](https://github.com/marklogic/marklogic-data-hub/pull/556) ([joemfb](https://github.com/joemfb))

## [v2.0.0](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0) (2017-10-02)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0-rc.2...v2.0.0)

**Fixed bugs:**

- mlWatch is deploying Flow XMLs on every iteration [\#522](https://github.com/marklogic/marklogic-data-hub/issues/522)
- Can't login to quickstart with data-hub-user [\#519](https://github.com/marklogic/marklogic-data-hub/issues/519)
- Error when settings gradle properties from task definition [\#518](https://github.com/marklogic/marklogic-data-hub/issues/518)
- Basic auth not working [\#517](https://github.com/marklogic/marklogic-data-hub/issues/517)
- Debug of run-flow transform breaks multipart requests and can't be turned off [\#516](https://github.com/marklogic/marklogic-data-hub/issues/516)
- Bug in deploying Flows to MarkLogic [\#512](https://github.com/marklogic/marklogic-data-hub/issues/512)
- Writer trace is firing twice [\#510](https://github.com/marklogic/marklogic-data-hub/issues/510)
- Error loading XSD schemas [\#509](https://github.com/marklogic/marklogic-data-hub/issues/509)

**Closed issues:**

- Can't run flows with spaces in the names from MLCP [\#523](https://github.com/marklogic/marklogic-data-hub/issues/523)
- Better error handling on gradle hubRunFlow [\#514](https://github.com/marklogic/marklogic-data-hub/issues/514)
- Move the Input Flow writer trace into main.\(sjs|xqy\) [\#513](https://github.com/marklogic/marklogic-data-hub/issues/513)
- Links need updating [\#508](https://github.com/marklogic/marklogic-data-hub/issues/508)
- Update to latest ml-gradle [\#505](https://github.com/marklogic/marklogic-data-hub/issues/505)
- Input flow \(mlcp\) options aren't saved [\#481](https://github.com/marklogic/marklogic-data-hub/issues/481)

## [v2.0.0-rc.2](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0-rc.2) (2017-09-12)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.1.5...v2.0.0-rc.2)

**Implemented enhancements:**

- Add Fastload support for MLCP [\#490](https://github.com/marklogic/marklogic-data-hub/issues/490)
- Refactor to use main.xqy [\#484](https://github.com/marklogic/marklogic-data-hub/issues/484)
- Refactor classes that break openjdk [\#482](https://github.com/marklogic/marklogic-data-hub/issues/482)

**Fixed bugs:**

- Next button not working when browsing to new hub project directory [\#502](https://github.com/marklogic/marklogic-data-hub/issues/502)
- Quickstart gets stuck in Loading... with js error [\#501](https://github.com/marklogic/marklogic-data-hub/issues/501)
- scaffolded flow from empty ES model has errors [\#495](https://github.com/marklogic/marklogic-data-hub/issues/495)
- Need to properly escape the path for RegEx [\#494](https://github.com/marklogic/marklogic-data-hub/issues/494)
- Files are being locked on Windows [\#450](https://github.com/marklogic/marklogic-data-hub/issues/450)

**Closed issues:**

- Increase gradleVersion to 3.4 for the wrapper task [\#499](https://github.com/marklogic/marklogic-data-hub/issues/499)
- MLCP 9.0.2 isn't backwards compatible [\#498](https://github.com/marklogic/marklogic-data-hub/issues/498)
- Example: Make a barebones example for cmd line ninjas [\#497](https://github.com/marklogic/marklogic-data-hub/issues/497)
- ML behind Firewall + different ports [\#489](https://github.com/marklogic/marklogic-data-hub/issues/489)
- Ports 8010 and 8011 conflicting with Ops-Director [\#447](https://github.com/marklogic/marklogic-data-hub/issues/447)

**Merged pull requests:**

- Support MLCP fastload [\#500](https://github.com/marklogic/marklogic-data-hub/pull/500) ([RobertSzkutak](https://github.com/RobertSzkutak))

## [v1.1.5](https://github.com/marklogic/marklogic-data-hub/tree/v1.1.5) (2017-08-14)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.1.4...v1.1.5)

**Implemented enhancements:**

- Update Quickstart Ready message [\#478](https://github.com/marklogic/marklogic-data-hub/issues/478)
- Example: Migrating a RDBMS to Data Hub using Spring Batch [\#473](https://github.com/marklogic/marklogic-data-hub/issues/473)

**Fixed bugs:**

- Providing different source/dest DB for the hubRunFlow does not work [\#488](https://github.com/marklogic/marklogic-data-hub/issues/488)
- Path to code has wrong slash on Windows [\#467](https://github.com/marklogic/marklogic-data-hub/issues/467)
- Job status stuck on STARTED for Input Flows [\#466](https://github.com/marklogic/marklogic-data-hub/issues/466)
- File not saving properly from quickstart to fix a bug [\#430](https://github.com/marklogic/marklogic-data-hub/issues/430)
- Error on initial run of QuickStart GUI [\#394](https://github.com/marklogic/marklogic-data-hub/issues/394)
- Error saving entity - collation not legal [\#337](https://github.com/marklogic/marklogic-data-hub/issues/337)

**Closed issues:**

- collection name is hard coded in online store example [\#474](https://github.com/marklogic/marklogic-data-hub/issues/474)
- add \(rest-extension-user,read\) to XML documents in modules-db [\#470](https://github.com/marklogic/marklogic-data-hub/issues/470)
- column-width, or tooltip with full "Identifier" in traces table [\#469](https://github.com/marklogic/marklogic-data-hub/issues/469)
- Initializing DHF Project against existing DB is dropping indexes [\#468](https://github.com/marklogic/marklogic-data-hub/issues/468)
- Saving the changes in a flow code never finishes \*sometimes\* [\#462](https://github.com/marklogic/marklogic-data-hub/issues/462)
- Sometimes a trace for a failed Harmonize job is not available/not existing [\#461](https://github.com/marklogic/marklogic-data-hub/issues/461)
- Unable to ingest image \(.png\) documents using DHF Quick-Start application [\#420](https://github.com/marklogic/marklogic-data-hub/issues/420)
- Load files into the data hub schemas database [\#288](https://github.com/marklogic/marklogic-data-hub/issues/288)
- Ability to override uri for input flows [\#182](https://github.com/marklogic/marklogic-data-hub/issues/182)
- Create concept of a domain [\#82](https://github.com/marklogic/marklogic-data-hub/issues/82)

**Merged pull requests:**

- Feature/473 msb example [\#480](https://github.com/marklogic/marklogic-data-hub/pull/480) ([sastafford](https://github.com/sastafford))
- Some typos and suggestions [\#475](https://github.com/marklogic/marklogic-data-hub/pull/475) ([patrickmcelwee](https://github.com/patrickmcelwee))

## [v1.1.4](https://github.com/marklogic/marklogic-data-hub/tree/v1.1.4) (2017-07-25)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0-rc.1...v1.1.4)

## [v2.0.0-rc.1](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0-rc.1) (2017-07-24)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0-beta.1...v2.0.0-rc.1)

**Implemented enhancements:**

- Cannot specify default permissions for data-hub-staging-MODULES db [\#434](https://github.com/marklogic/marklogic-data-hub/issues/434)

**Fixed bugs:**

- MlcpRunner is being started improperly [\#452](https://github.com/marklogic/marklogic-data-hub/issues/452)
- Code deploy fails when An entity is deleted [\#451](https://github.com/marklogic/marklogic-data-hub/issues/451)
- error during data hub workshop [\#437](https://github.com/marklogic/marklogic-data-hub/issues/437)
- when scaffolding code for an array, have it be empty list \[\] rather than null [\#432](https://github.com/marklogic/marklogic-data-hub/issues/432)
- gradlew is generated without execute permission [\#428](https://github.com/marklogic/marklogic-data-hub/issues/428)
- RunFlowTask using dyslexic string for hub key [\#419](https://github.com/marklogic/marklogic-data-hub/issues/419)

**Closed issues:**

- Upgrade quick-start to mlcp 9.0.2 [\#465](https://github.com/marklogic/marklogic-data-hub/issues/465)
- QuickStart app doesn't work on Internet Explorer 11 [\#463](https://github.com/marklogic/marklogic-data-hub/issues/463)
- Redeploy modules removes trace and debugging settings [\#460](https://github.com/marklogic/marklogic-data-hub/issues/460)
- Quickstart Application not working on Internet Explorer [\#456](https://github.com/marklogic/marklogic-data-hub/issues/456)
- Envelope instance created does not include "info" [\#455](https://github.com/marklogic/marklogic-data-hub/issues/455)
- Error when creating a harmonize flow based on entity definition [\#454](https://github.com/marklogic/marklogic-data-hub/issues/454)
- tutorial link is 404: https://marklogic.github.io/marklogic-data-hub/ [\#449](https://github.com/marklogic/marklogic-data-hub/issues/449)
- Changes to $options not persisting if set in headers or triples in Harmonization flow [\#448](https://github.com/marklogic/marklogic-data-hub/issues/448)
- Input flow job \(load-acme-tech\) failing on 2.0.0-beta.1 [\#446](https://github.com/marklogic/marklogic-data-hub/issues/446)
- Fix AppVeyor CI [\#445](https://github.com/marklogic/marklogic-data-hub/issues/445)
- consider using windows compatible line breaks [\#444](https://github.com/marklogic/marklogic-data-hub/issues/444)
- RFE: support setting log level [\#442](https://github.com/marklogic/marklogic-data-hub/issues/442)
- Setting replica forest data path [\#441](https://github.com/marklogic/marklogic-data-hub/issues/441)
- Replica forests not created from quick-start [\#439](https://github.com/marklogic/marklogic-data-hub/issues/439)
- Error in documentation for the REST transform [\#433](https://github.com/marklogic/marklogic-data-hub/issues/433)
- Harmonization hits maximum document size in collector output [\#427](https://github.com/marklogic/marklogic-data-hub/issues/427)
- Create a checklist for making DHF releases [\#424](https://github.com/marklogic/marklogic-data-hub/issues/424)
- Expose the ability to set the writer plugin's target database in gradle [\#423](https://github.com/marklogic/marklogic-data-hub/issues/423)
- Document all gradle hub tasks [\#402](https://github.com/marklogic/marklogic-data-hub/issues/402)
- Document query-only mode for plugins [\#368](https://github.com/marklogic/marklogic-data-hub/issues/368)
- Generated code template from Entity for nested item hides vars \(v2/Entities\) [\#353](https://github.com/marklogic/marklogic-data-hub/issues/353)
- Control what runs in update mode to minimize locking [\#300](https://github.com/marklogic/marklogic-data-hub/issues/300)
- Library Modules not being autodeployed [\#299](https://github.com/marklogic/marklogic-data-hub/issues/299)
- Uninstall doesn't always finish on the UI [\#266](https://github.com/marklogic/marklogic-data-hub/issues/266)
- Consider name and description for data hub framework and tooling [\#175](https://github.com/marklogic/marklogic-data-hub/issues/175)

## [v2.0.0-beta.1](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0-beta.1) (2017-05-31)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.1.3...v2.0.0-beta.1)

**Implemented enhancements:**

- Add a code editor [\#418](https://github.com/marklogic/marklogic-data-hub/issues/418)

**Fixed bugs:**

- Entity properties starting with a capital generate templates with a preceding dash in var names [\#350](https://github.com/marklogic/marklogic-data-hub/issues/350)

## [v1.1.3](https://github.com/marklogic/marklogic-data-hub/tree/v1.1.3) (2017-05-24)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0-alpha.4...v1.1.3)

**Implemented enhancements:**

- Expose the ability to pass custom properties via gradle [\#416](https://github.com/marklogic/marklogic-data-hub/issues/416)
- Add gradle wrapper to scaffolded project [\#415](https://github.com/marklogic/marklogic-data-hub/issues/415)
- Entity view: show "Loading entities..." rather than "You don't have any entities yet" [\#411](https://github.com/marklogic/marklogic-data-hub/issues/411)
- Better default document format for input flow [\#410](https://github.com/marklogic/marklogic-data-hub/issues/410)
- Add button to sync indexes [\#393](https://github.com/marklogic/marklogic-data-hub/issues/393)
- ugly scrollbars appear on project list in quickstart [\#385](https://github.com/marklogic/marklogic-data-hub/issues/385)
- Handle Batch Flow Errors [\#379](https://github.com/marklogic/marklogic-data-hub/issues/379)
- Default the harmonize collector to only get items in a standard input collection [\#344](https://github.com/marklogic/marklogic-data-hub/issues/344)
- Add ability to specify source/target database for a Harmonize flow [\#319](https://github.com/marklogic/marklogic-data-hub/issues/319)

**Fixed bugs:**

- MLCP options: Output URI Replace is not working as expected [\#414](https://github.com/marklogic/marklogic-data-hub/issues/414)
- Can't do load on Windows [\#407](https://github.com/marklogic/marklogic-data-hub/issues/407)
- Illegal/unsupported escape sequence in Windows 10 when creating entities [\#406](https://github.com/marklogic/marklogic-data-hub/issues/406)
- Better feedback for client-side validation failures [\#398](https://github.com/marklogic/marklogic-data-hub/issues/398)
- XQuery bug detected but not shown on QuickStart GUI [\#395](https://github.com/marklogic/marklogic-data-hub/issues/395)
- Save Options in Input Flow doesn't save changes to 'Output URI Replace' [\#390](https://github.com/marklogic/marklogic-data-hub/issues/390)
- Default forests are created/attached even with custom forest JSON definitions [\#389](https://github.com/marklogic/marklogic-data-hub/issues/389)
- mlReloadModules may not work [\#386](https://github.com/marklogic/marklogic-data-hub/issues/386)
- Can't run harmonize on 2.0.0-alpha.2 [\#382](https://github.com/marklogic/marklogic-data-hub/issues/382)
- Compile issue [\#381](https://github.com/marklogic/marklogic-data-hub/issues/381)
- When one item fails in a harmonize batch run, other items in the chunk do not get processed [\#279](https://github.com/marklogic/marklogic-data-hub/issues/279)

**Closed issues:**

- Need to update my forest location while setting up the datahub framework; [\#356](https://github.com/marklogic/marklogic-data-hub/issues/356)
- Harmonization flow not hitting staging port defined in gradle.properties [\#342](https://github.com/marklogic/marklogic-data-hub/issues/342)
- gradle commands for flow creation [\#339](https://github.com/marklogic/marklogic-data-hub/issues/339)
- gradle hubInit failing [\#307](https://github.com/marklogic/marklogic-data-hub/issues/307)
- QuickStart App data loaded to incorrect directory? [\#251](https://github.com/marklogic/marklogic-data-hub/issues/251)
- Allow Ingest to feed directly to conform w/o storing data [\#186](https://github.com/marklogic/marklogic-data-hub/issues/186)
- DataHub::isInstalled\(\) is not sufficient [\#165](https://github.com/marklogic/marklogic-data-hub/issues/165)
- Auto Generate Indexes based on entity defs [\#105](https://github.com/marklogic/marklogic-data-hub/issues/105)
- Allow Exploration on the staged, raw data [\#2](https://github.com/marklogic/marklogic-data-hub/issues/2)

**Merged pull requests:**

- display a "Loading" message while retrieving entities [\#412](https://github.com/marklogic/marklogic-data-hub/pull/412) ([dmcassel](https://github.com/dmcassel))
- disabled frame options in quickstart so it can be run inside an iframe [\#364](https://github.com/marklogic/marklogic-data-hub/pull/364) ([ryan321](https://github.com/ryan321))

## [v2.0.0-alpha.4](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0-alpha.4) (2017-05-12)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0-alpha.3...v2.0.0-alpha.4)

## [v2.0.0-alpha.3](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0-alpha.3) (2017-05-08)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.1.2...v2.0.0-alpha.3)

## [v1.1.2](https://github.com/marklogic/marklogic-data-hub/tree/v1.1.2) (2017-04-12)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.1.1...v1.1.2)

**Fixed bugs:**

- null pointer exception on logout [\#383](https://github.com/marklogic/marklogic-data-hub/issues/383)

**Closed issues:**

- gradle version check fails on multiple dots [\#384](https://github.com/marklogic/marklogic-data-hub/issues/384)
- QuickStart Template Compile Error 2.0-alpha.2 [\#380](https://github.com/marklogic/marklogic-data-hub/issues/380)

## [v1.1.1](https://github.com/marklogic/marklogic-data-hub/tree/v1.1.1) (2017-03-20)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0-alpha.2...v1.1.1)

**Implemented enhancements:**

- customize session name to avoid conflicts [\#369](https://github.com/marklogic/marklogic-data-hub/issues/369)
- Change Java Client API dependency to stable build [\#358](https://github.com/marklogic/marklogic-data-hub/issues/358)
- Update Hub to use latest ml-gradle [\#355](https://github.com/marklogic/marklogic-data-hub/issues/355)

**Closed issues:**

- Entities and custom modules fail to deploy - v1.1.0 [\#377](https://github.com/marklogic/marklogic-data-hub/issues/377)
- See if we can bail if the gradle version is too low [\#376](https://github.com/marklogic/marklogic-data-hub/issues/376)
- Unable to login marklogic using hub frame work received  "500 Internal Server Error"  [\#374](https://github.com/marklogic/marklogic-data-hub/issues/374)
- gradle plugin gets confused about users [\#371](https://github.com/marklogic/marklogic-data-hub/issues/371)
- can't put binary inside envelope [\#366](https://github.com/marklogic/marklogic-data-hub/issues/366)
- MLCP can't find /etc/hadooop [\#365](https://github.com/marklogic/marklogic-data-hub/issues/365)
- Add CLA requirement to CONTRIBUTING [\#361](https://github.com/marklogic/marklogic-data-hub/issues/361)
- Bug: QuickStart Login screen: Long paths aren't completely visible in Chrome [\#354](https://github.com/marklogic/marklogic-data-hub/issues/354)

**Merged pull requests:**

- Adds CLA requirement \(\#361\) [\#363](https://github.com/marklogic/marklogic-data-hub/pull/363) ([jmakeig](https://github.com/jmakeig))
- Adds CLA requirement \(\#361\) [\#362](https://github.com/marklogic/marklogic-data-hub/pull/362) ([jmakeig](https://github.com/jmakeig))
- Updates Java Client API dependency to stable build [\#359](https://github.com/marklogic/marklogic-data-hub/pull/359) ([jmakeig](https://github.com/jmakeig))

## [v2.0.0-alpha.2](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0-alpha.2) (2017-01-16)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.1.0...v2.0.0-alpha.2)

**Implemented enhancements:**

- Allow exernal data to be passed in to a flow's options-map [\#334](https://github.com/marklogic/marklogic-data-hub/issues/334)
- Integrate with Entity Services [\#283](https://github.com/marklogic/marklogic-data-hub/issues/283)
- show traces for a given flow [\#277](https://github.com/marklogic/marklogic-data-hub/issues/277)

**Fixed bugs:**

- Returning json:object\(\) isn't invoking ES serialization in flow [\#345](https://github.com/marklogic/marklogic-data-hub/issues/345)

**Closed issues:**

- "No message available" when following Quick Start [\#352](https://github.com/marklogic/marklogic-data-hub/issues/352)
- Add job-id to harmonized documents [\#351](https://github.com/marklogic/marklogic-data-hub/issues/351)
- Entity modeling rendering incorrectly [\#347](https://github.com/marklogic/marklogic-data-hub/issues/347)

## [v1.1.0](https://github.com/marklogic/marklogic-data-hub/tree/v1.1.0) (2016-12-16)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0-alpha.1...v1.1.0)

**Implemented enhancements:**

- Detect when running upgraded hub [\#322](https://github.com/marklogic/marklogic-data-hub/issues/322)

**Fixed bugs:**

- if MarkLogic is not started, login reports "invalid username or password" [\#343](https://github.com/marklogic/marklogic-data-hub/issues/343)
- Need gradle variables for Auth method for final, staging, etc [\#340](https://github.com/marklogic/marklogic-data-hub/issues/340)
- Pagination not implemented on jobs page [\#320](https://github.com/marklogic/marklogic-data-hub/issues/320)

**Closed issues:**

- Directory slashes when typing in paths [\#341](https://github.com/marklogic/marklogic-data-hub/issues/341)
- Scaffolding generation failed [\#338](https://github.com/marklogic/marklogic-data-hub/issues/338)
- Investigating slow performance in loading modules on Windows [\#336](https://github.com/marklogic/marklogic-data-hub/issues/336)
- Input Flow - Output URI replace configuration doesn't stick on windows [\#335](https://github.com/marklogic/marklogic-data-hub/issues/335)
- Keep user database settings separate from hub database settings [\#325](https://github.com/marklogic/marklogic-data-hub/issues/325)
- Create a non-admin user for doing hub stuff [\#200](https://github.com/marklogic/marklogic-data-hub/issues/200)

## [v2.0.0-alpha.1](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.0-alpha.1) (2016-11-30)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.2...v2.0.0-alpha.1)

**Implemented enhancements:**

- Visual entity type model editor [\#286](https://github.com/marklogic/marklogic-data-hub/issues/286)

## [v1.0.2](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.2) (2016-11-22)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.1...v1.0.2)

**Fixed bugs:**

- mlcp load from QuickStart GUI not loading data [\#331](https://github.com/marklogic/marklogic-data-hub/issues/331)

**Closed issues:**

- Possible typo on wiki page [\#333](https://github.com/marklogic/marklogic-data-hub/issues/333)
- Tutorial instruction - create entity "Employees" instead of "Employee" [\#330](https://github.com/marklogic/marklogic-data-hub/issues/330)
- mlcp job is not getting run + console log button not showing [\#329](https://github.com/marklogic/marklogic-data-hub/issues/329)
- Error Extension hubstats does not exist. [\#328](https://github.com/marklogic/marklogic-data-hub/issues/328)

## [v1.0.1](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.1) (2016-11-08)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0...v1.0.1)

**Fixed bugs:**

- Responsive CSS is hiding the menu bar [\#321](https://github.com/marklogic/marklogic-data-hub/issues/321)
- Redeploy button is wiping out hub modules [\#318](https://github.com/marklogic/marklogic-data-hub/issues/318)

**Closed issues:**

- Log out why isInstalled\(\) is failing [\#324](https://github.com/marklogic/marklogic-data-hub/issues/324)
- Provide Build instructions for developers [\#323](https://github.com/marklogic/marklogic-data-hub/issues/323)
- Add Link to the ML On Demand Courses [\#315](https://github.com/marklogic/marklogic-data-hub/issues/315)
- upgrading RC5 to RC6 [\#306](https://github.com/marklogic/marklogic-data-hub/issues/306)
- Allow users to clear out corrupt install [\#304](https://github.com/marklogic/marklogic-data-hub/issues/304)

## [v1.0.0](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0) (2016-10-25)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-rc.6...v1.0.0)

**Fixed bugs:**

- DeployViewSchemasCommand is failing installs [\#312](https://github.com/marklogic/marklogic-data-hub/issues/312)
- File change watcher fires multiple times on Windows [\#308](https://github.com/marklogic/marklogic-data-hub/issues/308)
- Clean Target database directory ? is confusing not working [\#305](https://github.com/marklogic/marklogic-data-hub/issues/305)

**Closed issues:**

- Gradle Daemon causing working directory issues [\#314](https://github.com/marklogic/marklogic-data-hub/issues/314)
- marklogic spring batch requires additional date sort operator [\#311](https://github.com/marklogic/marklogic-data-hub/issues/311)
- Handling tab-delimited files  [\#310](https://github.com/marklogic/marklogic-data-hub/issues/310)
- Add issue template to the repo [\#309](https://github.com/marklogic/marklogic-data-hub/issues/309)
- Last deployed time sometimes says 47 years ago [\#303](https://github.com/marklogic/marklogic-data-hub/issues/303)

## [v1.0.0-rc.6](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-rc.6) (2016-10-17)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-rc.5...v1.0.0-rc.6)

**Fixed bugs:**

- Deadlock when evaling from writer [\#231](https://github.com/marklogic/marklogic-data-hub/issues/231)

**Closed issues:**

- Update Trace UI in Trace server [\#302](https://github.com/marklogic/marklogic-data-hub/issues/302)
- Trace enhancement: Not logging enough for error trace [\#301](https://github.com/marklogic/marklogic-data-hub/issues/301)
- ArrayIndexOutOfBoundsException [\#298](https://github.com/marklogic/marklogic-data-hub/issues/298)
- Getting Started Tutorial - Sample code for Acme Tech header plugin does not update 'latest' variable [\#297](https://github.com/marklogic/marklogic-data-hub/issues/297)
- Not all data is processed in harmonize flow when thread count is greater than 1 [\#296](https://github.com/marklogic/marklogic-data-hub/issues/296)
- New Mlcp Error grabbing has false positives on windows [\#295](https://github.com/marklogic/marklogic-data-hub/issues/295)
- Clarify that ML DHF is FOSS and not supported MarkLogic product [\#294](https://github.com/marklogic/marklogic-data-hub/issues/294)
- custom thread count throws parsing error [\#292](https://github.com/marklogic/marklogic-data-hub/issues/292)
- RC5: the ingest steps in quick start gives a exception and is not runned [\#291](https://github.com/marklogic/marklogic-data-hub/issues/291)
- fix gradle tasks for run flow [\#290](https://github.com/marklogic/marklogic-data-hub/issues/290)
- When exception is thrown, not all flow traces are persisted. [\#278](https://github.com/marklogic/marklogic-data-hub/issues/278)
- Add ability to clear the Staging or Final database [\#198](https://github.com/marklogic/marklogic-data-hub/issues/198)
- mlcp\_transform needs profiling [\#162](https://github.com/marklogic/marklogic-data-hub/issues/162)

## [v1.0.0-rc.5](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-rc.5) (2016-09-27)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-rc.4...v1.0.0-rc.5)

**Implemented enhancements:**

- Allow plugins to know then name of the entity [\#271](https://github.com/marklogic/marklogic-data-hub/issues/271)
- Mark mlcp jobs with errors as failed? [\#268](https://github.com/marklogic/marklogic-data-hub/issues/268)

**Fixed bugs:**

- Tooltip comment for mlcp option wrong [\#270](https://github.com/marklogic/marklogic-data-hub/issues/270)
- TimeAgo [\#267](https://github.com/marklogic/marklogic-data-hub/issues/267)

**Closed issues:**

- chore: update java dependencies [\#287](https://github.com/marklogic/marklogic-data-hub/issues/287)
- Github pages link error [\#285](https://github.com/marklogic/marklogic-data-hub/issues/285)
- Module watch fails when you switch projects [\#284](https://github.com/marklogic/marklogic-data-hub/issues/284)
- chore: fix appveyor build [\#282](https://github.com/marklogic/marklogic-data-hub/issues/282)
- Lots of cache warnings [\#281](https://github.com/marklogic/marklogic-data-hub/issues/281)
- Trace settings gets wiped out when content database is cleared [\#280](https://github.com/marklogic/marklogic-data-hub/issues/280)
- Better distinguish between Entities and Flows [\#275](https://github.com/marklogic/marklogic-data-hub/issues/275)
- Exception in Quick Start [\#274](https://github.com/marklogic/marklogic-data-hub/issues/274)
- Setting up on Mac causes an issue with .war file [\#273](https://github.com/marklogic/marklogic-data-hub/issues/273)
- rc4 - input flow UI jacked up on chrome/windows [\#272](https://github.com/marklogic/marklogic-data-hub/issues/272)
- MLCP command is using deprecated command line flags [\#265](https://github.com/marklogic/marklogic-data-hub/issues/265)
- QuickStart App: Status indicator on installation screen is out of view when text is enlarged [\#262](https://github.com/marklogic/marklogic-data-hub/issues/262)
- Run Flow buttons inconsistent b/c Harmonize runs immediately [\#257](https://github.com/marklogic/marklogic-data-hub/issues/257)
- QuickStart App data not loaded to correct collection [\#250](https://github.com/marklogic/marklogic-data-hub/issues/250)

## [v1.0.0-rc.4](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-rc.4) (2016-09-02)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-rc.3...v1.0.0-rc.4)

**Implemented enhancements:**

- Add Spring Batch Example [\#263](https://github.com/marklogic/marklogic-data-hub/issues/263)

**Closed issues:**

- MLCP Command for CSV files is generated incorrectly  [\#261](https://github.com/marklogic/marklogic-data-hub/issues/261)
- update examples now that rc.2 is out [\#247](https://github.com/marklogic/marklogic-data-hub/issues/247)
- UI rework based on new screen designs [\#70](https://github.com/marklogic/marklogic-data-hub/issues/70)

## [v1.0.0-rc.3](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-rc.3) (2016-08-25)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-rc.2...v1.0.0-rc.3)

**Fixed bugs:**

- Better support for mixed flow and file type [\#228](https://github.com/marklogic/marklogic-data-hub/issues/228)

**Closed issues:**

- better support for binaries [\#259](https://github.com/marklogic/marklogic-data-hub/issues/259)
- Get traces is super slow [\#258](https://github.com/marklogic/marklogic-data-hub/issues/258)
- Job Output window stuck and not close-able [\#256](https://github.com/marklogic/marklogic-data-hub/issues/256)
- mlcp uri replace is busted when run from cygwin [\#255](https://github.com/marklogic/marklogic-data-hub/issues/255)
- Enable tracing by default [\#254](https://github.com/marklogic/marklogic-data-hub/issues/254)
- Clear modules / Redeploy [\#252](https://github.com/marklogic/marklogic-data-hub/issues/252)
- quickstart should be deployable to an appserver under a subdir [\#249](https://github.com/marklogic/marklogic-data-hub/issues/249)
- Install status window too narrow [\#248](https://github.com/marklogic/marklogic-data-hub/issues/248)
- gradle tasks need to force deploy content [\#246](https://github.com/marklogic/marklogic-data-hub/issues/246)
- Running MLCP on non-existing flow causes error [\#243](https://github.com/marklogic/marklogic-data-hub/issues/243)
- Loading GlobalCorp dataset results in deadlocks [\#225](https://github.com/marklogic/marklogic-data-hub/issues/225)
- Deploy modules button should clear out the modules first [\#214](https://github.com/marklogic/marklogic-data-hub/issues/214)
- Better error handling for failed hub install [\#176](https://github.com/marklogic/marklogic-data-hub/issues/176)

## [v1.0.0-rc.2](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-rc.2) (2016-08-10)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-rc.1...v1.0.0-rc.2)

**Closed issues:**

- gradle isn't deploying modules properly [\#244](https://github.com/marklogic/marklogic-data-hub/issues/244)
- Remove Tweets Example [\#234](https://github.com/marklogic/marklogic-data-hub/issues/234)

## [v1.0.0-rc.1](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-rc.1) (2016-08-04)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-beta.6...v1.0.0-rc.1)

**Fixed bugs:**

- Error in writer caused exception with tracing [\#235](https://github.com/marklogic/marklogic-data-hub/issues/235)
- Failed test : DataHubTest.testInstallUserModules [\#106](https://github.com/marklogic/marklogic-data-hub/issues/106)

**Closed issues:**

- Unable to run the harmonize flows [\#242](https://github.com/marklogic/marklogic-data-hub/issues/242)
- ML Version is unnaceptable [\#241](https://github.com/marklogic/marklogic-data-hub/issues/241)
- rename config to marklogic-config [\#239](https://github.com/marklogic/marklogic-data-hub/issues/239)
- Allow many developers to share a server, each with their own Data Hub [\#237](https://github.com/marklogic/marklogic-data-hub/issues/237)
- Change colors and icons to match other MarkLogic content/GUIs [\#236](https://github.com/marklogic/marklogic-data-hub/issues/236)
- isInstalled fails on 9 nightly [\#216](https://github.com/marklogic/marklogic-data-hub/issues/216)
- Tracing UI [\#210](https://github.com/marklogic/marklogic-data-hub/issues/210)
- During install, list the artifacts being created [\#194](https://github.com/marklogic/marklogic-data-hub/issues/194)
- Performance tracing [\#193](https://github.com/marklogic/marklogic-data-hub/issues/193)
- Refactor the Spring Boot API [\#145](https://github.com/marklogic/marklogic-data-hub/issues/145)
- Support index configuration as a part of pushbutton deploy.  [\#10](https://github.com/marklogic/marklogic-data-hub/issues/10)

## [v1.0.0-beta.6](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-beta.6) (2016-06-20)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-beta.5...v1.0.0-beta.6)

**Fixed bugs:**

- Need to specify collation in query in trace-lib.xqy [\#230](https://github.com/marklogic/marklogic-data-hub/issues/230)

**Closed issues:**

- Better gradle integration [\#232](https://github.com/marklogic/marklogic-data-hub/issues/232)
- Add example project for advanced gradle [\#185](https://github.com/marklogic/marklogic-data-hub/issues/185)

**Merged pull requests:**

- Refactored the hub gradle integration [\#233](https://github.com/marklogic/marklogic-data-hub/pull/233) ([paxtonhare](https://github.com/paxtonhare))

## [v1.0.0-beta.5](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-beta.5) (2016-05-03)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-beta.4...v1.0.0-beta.5)

**Fixed bugs:**

- Fix bugs in load data feature [\#219](https://github.com/marklogic/marklogic-data-hub/issues/219)
- Error running hadoop [\#121](https://github.com/marklogic/marklogic-data-hub/issues/121)

**Closed issues:**

- Refactor to Auto deploy code [\#197](https://github.com/marklogic/marklogic-data-hub/issues/197)

**Merged pull requests:**

- Revert "fixed \#197" [\#227](https://github.com/marklogic/marklogic-data-hub/pull/227) ([paxtonhare](https://github.com/paxtonhare))
- Tracing [\#226](https://github.com/marklogic/marklogic-data-hub/pull/226) ([paxtonhare](https://github.com/paxtonhare))
- fixing bug in restoring previous load options [\#223](https://github.com/marklogic/marklogic-data-hub/pull/223) ([paxtonhare](https://github.com/paxtonhare))
- 219 - Fix Bugs in Load Data Feature [\#220](https://github.com/marklogic/marklogic-data-hub/pull/220) ([maeisabelle](https://github.com/maeisabelle))
- Changes to fix JS errors in Swagger UI in master [\#218](https://github.com/marklogic/marklogic-data-hub/pull/218) ([maeisabelle](https://github.com/maeisabelle))
- enhance performance of hub install [\#217](https://github.com/marklogic/marklogic-data-hub/pull/217) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#197 [\#213](https://github.com/marklogic/marklogic-data-hub/pull/213) ([divino](https://github.com/divino))

## [v1.0.0-beta.4](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-beta.4) (2016-04-21)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-beta.3...v1.0.0-beta.4)

**Implemented enhancements:**

- Minor improvements to Load Data Feature [\#205](https://github.com/marklogic/marklogic-data-hub/issues/205)

**Fixed bugs:**

- File permission error running hadoop to do data load [\#89](https://github.com/marklogic/marklogic-data-hub/issues/89)

**Closed issues:**

- Rename conform/conformance to harmonize [\#201](https://github.com/marklogic/marklogic-data-hub/issues/201)
- Errors only flash on the GUI for a short time [\#192](https://github.com/marklogic/marklogic-data-hub/issues/192)
- Investigate MLCP UI for creating MLCP cmd line options [\#164](https://github.com/marklogic/marklogic-data-hub/issues/164)
- Examples need demo scripts [\#99](https://github.com/marklogic/marklogic-data-hub/issues/99)
- DataHub.installUserModules should be "syncUserModules" [\#45](https://github.com/marklogic/marklogic-data-hub/issues/45)

**Merged pull requests:**

- Fix mlcp windows issue 89 [\#215](https://github.com/marklogic/marklogic-data-hub/pull/215) ([paxtonhare](https://github.com/paxtonhare))
- 192 - Removed automatic closing of notification [\#208](https://github.com/marklogic/marklogic-data-hub/pull/208) ([maeisabelle](https://github.com/maeisabelle))

## [v1.0.0-beta.3](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-beta.3) (2016-04-15)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-beta.2...v1.0.0-beta.3)

**Closed issues:**

- Enable Tracing in the Hub [\#199](https://github.com/marklogic/marklogic-data-hub/issues/199)

**Merged pull requests:**

- Harmonize [\#207](https://github.com/marklogic/marklogic-data-hub/pull/207) ([paxtonhare](https://github.com/paxtonhare))
- 205 - Minor load data improvements [\#206](https://github.com/marklogic/marklogic-data-hub/pull/206) ([maeisabelle](https://github.com/maeisabelle))
- 164 - Load data improvements [\#204](https://github.com/marklogic/marklogic-data-hub/pull/204) ([maeisabelle](https://github.com/maeisabelle))
- 164 - Load Data Improvements [\#203](https://github.com/marklogic/marklogic-data-hub/pull/203) ([maeisabelle](https://github.com/maeisabelle))
- Gradle fixes [\#202](https://github.com/marklogic/marklogic-data-hub/pull/202) ([paxtonhare](https://github.com/paxtonhare))

## [v1.0.0-beta.2](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-beta.2) (2016-04-13)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-beta.1...v1.0.0-beta.2)

**Implemented enhancements:**

- Handle duplicate REST service extensions and transforms [\#143](https://github.com/marklogic/marklogic-data-hub/issues/143)

**Fixed bugs:**

- Bug deploying rest services - maybe missing \<hub:plugins\> config ? [\#187](https://github.com/marklogic/marklogic-data-hub/issues/187)
- Session invalidated bug [\#109](https://github.com/marklogic/marklogic-data-hub/issues/109)

**Closed issues:**

- REST folder is being deployed as assets [\#189](https://github.com/marklogic/marklogic-data-hub/issues/189)
- Create Hub example for simple gradle integration [\#184](https://github.com/marklogic/marklogic-data-hub/issues/184)
- Error while loading data [\#179](https://github.com/marklogic/marklogic-data-hub/issues/179)
- Uninstall hub results in error [\#177](https://github.com/marklogic/marklogic-data-hub/issues/177)
- Define different func signatures for simple vs advanced Flows [\#174](https://github.com/marklogic/marklogic-data-hub/issues/174)
- Revisit comments in plugin template files [\#168](https://github.com/marklogic/marklogic-data-hub/issues/168)
- Add writer to scaffolding for conformance flow [\#115](https://github.com/marklogic/marklogic-data-hub/issues/115)
- Make UI code more angular [\#104](https://github.com/marklogic/marklogic-data-hub/issues/104)
- Swagger UI [\#75](https://github.com/marklogic/marklogic-data-hub/issues/75)
- Swagger JSON Endpoint [\#74](https://github.com/marklogic/marklogic-data-hub/issues/74)
- gradle plugin to run hub functions from a gradle project [\#58](https://github.com/marklogic/marklogic-data-hub/issues/58)

**Merged pull requests:**

- 177 uninstall hub results in error [\#196](https://github.com/marklogic/marklogic-data-hub/pull/196) ([divino](https://github.com/divino))
- adding trace server, db, forests [\#195](https://github.com/marklogic/marklogic-data-hub/pull/195) ([paxtonhare](https://github.com/paxtonhare))
- fixing filenames for databases [\#191](https://github.com/marklogic/marklogic-data-hub/pull/191) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#187 [\#190](https://github.com/marklogic/marklogic-data-hub/pull/190) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#184 [\#188](https://github.com/marklogic/marklogic-data-hub/pull/188) ([paxtonhare](https://github.com/paxtonhare))
- prepping for beta 2 release [\#181](https://github.com/marklogic/marklogic-data-hub/pull/181) ([paxtonhare](https://github.com/paxtonhare))
- Get document type from the dataFormat of the entity [\#180](https://github.com/marklogic/marklogic-data-hub/pull/180) ([divino](https://github.com/divino))
- update plugin signatures [\#178](https://github.com/marklogic/marklogic-data-hub/pull/178) ([paxtonhare](https://github.com/paxtonhare))

## [v1.0.0-beta.1](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-beta.1) (2016-04-01)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-alpha.4...v1.0.0-beta.1)

**Closed issues:**

- JsHint Error on Build [\#170](https://github.com/marklogic/marklogic-data-hub/issues/170)
- Better error handling when session has expired [\#166](https://github.com/marklogic/marklogic-data-hub/issues/166)
- Identifier ending up in json files [\#159](https://github.com/marklogic/marklogic-data-hub/issues/159)
- conform content plugins don't work on json [\#158](https://github.com/marklogic/marklogic-data-hub/issues/158)
- Automatically assign a collection to docs based on flow and entity names [\#142](https://github.com/marklogic/marklogic-data-hub/issues/142)
- Remember latest load data parameter per flow [\#130](https://github.com/marklogic/marklogic-data-hub/issues/130)
- Docs overhaul [\#103](https://github.com/marklogic/marklogic-data-hub/issues/103)
- Add REST scaffolding [\#102](https://github.com/marklogic/marklogic-data-hub/issues/102)
- Change detection should pick up REST changes [\#101](https://github.com/marklogic/marklogic-data-hub/issues/101)

**Merged pull requests:**

- 130 - Remember the last input path per flow [\#172](https://github.com/marklogic/marklogic-data-hub/pull/172) ([maeisabelle](https://github.com/maeisabelle))
- Cleanup - Fix Jshint errors [\#171](https://github.com/marklogic/marklogic-data-hub/pull/171) ([maeisabelle](https://github.com/maeisabelle))
- set server.session.timeout=0 to make session last forever. [\#169](https://github.com/marklogic/marklogic-data-hub/pull/169) ([divino](https://github.com/divino))
- Add hr hub [\#167](https://github.com/marklogic/marklogic-data-hub/pull/167) ([paxtonhare](https://github.com/paxtonhare))
- 143 - Added validation for duplicate REST service extensions and transforms. [\#163](https://github.com/marklogic/marklogic-data-hub/pull/163) ([maeisabelle](https://github.com/maeisabelle))
- fixed \#158 [\#161](https://github.com/marklogic/marklogic-data-hub/pull/161) ([paxtonhare](https://github.com/paxtonhare))
- 75 - Swagger UI to browse the Hub APIs [\#160](https://github.com/marklogic/marklogic-data-hub/pull/160) ([maeisabelle](https://github.com/maeisabelle))

## [v1.0.0-alpha.4](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-alpha.4) (2016-03-25)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-alpha.3...v1.0.0-alpha.4)

**Closed issues:**

- HTTP Calls are cached in IE [\#156](https://github.com/marklogic/marklogic-data-hub/issues/156)
- add sample data for tweets [\#154](https://github.com/marklogic/marklogic-data-hub/issues/154)
- get\_content transform not working for json files [\#152](https://github.com/marklogic/marklogic-data-hub/issues/152)
- Support loading of compressed archives [\#149](https://github.com/marklogic/marklogic-data-hub/issues/149)
- Don't reset User Prefs on logout [\#146](https://github.com/marklogic/marklogic-data-hub/issues/146)
- Vet plugins isn't quite right [\#140](https://github.com/marklogic/marklogic-data-hub/issues/140)
- for hl7 example change patientRecord to Patient [\#137](https://github.com/marklogic/marklogic-data-hub/issues/137)
- Create Conformance flow not working [\#135](https://github.com/marklogic/marklogic-data-hub/issues/135)
- Error on New Flow [\#133](https://github.com/marklogic/marklogic-data-hub/issues/133)
- Hub wide modules folder for xqy/sjs [\#129](https://github.com/marklogic/marklogic-data-hub/issues/129)
- Fix delay after deploying modules [\#114](https://github.com/marklogic/marklogic-data-hub/issues/114)
- Detect \(vet\) bad user plugins [\#91](https://github.com/marklogic/marklogic-data-hub/issues/91)
- Better file browsing on load-data [\#88](https://github.com/marklogic/marklogic-data-hub/issues/88)
- Input Flow doesn't report back failures [\#67](https://github.com/marklogic/marklogic-data-hub/issues/67)

**Merged pull requests:**

- fixed \#156 -cached in ie [\#157](https://github.com/marklogic/marklogic-data-hub/pull/157) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#154 - added sample tweets [\#155](https://github.com/marklogic/marklogic-data-hub/pull/155) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#152 - get\_content transform not working for json [\#153](https://github.com/marklogic/marklogic-data-hub/pull/153) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#146 - don't reset user prefs on logout [\#151](https://github.com/marklogic/marklogic-data-hub/pull/151) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#149 - load compressed archives [\#150](https://github.com/marklogic/marklogic-data-hub/pull/150) ([paxtonhare](https://github.com/paxtonhare))
- 142 - Add default collections when loading data using flows [\#148](https://github.com/marklogic/marklogic-data-hub/pull/148) ([maeisabelle](https://github.com/maeisabelle))
- 101 - Handle detection of REST directory [\#147](https://github.com/marklogic/marklogic-data-hub/pull/147) ([maeisabelle](https://github.com/maeisabelle))
- \#104 make ui code more angular [\#144](https://github.com/marklogic/marklogic-data-hub/pull/144) ([divino](https://github.com/divino))
- fixed \#140 - vet plugins not working correctly [\#141](https://github.com/marklogic/marklogic-data-hub/pull/141) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#137 - renamed patientrecords to Patients [\#139](https://github.com/marklogic/marklogic-data-hub/pull/139) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#135 - create conformance flow not working [\#136](https://github.com/marklogic/marklogic-data-hub/pull/136) ([paxtonhare](https://github.com/paxtonhare))
- 102 - Scaffolding for Rest [\#134](https://github.com/marklogic/marklogic-data-hub/pull/134) ([maeisabelle](https://github.com/maeisabelle))
- fixed \#91 - check plugins during install for errors [\#132](https://github.com/marklogic/marklogic-data-hub/pull/132) ([paxtonhare](https://github.com/paxtonhare))
- \#88 folder browser [\#131](https://github.com/marklogic/marklogic-data-hub/pull/131) ([divino](https://github.com/divino))
- adding a gradle plugin for the hub [\#128](https://github.com/marklogic/marklogic-data-hub/pull/128) ([paxtonhare](https://github.com/paxtonhare))

## [v1.0.0-alpha.3](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-alpha.3) (2016-03-15)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-alpha.2...v1.0.0-alpha.3)

**Closed issues:**

- Add staging and final REST port as input during login [\#117](https://github.com/marklogic/marklogic-data-hub/issues/117)
- New Flow button doesn't work [\#100](https://github.com/marklogic/marklogic-data-hub/issues/100)
- Better summary on releases page [\#98](https://github.com/marklogic/marklogic-data-hub/issues/98)
- Add Changelog [\#97](https://github.com/marklogic/marklogic-data-hub/issues/97)
- remove explicit references to "hub in a box" and use "dhib" [\#85](https://github.com/marklogic/marklogic-data-hub/issues/85)
- Create a build process [\#81](https://github.com/marklogic/marklogic-data-hub/issues/81)
- When inserting a document from java, allow a flow to run [\#79](https://github.com/marklogic/marklogic-data-hub/issues/79)
- Build an HL7 Hub [\#71](https://github.com/marklogic/marklogic-data-hub/issues/71)

**Merged pull requests:**

- prepping for alpha.3 release [\#125](https://github.com/marklogic/marklogic-data-hub/pull/125) ([paxtonhare](https://github.com/paxtonhare))
- fixing namespace issues. opts. [\#124](https://github.com/marklogic/marklogic-data-hub/pull/124) ([paxtonhare](https://github.com/paxtonhare))
- adding the hl7 healthcare example [\#123](https://github.com/marklogic/marklogic-data-hub/pull/123) ([paxtonhare](https://github.com/paxtonhare))
- Enhance travis [\#122](https://github.com/marklogic/marklogic-data-hub/pull/122) ([paxtonhare](https://github.com/paxtonhare))
- removed Run button on Input Flows [\#120](https://github.com/marklogic/marklogic-data-hub/pull/120) ([gmarintes](https://github.com/gmarintes))
- 67 input flow report failure [\#119](https://github.com/marklogic/marklogic-data-hub/pull/119) ([gmarintes](https://github.com/gmarintes))
- 117 - Add staging and final REST ports in login page [\#118](https://github.com/marklogic/marklogic-data-hub/pull/118) ([maeisabelle](https://github.com/maeisabelle))
- \#114 - Return the updated state after deploying the modules to remove the delay [\#116](https://github.com/marklogic/marklogic-data-hub/pull/116) ([maeisabelle](https://github.com/maeisabelle))
- changes on the REST directory are now detected [\#113](https://github.com/marklogic/marklogic-data-hub/pull/113) ([gmarintes](https://github.com/gmarintes))
- adding input [\#112](https://github.com/marklogic/marklogic-data-hub/pull/112) ([paxtonhare](https://github.com/paxtonhare))
- changing data-hub-in-a-box to data-hub [\#111](https://github.com/marklogic/marklogic-data-hub/pull/111) ([paxtonhare](https://github.com/paxtonhare))
- 100 new flow and new entity button fix [\#110](https://github.com/marklogic/marklogic-data-hub/pull/110) ([gmarintes](https://github.com/gmarintes))
- Updated "in-a-box" to "data-hub" and "data-hub-in-a-box" to "data-hub" [\#108](https://github.com/marklogic/marklogic-data-hub/pull/108) ([maeisabelle](https://github.com/maeisabelle))
- 79 - Run-flow transform [\#107](https://github.com/marklogic/marklogic-data-hub/pull/107) ([maeisabelle](https://github.com/maeisabelle))

## [v1.0.0-alpha.2](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-alpha.2) (2016-03-09)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-alpha.1...v1.0.0-alpha.2)

**Fixed bugs:**

- Misleading stack trace about missing get-content.xml [\#87](https://github.com/marklogic/marklogic-data-hub/issues/87)

**Closed issues:**

- Add ability to specify some MLCP attributes on import [\#94](https://github.com/marklogic/marklogic-data-hub/issues/94)
- Epic: batch tracking and control [\#92](https://github.com/marklogic/marklogic-data-hub/issues/92)

**Merged pull requests:**

- prepping for alpha 2 drop [\#96](https://github.com/marklogic/marklogic-data-hub/pull/96) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#92 [\#95](https://github.com/marklogic/marklogic-data-hub/pull/95) ([paxtonhare](https://github.com/paxtonhare))
- prepping for first release. [\#93](https://github.com/marklogic/marklogic-data-hub/pull/93) ([paxtonhare](https://github.com/paxtonhare))

## [v1.0.0-alpha.1](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-alpha.1) (2016-03-08)

[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/bf7c86635c504f7ff8324e974c2a62f8298135c9...v1.0.0-alpha.1)

**Implemented enhancements:**

- Add a button to deploy a User's hub modules [\#24](https://github.com/marklogic/marklogic-data-hub/issues/24)
- Allow user to specify where local hub modules are located [\#23](https://github.com/marklogic/marklogic-data-hub/issues/23)
- If installed, skip setup screen [\#22](https://github.com/marklogic/marklogic-data-hub/issues/22)
- Allow the user to provide ML config info in a properties file or command line [\#21](https://github.com/marklogic/marklogic-data-hub/issues/21)
- Determine whether or not hub is installed immediately after login [\#20](https://github.com/marklogic/marklogic-data-hub/issues/20)

**Closed issues:**

- Standard Rest transform to get content only [\#76](https://github.com/marklogic/marklogic-data-hub/issues/76)
- Update dir tree to reflect where REST stuff lives [\#73](https://github.com/marklogic/marklogic-data-hub/issues/73)
- Ability to define search options [\#72](https://github.com/marklogic/marklogic-data-hub/issues/72)
- Use Spring batch for batch running [\#62](https://github.com/marklogic/marklogic-data-hub/issues/62)
- Prompt user to determine if they want sjs or xquery plugins [\#57](https://github.com/marklogic/marklogic-data-hub/issues/57)
- Create a staging and tranformed database [\#56](https://github.com/marklogic/marklogic-data-hub/issues/56)
- Add scaffolding for sjs, xslt [\#55](https://github.com/marklogic/marklogic-data-hub/issues/55)
- Support JSON envelopes [\#54](https://github.com/marklogic/marklogic-data-hub/issues/54)
- Domains should be called Entities [\#53](https://github.com/marklogic/marklogic-data-hub/issues/53)
- Build jar instead of war for quickstart [\#52](https://github.com/marklogic/marklogic-data-hub/issues/52)
- Scaffolding should distinguish between input and conformance flows [\#51](https://github.com/marklogic/marklogic-data-hub/issues/51)
- add support for travis builds [\#47](https://github.com/marklogic/marklogic-data-hub/issues/47)
- As a user I want to be able to cancel a running flow because I just want to do it for the lulz [\#44](https://github.com/marklogic/marklogic-data-hub/issues/44)
- path for conformance plugins is wrong in xquery [\#41](https://github.com/marklogic/marklogic-data-hub/issues/41)
- Need UI feedback when performing long-running tasks [\#40](https://github.com/marklogic/marklogic-data-hub/issues/40)
- Quickstart is caching server state [\#39](https://github.com/marklogic/marklogic-data-hub/issues/39)
- Update QuickStart to use Scaffolding class from data-hub jar [\#38](https://github.com/marklogic/marklogic-data-hub/issues/38)
- Change INPUT and CANONICAL to lowercase [\#34](https://github.com/marklogic/marklogic-data-hub/issues/34)
- Make the Input and Canonical flows optional [\#33](https://github.com/marklogic/marklogic-data-hub/issues/33)
- Fix Hub Install and Uninstall in DataHub class [\#30](https://github.com/marklogic/marklogic-data-hub/issues/30)
- As a developer or admin, from Quickstart Application, I want to deploy DHIB components to MarkLogic so that I can get started quickly and easily. [\#14](https://github.com/marklogic/marklogic-data-hub/issues/14)
- As a data hub admin or developer, I want to setup the QuickStart application so that I can deploy and manage data hub via GUI [\#13](https://github.com/marklogic/marklogic-data-hub/issues/13)
- Create a Spring Boot deployer to set up Tomcat  [\#12](https://github.com/marklogic/marklogic-data-hub/issues/12)
- define the Java Api [\#11](https://github.com/marklogic/marklogic-data-hub/issues/11)
- Plugins should always have an overall function implementation [\#9](https://github.com/marklogic/marklogic-data-hub/issues/9)
- Support config driven 'Collectors' to drive the list of transform tasks \(like corb URIs query\) [\#8](https://github.com/marklogic/marklogic-data-hub/issues/8)
- Provide a spec for plugin or plugins.  [\#5](https://github.com/marklogic/marklogic-data-hub/issues/5)
- Pushbutton deploy - Allow easy deployment to different environments. [\#4](https://github.com/marklogic/marklogic-data-hub/issues/4)
- Stage the data from source systems as raw documents in MarkLogic database [\#1](https://github.com/marklogic/marklogic-data-hub/issues/1)

**Merged pull requests:**

- 72 define search options [\#90](https://github.com/marklogic/marklogic-data-hub/pull/90) ([paxtonhare](https://github.com/paxtonhare))
- Replaced domains with entities [\#86](https://github.com/marklogic/marklogic-data-hub/pull/86) ([maeisabelle](https://github.com/maeisabelle))
- fixed \#76 - added transform to get content only [\#84](https://github.com/marklogic/marklogic-data-hub/pull/84) ([paxtonhare](https://github.com/paxtonhare))
- fixed \#56 - created a staging and final database [\#83](https://github.com/marklogic/marklogic-data-hub/pull/83) ([paxtonhare](https://github.com/paxtonhare))
- Quick start cancel run flow [\#69](https://github.com/marklogic/marklogic-data-hub/pull/69) ([gmarintes](https://github.com/gmarintes))
- Fix basic bugs [\#68](https://github.com/marklogic/marklogic-data-hub/pull/68) ([paxtonhare](https://github.com/paxtonhare))
- I stand corrected. There's a reason it's a war. [\#66](https://github.com/marklogic/marklogic-data-hub/pull/66) ([paxtonhare](https://github.com/paxtonhare))
- Fixed \#62 - added spring batch to run jobs [\#65](https://github.com/marklogic/marklogic-data-hub/pull/65) ([paxtonhare](https://github.com/paxtonhare))
- Fixed \#52 - create jar instead of war [\#64](https://github.com/marklogic/marklogic-data-hub/pull/64) ([paxtonhare](https://github.com/paxtonhare))
- 5 spec for plugins [\#63](https://github.com/marklogic/marklogic-data-hub/pull/63) ([paxtonhare](https://github.com/paxtonhare))
- added support for running MLCP using a dependency to MLCP jar instead… [\#61](https://github.com/marklogic/marklogic-data-hub/pull/61) ([gmarintes](https://github.com/gmarintes))
- Quick-Start Install and Uninstall [\#60](https://github.com/marklogic/marklogic-data-hub/pull/60) ([maeisabelle](https://github.com/maeisabelle))
- more changes to the plugin signature [\#59](https://github.com/marklogic/marklogic-data-hub/pull/59) ([paxtonhare](https://github.com/paxtonhare))
- fixing \#5 - updated spec for plugins [\#50](https://github.com/marklogic/marklogic-data-hub/pull/50) ([paxtonhare](https://github.com/paxtonhare))
- Quick start synching and ui [\#49](https://github.com/marklogic/marklogic-data-hub/pull/49) ([gmarintes](https://github.com/gmarintes))
- Add travis support [\#48](https://github.com/marklogic/marklogic-data-hub/pull/48) ([paxtonhare](https://github.com/paxtonhare))
- fixing \#30 - install now works [\#46](https://github.com/marklogic/marklogic-data-hub/pull/46) ([paxtonhare](https://github.com/paxtonhare))
- Quick-start synching, UI changes for messages, loading icon, etc. [\#43](https://github.com/marklogic/marklogic-data-hub/pull/43) ([maeisabelle](https://github.com/maeisabelle))
- fixing \#41 path for xquery modules [\#42](https://github.com/marklogic/marklogic-data-hub/pull/42) ([paxtonhare](https://github.com/paxtonhare))
- Quick Start Input flow and synching [\#37](https://github.com/marklogic/marklogic-data-hub/pull/37) ([maeisabelle](https://github.com/maeisabelle))
- \#33 - make input and canonical optional [\#35](https://github.com/marklogic/marklogic-data-hub/pull/35) ([paxtonhare](https://github.com/paxtonhare))
- Quick-Start Flows UI [\#32](https://github.com/marklogic/marklogic-data-hub/pull/32) ([maeisabelle](https://github.com/maeisabelle))
- Uninstall now working. [\#31](https://github.com/marklogic/marklogic-data-hub/pull/31) ([paxtonhare](https://github.com/paxtonhare))
- adding support for input and canonical in the dir tree [\#29](https://github.com/marklogic/marklogic-data-hub/pull/29) ([paxtonhare](https://github.com/paxtonhare))
- Quick start domains and flows [\#28](https://github.com/marklogic/marklogic-data-hub/pull/28) ([maeisabelle](https://github.com/maeisabelle))
- Added user plugin directory in setting up the Data Hub [\#27](https://github.com/marklogic/marklogic-data-hub/pull/27) ([maeisabelle](https://github.com/maeisabelle))
- Quick Start UI and configuration changes [\#26](https://github.com/marklogic/marklogic-data-hub/pull/26) ([maeisabelle](https://github.com/maeisabelle))
- \#24 - adding the backend code to support deploying a user's modules [\#25](https://github.com/marklogic/marklogic-data-hub/pull/25) ([paxtonhare](https://github.com/paxtonhare))
- Quick-start Flows and Collectors backend changes and minimal main page changes [\#19](https://github.com/marklogic/marklogic-data-hub/pull/19) ([maeisabelle](https://github.com/maeisabelle))
- finalizing Plugin API. [\#18](https://github.com/marklogic/marklogic-data-hub/pull/18) ([paxtonhare](https://github.com/paxtonhare))
- Quick start connecting to DataHub API [\#17](https://github.com/marklogic/marklogic-data-hub/pull/17) ([maeisabelle](https://github.com/maeisabelle))
- Data hub unit test fix [\#16](https://github.com/marklogic/marklogic-data-hub/pull/16) ([gmarintes](https://github.com/gmarintes))
- Quick start tomcat deployment and initial page [\#15](https://github.com/marklogic/marklogic-data-hub/pull/15) ([maeisabelle](https://github.com/maeisabelle))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
