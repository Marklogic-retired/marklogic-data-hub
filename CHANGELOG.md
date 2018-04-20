# Change Log

## [v2.0.4](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.4) (2018-02-13)
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.3...v2.0.4)

**Implemented enhancements:**

- Need ability to specify cluster hostnames in configuration, override automatic host detection [\#662](https://github.com/marklogic/marklogic-data-hub/issues/662)

**Fixed bugs:**

- Collector throws null pointer exception when there is nothing to process [\#735](https://github.com/marklogic/marklogic-data-hub/issues/735)
- SSL not working with collector [\#734](https://github.com/marklogic/marklogic-data-hub/issues/734)
- Browse Data Entities Only Error [\#726](https://github.com/marklogic/marklogic-data-hub/issues/726)
- Setting up QuickStart UI takes me to the update screen, then vicious cycle [\#698](https://github.com/marklogic/marklogic-data-hub/issues/698)
- Performance example gradle hubinit task throws a directory error on windows [\#674](https://github.com/marklogic/marklogic-data-hub/issues/674)
- DataMovementServices is holdover from DHF 1.0 [\#613](https://github.com/marklogic/marklogic-data-hub/issues/613)
- Quickstart runs in 2.0 mode only for version 9, not \> 9.x [\#591](https://github.com/marklogic/marklogic-data-hub/issues/591)

**Closed issues:**

- Put min ML version in docs and error message [\#229](https://github.com/marklogic/marklogic-data-hub/issues/229)

**Merged pull requests:**

- 203 fixes [\#736](https://github.com/marklogic/marklogic-data-hub/pull/736) ([paxtonhare](https://github.com/paxtonhare))
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

## [v2.0.3](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.3) (2018-01-30)
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.2...v2.0.3)

**Implemented enhancements:**

- Allow me to set custom SSL Context and Hostname verifiers  [\#647](https://github.com/marklogic/marklogic-data-hub/issues/647)
- Stream uris list [\#633](https://github.com/marklogic/marklogic-data-hub/issues/633)
- Deprecate ML8 support [\#618](https://github.com/marklogic/marklogic-data-hub/issues/618)
- MLCP options: Add ability to select individual files [\#413](https://github.com/marklogic/marklogic-data-hub/issues/413)
- Long collection names wrap \(ugly\) [\#409](https://github.com/marklogic/marklogic-data-hub/issues/409)

**Fixed bugs:**

- Dollar \($\) sign on title and version on final document [\#704](https://github.com/marklogic/marklogic-data-hub/issues/704)
- Quickstart doesn't have "Delimited Text Options" anymore, the documentation and tutorial should be changed [\#683](https://github.com/marklogic/marklogic-data-hub/issues/683)
- Unable to load data on Input Flows [\#682](https://github.com/marklogic/marklogic-data-hub/issues/682)
- double parent XML elements created when serializing complex type  [\#619](https://github.com/marklogic/marklogic-data-hub/issues/619)
- deleting an entity property causes quickstart to forget the existing primary key/range index/required field settings [\#616](https://github.com/marklogic/marklogic-data-hub/issues/616)
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
- publish javadocs to a website [\#212](https://github.com/marklogic/marklogic-data-hub/issues/212)

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
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.1...v2.0.2)

**Implemented enhancements:**

- Delete old jobs [\#534](https://github.com/marklogic/marklogic-data-hub/issues/534)

**Fixed bugs:**

- Main is executed in staging db even when setting -PsourceDB=Final  [\#565](https://github.com/marklogic/marklogic-data-hub/issues/565)
- Blank harmonization page [\#558](https://github.com/marklogic/marklogic-data-hub/issues/558)

**Merged pull requests:**

- Feature/bug 558 [\#598](https://github.com/marklogic/marklogic-data-hub/pull/598) ([dmcassel](https://github.com/dmcassel))
- fixed \#565 [\#596](https://github.com/marklogic/marklogic-data-hub/pull/596) ([paxtonhare](https://github.com/paxtonhare))
- adding the userOrg property [\#586](https://github.com/marklogic/marklogic-data-hub/pull/586) ([dmcassel](https://github.com/dmcassel))
- fixed \#547 [\#568](https://github.com/marklogic/marklogic-data-hub/pull/568) ([paxtonhare](https://github.com/paxtonhare))
- Feature/delete old jobs [\#566](https://github.com/marklogic/marklogic-data-hub/pull/566) ([dmcassel](https://github.com/dmcassel))

## [v2.0.1](https://github.com/marklogic/marklogic-data-hub/tree/v2.0.1) (2017-11-20)
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/2.0.1...v2.0.1)

## [2.0.1](https://github.com/marklogic/marklogic-data-hub/tree/2.0.1) (2017-11-20)
[Full Changelog](https://github.com/marklogic/marklogic-data-hub/compare/v2.0.0...2.0.1)

**Implemented enhancements:**

- Harmonize Writer could benefit from more context like $type [\#564](https://github.com/marklogic/marklogic-data-hub/issues/564)
- Update hubCreateEntity task to use ES too [\#547](https://github.com/marklogic/marklogic-data-hub/issues/547)
- Update 2.x version checker to omit pre-release version [\#485](https://github.com/marklogic/marklogic-data-hub/issues/485)
- Browse Data: Reset search when changing databases [\#535](https://github.com/marklogic/marklogic-data-hub/issues/535)

**Fixed bugs:**

- Error running sample product-catalog example [\#560](https://github.com/marklogic/marklogic-data-hub/issues/560)
- Entity definition partially written, everything hosed [\#435](https://github.com/marklogic/marklogic-data-hub/issues/435)
- Harmonization code generation fails for a relationships where entities hold mutual references [\#544](https://github.com/marklogic/marklogic-data-hub/issues/544)
- Out of memory when flow has too many errors [\#543](https://github.com/marklogic/marklogic-data-hub/issues/543)
- admin role required for quick start login [\#542](https://github.com/marklogic/marklogic-data-hub/issues/542)
- mlWatch broken for deploying REST extensions  [\#538](https://github.com/marklogic/marklogic-data-hub/issues/538)
- Options not deployed for Final [\#529](https://github.com/marklogic/marklogic-data-hub/issues/529)

**Closed issues:**

- REST search options deployed to wrong location in modules db [\#567](https://github.com/marklogic/marklogic-data-hub/issues/567)
- Add e2e tests for Quickstart [\#555](https://github.com/marklogic/marklogic-data-hub/issues/555)
- Getting MISSING\_FLOW error when invoking from DMSDK [\#552](https://github.com/marklogic/marklogic-data-hub/issues/552)
- Add support for mlcp -input\_file\_pattern [\#550](https://github.com/marklogic/marklogic-data-hub/issues/550)
- Browse Data: not obvious that I needed to click Search [\#530](https://github.com/marklogic/marklogic-data-hub/issues/530)
- Add detailed documentation on traces [\#527](https://github.com/marklogic/marklogic-data-hub/issues/527)
- incorrect scaffolding [\#525](https://github.com/marklogic/marklogic-data-hub/issues/525)
- Issue upgrade from rc1 to rc2 [\#511](https://github.com/marklogic/marklogic-data-hub/issues/511)
- Create Performance Sample [\#492](https://github.com/marklogic/marklogic-data-hub/issues/492)
- MLCP fails if no "jobId" parameter specified even with trace off [\#426](https://github.com/marklogic/marklogic-data-hub/issues/426)
- Test deploy against ssl enabled server [\#417](https://github.com/marklogic/marklogic-data-hub/issues/417)
- Epic - error handling [\#289](https://github.com/marklogic/marklogic-data-hub/issues/289)
- Add README.md at top of examples folder [\#549](https://github.com/marklogic/marklogic-data-hub/issues/549)
- Quickstart build fails [\#541](https://github.com/marklogic/marklogic-data-hub/issues/541)
- hubPreinstallCheck, AdminConfig ignores SSL setting [\#539](https://github.com/marklogic/marklogic-data-hub/issues/539)
- Enhance command line to build entity indexes via entity JSON descriptors [\#526](https://github.com/marklogic/marklogic-data-hub/issues/526)

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
- Prevent install if ports are in use [\#477](https://github.com/marklogic/marklogic-data-hub/issues/477)

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

- Cannot specify default permissions for data-hub-modules db [\#434](https://github.com/marklogic/marklogic-data-hub/issues/434)

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
