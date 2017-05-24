# Change Log

## [v1.1.3](https://github.com/marklogic/marklogic-data-hub/tree/v1.1.3)

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

- Failed test : DataHubTest.testInstallUserModules [\#106](https://github.com/marklogic/marklogic-data-hub/issues/106)

**Closed issues:**

- Unable to run the harmonize flows [\#242](https://github.com/marklogic/marklogic-data-hub/issues/242)
- ML Version is unnaceptable [\#241](https://github.com/marklogic/marklogic-data-hub/issues/241)
- rename config to marklogic-config [\#239](https://github.com/marklogic/marklogic-data-hub/issues/239)
- Allow many developers to share a server, each with their own Data Hub [\#237](https://github.com/marklogic/marklogic-data-hub/issues/237)
- Change colors and icons to match other MarkLogic content/GUIs [\#236](https://github.com/marklogic/marklogic-data-hub/issues/236)
- Tracing UI [\#210](https://github.com/marklogic/marklogic-data-hub/issues/210)
- During install, list the artifacts being created [\#194](https://github.com/marklogic/marklogic-data-hub/issues/194)
- Performance tracing [\#193](https://github.com/marklogic/marklogic-data-hub/issues/193)
- Refactor the Spring Boot API [\#145](https://github.com/marklogic/marklogic-data-hub/issues/145)
- Support index configuration as a part of pushbutton deploy.  [\#10](https://github.com/marklogic/marklogic-data-hub/issues/10)

## [v1.0.0-beta.6](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-beta.6) (2016-06-20)
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v1.0.0-beta.5...v1.0.0-beta.6)

**Fixed bugs:**

- Error in writer caused exception with tracing [\#235](https://github.com/marklogic/marklogic-data-hub/issues/235)
- Need to specify collation in query in trace-lib.xqy [\#230](https://github.com/marklogic/marklogic-data-hub/issues/230)

**Closed issues:**

- Better gradle integration [\#232](https://github.com/marklogic/marklogic-data-hub/issues/232)
- isInstalled fails on 9 nightly [\#216](https://github.com/marklogic/marklogic-data-hub/issues/216)
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

- Enable Tracing in the Hub [\#199](https://github.com/marklogic/marklogic-data-hub/issues/199)
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

## [v1.0.0-alpha.1](https://github.com/marklogic/marklogic-data-hub/tree/v1.0.0-alpha.1) (2016-03-08)
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

- prepping for first release. [\#93](https://github.com/marklogic/marklogic-data-hub/pull/93) ([paxtonhare](https://github.com/paxtonhare))
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
