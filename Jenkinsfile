@Library('shared-libraries') _
import groovy.json.JsonSlurper
import groovy.json.JsonSlurperClassic
JIRA_ID="";
commitMessage="";
def prResponse="";
def prNumber;
def props;
githubAPIUrl="https://api.github.com/repos/marklogic/marklogic-data-hub"
def loadProperties() {
    node {
        checkout scm
        properties = new Properties()
        props.load(propertiesFile.newDataInputStream())
        echo "Immediate one ${properties.repo}"
    }
}
def dhflinuxTests(String mlVersion,String type){
    	script{
    		props = readProperties file:'data-hub/pipeline.properties';
    		copyRPM type,mlVersion
    		def dockerhost=setupMLDockerCluster 3
    		sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew marklogic-data-hub:test || true;sleep 10s;./gradlew ml-data-hub:test || true;sleep 10s;./gradlew web:test || true;sleep 10s;./gradlew marklogic-data-hub:testBootstrap || true;sleep 10s;./gradlew ml-data-hub:testFullCycle || true;"'
    		junit '**/TEST-*.xml'
    		commitMessage = sh (returnStdout: true, script:'''
    		curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
    		def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
    		def commit=slurper.message.toString().trim();
    		JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
    		JIRA_ID=JIRA_ID.split(" ")[0];
    		commitMessage=null;
    		//jiraAddComment comment: 'Jenkins rh7_cluster_9.0-Nightly Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
    	}
}
def dhfqsLinuxTests(String mlVersion,String type){
	script{
         copyRPM type,mlVersion
         setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
         sh(script:'''#!/bin/bash
            export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;
            export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;
            export M2_HOME=$MAVEN_HOME/bin;
            export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;
            cd $WORKSPACE/data-hub;
            rm -rf $GRADLE_USER_HOME/caches;
            ./gradlew clean;
            ./gradlew build -x test;
            nohup ./gradlew bootRun >> $WORKSPACE/bootRun.out &
            sleep 60s;
            nohup ./gradlew runUI >> $WORKSPACE/runUI.out &
            sleep 120s;
            cd web;
            ./node_modules/.bin/ng e2e --devServerTarget="" --suite all --base-url http://localhost:4200 || true;
         ''')
         junit '**/web/e2e/reports/*.xml'
         archiveArtifacts artifacts: 'data-hub/web/e2e/reports/*.html, data-hub/web/e2e/reports/*.xml, data-hub/web/e2e/reports/screenshots/*.png, data-hub/web/e2e/screenshoter-plugin/**/*, nohup.out'
	     commitMessage = sh (returnStdout: true, script:'''
	     curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
		 def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
		 def commit=slurper.message.toString().trim();
		 JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
		 JIRA_ID=JIRA_ID.split(" ")[0];
		 commitMessage=null;
		 //jiraAddComment comment: 'Jenkins qs_rh7_90-nightly Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
	}
}
def dhfWinTests(String mlVersion, String type){
    script{
        copyMSI type,mlVersion;
        def pkgOutput=bat(returnStdout:true , script: '''
	                    cd xdmp/src
	                    for /f "delims=" %%a in ('dir /s /b *.msi') do set "name=%%~a"
	                    echo %name%
	                    ''').trim().split();
	    def pkgLoc=pkgOutput[pkgOutput.size()-1]
	    gitCheckout 'ml-builds','https://github.com/marklogic/MarkLogic-Builds','master'
	    def bldOutput=bat(returnStdout:true , script: '''
        	           cd ml-builds/scripts/lib/
        	           CD
        	        ''').trim().split();
        def bldPath=bldOutput[bldOutput.size()-1]
        setupMLWinCluster bldPath,pkgLoc
        bat 'cd data-hub & gradlew.bat clean'
        bat 'cd data-hub & gradlew.bat marklogic-data-hub:test  || exit /b 0'
        bat 'cd data-hub & gradlew.bat ml-data-hub:test  || exit /b 0'
        bat 'cd data-hub & gradlew.bat web:test || exit /b 0'
        junit '**/TEST-*.xml'
        commitMessage = sh (returnStdout: true, script:'''
                            curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
        def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
        def commit=slurper.message.toString().trim();
        JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
        JIRA_ID=JIRA_ID.split(" ")[0];
        commitMessage=null;
         //jiraAddComment comment: 'Jenkins rh7_cluster_9.0-Nightly Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
    }
}
pipeline{
	agent none;
	options {
  	checkoutToSubdirectory 'data-hub'
  	skipStagesAfterUnstable()
  	buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '30', numToKeepStr: '')
	}
	environment{
	JAVA_HOME_DIR="~/java/jdk1.8.0_72"
	GRADLE_DIR="/.gradle"
	MAVEN_HOME="/usr/local/maven"
	DMC_USER     = credentials('MLBUILD_USER')
    DMC_PASSWORD= credentials('MLBUILD_PASSWORD')
	}
	parameters{ 
	string(name: 'Email', defaultValue: 'stadikon@marklogic.com,kkanthet@marklogic.com,sbalasub@marklogic.com,nshrivas@marklogic.com,ssambasu@marklogic.com,rrudin@marklogic.com,rdew@marklogic.com,aebadira@marklogic.com,mwooldri@marklogic.com', description: 'Who should I say send the email to?')
	}
	stages{
	    stage('Pre-Build-Check'){
	    when {
          			changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: '', title: '', url: ''
          			beforeAgent true
        }
	    agent { label 'dhfLinuxAgent'}
	    steps{
	    script{
	        if(!env.CHANGE_TITLE.startsWith("DHFPROD-")){
	            sh 'exit 1'

	        }
            def obj=new abortPrevBuilds();
            obj.abortPrevBuilds();

            }
	    }
	    post{
	        failure{
	            script{
                    def email;
                    if(env.CHANGE_AUTHOR){
                    	def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                    	 email=getEmailFromGITUser author
                    }else{
                    email=Email
                    }
                    sendMail email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/${JOB_BASE_NAME}/${BUILD_ID}  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Pipeline Failed as there is no JIRA ID. Please add JIRA ID to the PR Title',false,'NO JIRA ID for $BRANCH_NAME | pipeline Failed '
	            }
	        }
	    }
	    }
		stage('Build-datahub'){
		agent { label 'dhfLinuxAgent'}
			steps{
				script{
        props = readProperties file:'data-hub/pipeline.properties';
				if(env.CHANGE_TITLE){
				JIRA_ID=env.CHANGE_TITLE.split(':')[0];
				def transitionInput =[transition: [id: '41']]
				//jiraTransitionIssue idOrKey: JIRA_ID, input: transitionInput, site: 'JIRA'
				}
				}
				println(BRANCH_NAME)
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean --stacktrace;./gradlew build -x test;'
				archiveArtifacts artifacts: 'data-hub/marklogic-data-hub/build/libs/* , data-hub/ml-data-hub-plugin/build/libs/* , data-hub/web/build/libs/*', onlyIfSuccessful: true			}
				post{
                   failure {
                      println("Datahub Build FAILED")
                      script{
                      def email;
                    if(env.CHANGE_AUTHOR){
                    	def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                    	 email=getEmailFromGITUser author 
                    }else{
                    email=Email
                    }
                      sendMail email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/${JOB_BASE_NAME}/${BUILD_ID}  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Pipeline Failed at the stage while building datahub. Please fix the issues',false,'Data Hub Build for $BRANCH_NAME Failed'
                      }
                  }
                  }
		}
		stage('Unit-Tests'){
		agent { label 'dhfLinuxAgent'}
			steps{
			script{
			 props = readProperties file:'data-hub/pipeline.properties';
				 copyRPM 'Release','10.0-3'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;set +e;./gradlew clean;./gradlew marklogic-data-hub:test || true;sleep 10s;./gradlew ml-data-hub:test || true;./gradlew web:test || true;'
				junit '**/TEST-*.xml'

				if(env.CHANGE_TITLE){
				JIRA_ID=env.CHANGE_TITLE.split(':')[0]
				jiraAddComment comment: 'Jenkins Unit Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
				}
			}
			post{
				  always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("Unit Tests Completed")
                    script{
                    def email;
                    if(env.CHANGE_AUTHOR){
                    def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                     email=getEmailFromGITUser author
                    }else{
                    	email=Email
                    }
                    sendMail email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the Unit Tests Passed on $BRANCH_NAME and the next stage is Code-review.',false,'Unit Tests for  $BRANCH_NAME Passed'
                    }
                   }
                   unstable {
                      println("Unit Tests Failed")
                      sh 'mkdir -p MLLogs;cp -r /var/opt/MarkLogic/Logs/* $WORKSPACE/MLLogs/'
                      archiveArtifacts artifacts: 'MLLogs/**/*'
                      script{
                      def email;
                    if(env.CHANGE_AUTHOR){
                    	def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                    	 email=getEmailFromGITUser author 
                    }else{
                    email=Email
                    }
                      sendMail email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the  Unit Tests Failed on  $BRANCH_NAME. Please look into the issues and fix it.',false,'Unit Tests for $BRANCH_NAME Failed'
                      }
                  }
                  }
		}
		stage('code-review'){
		when {
  			 allOf {
    changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: 'feature/5.3.0', title: '', url: ''
  }
  			beforeAgent true
		}
		agent {label 'dhmaster'};
		steps{
		script{
		    props = readProperties file:'data-hub/pipeline.properties';
			if(env.CHANGE_TITLE.split(':')[1].contains("Automated PR")){
				println("Automated PR")
				sh 'exit 0'
			}else{
			script{
                    withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
                  def  reviewersList = sh (returnStdout: true, script:'''
                   curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID/requested_reviewers
                   ''')
                    def slurper = new JsonSlurperClassic().parseText(reviewersList.toString().trim())
                    def emailList="";
                    for(def user:slurper.users){
                        email=getEmailFromGITUser user.login;
                        emailList+=email+',';
                    }
                      sendMail emailList,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n $BRANCH_NAME is waiting for the code-review to complete. Please click on proceed button if all the reviewers approved the code here. \n\n ${BUILD_URL}input ',false,'Waiting for code review $BRANCH_NAME '
                     
                 }
			}
			try{
			 timeout(time:60, unit:'MINUTES') {
            input message:'Review Done?'
        }
        }catch(err){
        currentBuild.result = "SUCCESS"
        }
        }
        }
		}
		}
		stage('PR'){
		when {
  			changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: 'feature/5.3.0', title: '', url: ''
  			beforeAgent true
		}
		agent {label 'dhmaster'};
			steps{
			retry(5){
				withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
				script{
				    props = readProperties file:'data-hub/pipeline.properties';
					JIRA_ID=env.CHANGE_TITLE.split(':')[0]
    				def response = sh (returnStdout: true, script:'''curl -u $Credentials  --header "application/vnd.github.merge-info-preview+json" "'''+githubAPIUrl+'''/pulls/$CHANGE_ID" | grep '"mergeable_state":' | cut -d ':' -f2 | cut -d ',' -f1 | tr -d '"' ''')
    				response=response.trim();
    				println(response)
    				if(response.equals("clean")){
    					println("merging can be done")
    					sh "curl -o - -s -w \"\n%{http_code}\n\" -X PUT -d '{\"commit_title\": \"$JIRA_ID: merging PR\", \"merge_method\": \"rebase\"}' -u $Credentials "+ githubAPIUrl+"/pulls/$CHANGE_ID/merge | tail -2 > mergeResult.txt"
    					def mergeResult = readFile('mergeResult.txt').trim()
    					if(mergeResult=="200"){
    						println("Merge successful")
    					}else{
    						println("Merge Failed")
                sh 'exit 1'
    					}
    				}else if(response.equals("blocked")){
    					println("retry blocked");
    					withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
                  def  reviewersList = sh (returnStdout: true, script:'''
                   curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID/requested_reviewers
                   ''')
                    def slurper = new JsonSlurperClassic().parseText(reviewersList.toString().trim())
                    def emailList="";
                    for(def user:slurper.users){
                        email=getEmailFromGITUser user.login;
                        emailList+=email+',';
                    }
                      sendMail emailList,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n $BRANCH_NAME is waiting for the code-review to complete. Please click on proceed button if all the reviewers approved the code here. \n\n ${BUILD_URL}input ',false,'Waiting for code review $BRANCH_NAME '
                     
                 }
    					sleep time: 30, unit: 'MINUTES'
    					throw new Exception("Waiting for all the status checks to pass");
    				}else if(response.equals("unstable")){
    					println("retry unstable")
    					sh "curl -o - -s -w \"\n%{http_code}\n\" -X PUT -d '{\"commit_title\": \"$JIRA_ID: merging PR\", \"merge_method\": \"rebase\"}' -u $Credentials  "+githubAPIUrl+"/pulls/$CHANGE_ID/merge | tail -2 > mergeResult.txt"
    					def mergeResult = readFile('mergeResult.txt').trim()
              if(mergeResult=="200"){
                println("Merge successful")
              }else{
                println("Merge Failed")
                sh 'exit 1'
              }
    					println("Result is"+ mergeResult)
    				}else{
    					println("merging not possible")
    					currentBuild.result = "FAILURE"
    					sh 'exit 1';
    				}
				}
				}
				}
			}
			post{
                  success {
                    println("Merge Successful")
                    script{
                    def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                    def email=getEmailFromGITUser author 
					sendMail email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n $BRANCH_NAME is merged and it will run the end to end tests in the next stage',false,'  $BRANCH_NAME is Merged'
					}
                   }
                   failure {
                      println("Retried 5times")
                      script{
                    def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                    def email=getEmailFromGITUser author 
                      sendMail email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n $BRANCH_NAME is not merged into the target branch. Please check the merge status of the PR if there are any merge conflicts or if the code is not reviewed. \n\n Click on the link Restart PR below to retry merge if the merge state is clean i.e., Code is reviewed and there are no merge conflicts with the target branch. \n\n ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID',false,' $BRANCH_NAME Cannot be Merged'
                      }
                  }
                  }
		}
		stage('rh7-singlenode'){
		when {
  			branch 'feature/5.3.0'
			}
			agent { label 'dhfLinuxAgent'}
			steps{
			 script{
                props = readProperties file:'data-hub/pipeline.properties';
				copyRPM 'Release','9.0-11'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew marklogic-data-hub:test -Dorg.gradle.jvmargs=-Xmx1g || true;sleep 10s;./gradlew ml-data-hub:test || true;sleep 10s;./gradlew web:test || true;sleep 10s;./gradlew marklogic-data-hub:testBootstrap || true;sleep 10s;./gradlew ml-data-hub:testFullCycle || true;'
				junit '**/TEST-*.xml'
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins rh7-singlenode Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("End-End Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests of the branch $BRANCH_NAME passed and the next stage is to run all the end-end tests on multiple platforms in parallel',false,'rh7-singlenode Tests for $BRANCH_NAME Passed'
                    
                   }
                   unstable {
                      println("End-End Tests Failed")
                      sh 'mkdir -p MLLogs;cp -r /var/opt/MarkLogic/Logs/* $WORKSPACE/MLLogs/'
                      archiveArtifacts artifacts: 'MLLogs/**/*'
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7-singlenode Tests for  $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('Merge PR to Integration Branch'){
		when {
  			branch 'FeatureBranch'
  			beforeAgent true
		}
		agent {label 'dhmaster'}
		steps{
		withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
		script{
		    props = readProperties file:'data-hub/pipeline.properties';
			//JIRA_ID=env.CHANGE_TITLE.split(':')[0]
			prResponse = sh (returnStdout: true, script:'''
			curl -u $Credentials  -X POST -H 'Content-Type:application/json' -d '{\"title\": \"Automated PR for Integration Branch\" , \"head\": \"FeatureBranch\" , \"base\": \"IntegrationBranch\" }' '''+githubAPIUrl+'''/pulls ''')
			println(prResponse)
			def slurper = new JsonSlurper().parseText(prResponse)
			println(slurper.number)
			prNumber=slurper.number;
			}
			}
			withCredentials([usernameColonPassword(credentialsId: 'a0ec09aa-f339-44de-87c4-1a4936df44f5', variable: 'Credentials')]) {
                    sh "curl -u $Credentials  -X POST  -d '{\"event\": \"APPROVE\"}' "+githubAPIUrl+"/pulls/${prNumber}/reviews"
                }
             withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
             script{
              props = readProperties file:'data-hub/pipeline.properties';
             sh "curl -o - -s -w \"\n%{http_code}\n\" -X PUT -d '{\"commit_title\": \"$JIRA_ID: Merge pull request\", \"merge_method\": \"rebase\"}' -u $Credentials  "+githubAPIUrl+"/pulls/${prNumber}/merge | tail -2 > mergeResult.txt"
    					def mergeResult = readFile('mergeResult.txt').trim()
    					if(mergeResult=="200"){
    						println("Merge successful")
    					}else{
    						println("Merge Failed")
                sh 'exit 1'
    					}
    			}
             }

		}
		post{
                  success {
                    println("Automated PR For Integration branch Completed")
                   }
                   failure {
                      println("Creation of Automated PR Failed")
                     
                  }
                  }
		}
		stage('Linux Core Parallel Execution'){
		when {
  			branch props['ExecutionBranch']
  			beforeAgent true
		}
		parallel{
		stage('rh7_cluster_10.0-Nightly'){
			agent { label 'dhfLinuxAgent'}
			steps{
			dhflinuxTests("10.0","Latest")
			}
			post{
				 always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("rh7_cluster_10.0-Nightly Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on rh7 cluster 10.0-Nightly of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'rh7_cluster_10.0-Nightly Tests $BRANCH_NAME Passed'
                    // sh './gradlew publish'
                   }
                   unstable {
                      println("rh7_cluster_10.0-Nightly Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 10.0-Nightly rh7 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7_cluster_10.0-Nightly Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('rh7_cluster_9.0-Nightly'){
			agent { label 'dhfLinuxAgent'}
			steps{
	        dhflinuxTests("9.0","Latest")
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("rh7_cluster_9.0-Nightly Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on rh7 cluster 9.0-Nightly of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'rh7_cluster_9.0-Nightly Tests for $BRANCH_NAME Passed'
                   }
                   unstable {
                      println("rh7_cluster_9.0-Nightly Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 9.0-Nightly rh7 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7_cluster_9.0-Nightly Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('rh7_cluster_9.0-11'){
			agent { label 'dhfLinuxAgent'}
			steps{ 
		    dhflinuxTests("9.0-11","Release")
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("rh7_cluster_9.0-11 Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on rh7 cluster 9.0-11 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'rh7_cluster_9.0-11 Tests for $BRANCH_NAME Passed'
                   }
                   unstable {
                      println("rh7_cluster_9.0-11 Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 9.0-11 rh7 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7_cluster_9.0-11 Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
         stage('rh7_cluster_10.0-3'){
               agent { label 'dhfLinuxAgent'}
               steps{
                    dhflinuxTests("10.0-3","Release");
               }
               post{
                 always{
                     sh 'rm -rf $WORKSPACE/xdmp'
                   }
                           success {
                             println("rh7_cluster_10.0-3 Tests Completed")
                             sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on rh7 cluster 10.0-3 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'rh7_cluster_10.0-3 Tests for $BRANCH_NAME Passed'
                            }
                            unstable {
                               println("rh7_cluster_10.0-3 Tests Failed")
                               sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 10.0-3 rh7 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7_cluster_10.0-3 Tests for $BRANCH_NAME Failed'
                           }
                           }
             }
		}
		post{
			success{
				node('dhfLinuxAgent'){
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;cp ~/.gradle/gradle.properties $GRADLE_USER_HOME;chmod 777  $GRADLE_USER_HOME/gradle.properties;./gradlew publish'
				}
			}
		}
		}
		stage('example projects parallel'){
		when {
                 branch props['ExecutionBranch']
                 beforeAgent true
              }
            parallel{
            stage('dh5-example'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub/examples/dh-5-example;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew -i hubInit -Ptesting;./gradlew -i mlDeploy -Ptesting;./gradlew hubRunFlow -PflowName=ingestion_only-flow;./gradlew hubRunFlow -PflowName=ingestion_mapping-flow;./gradlew hubRunFlow -PflowName=ingestion_mapping_mastering-flow;"'
                        }
                 }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n  dh5example ran successfully on the  branch $BRANCH_NAME  next stage is to merge it to run quickstart tests',false,' dh5-example for $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n dh5example Failed on the  branch $BRANCH_NAME.',false,'dh5-example for $BRANCH_NAME Failed'
                 }
                 }
            }
            stage('dhf-customhook'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub/examples/dhf5-customhook;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew -i hubInit -Ptesting;./gradlew -i mlDeploy -Ptesting;./gradlew hubRunFlow -PflowName=LoadOrders;./gradlew hubRunFlow -PflowName=LoadOrders;"'
                        }
                     }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n  dh5-customhook ran successfully on the  branch $BRANCH_NAME  next stage is to merge it to run quickstart tests',false,' dh5-customhook for $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n dh5-customhook Failed on the  branch $BRANCH_NAME.',false,'dh5-customhook for $BRANCH_NAME Failed'
                 }
                 }


            }
            stage('mapping-example'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub/examples/mapping-example;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew -i hubInit -Ptesting;./gradlew -i mlDeploy -Ptesting;./gradlew hubRunFlow -PflowName=jsonToJson;./gradlew hubRunFlow -PflowName=jsonToXml;./gradlew hubRunFlow -PflowName=jsonToXml;./gradlew hubRunFlow -PflowName=xmlToXml;"'
                        }
                 }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n  mapping-example ran successfully on the  branch $BRANCH_NAME  next stage is to merge it to run quickstart tests',false,' mapping-example for $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n mapping-example Failed on the  branch $BRANCH_NAME.',false,'mapping-example for $BRANCH_NAME Failed'
                 }
                 }
            }
            stage('smart-mastering-complete'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub/examples/smart-mastering-complete;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew -i hubInit -Ptesting;./gradlew -i mlDeploy -Ptesting;./gradlew hubRunFlow -PflowName=persons;"'
                        }
                 }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n  smart-mastering-complete ran successfully on the  branch $BRANCH_NAME  next stage is to merge it to run quickstart tests',false,'smart-mastering-complete for $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n smart-mastering-complete Failed on the  branch $BRANCH_NAME.',false,'smart-mastering-complete for $BRANCH_NAME Failed'
                 }
                 }
            }
            }


		}
		stage('quick start linux parallel'){
		when {
          			branch props['ExecutionBranch']
          			beforeAgent true
        		}
		parallel{
		stage('qs_rh7_90-nightly'){
			agent { label 'lnx-dhf-jenkins-slave-2'}
			steps{
			    dhfqsLinuxTests("9.0","Latest")
			}
			post{

                  success {
                    println("qs_rh7_90-nightly Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End quick start tests on Rh7 90-nightly of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'qs_rh7_90-nightly Tests for $BRANCH_NAME Passed'
                   }
                   unstable {
                      println("qs_rh7_90-nightly Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End  quick start 90-nightly tests of the branch $BRANCH_NAME on rh7 failed. Please fix the tests and create a PR or create a bug for the failures.',false,'qs_rh7_90-nightly Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('qs_rh7_10-nightly'){
        			agent { label 'lnx-dhf-jenkins-slave-2'}
        			steps{
        			 dhfqsLinuxTests("10.0","Latest")
        			}
        			post{

                          success {
                            println("qs_rh7_10-nightly Tests Completed")
                            sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End quick start tests on Rh7 10-nightly of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'qs_rh7_10-nightly Tests for $BRANCH_NAME Passed'
                           }
                           unstable {
                              println("qs_rh7_10-nightly Tests Failed")
                              sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End  quick start 10-nightly tests of the branch $BRANCH_NAME on rh7 failed. Please fix the tests and create a PR or create a bug for the failures.',false,'qs_rh7_10-nightly Tests for $BRANCH_NAME Failed'
                          }
                          }
        		}
        stage('qs_rh7_90-release'){
        			agent { label 'lnx-dhf-jenkins-slave-2'}
        			steps{
                     dhfqsLinuxTests("9.0-11","Release")
        			}
        			post{

                          success {
                            println("qs_rh7_90-release Tests Completed")
                            sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End quick start tests on Rh7 90-nightly of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'qs_rh7_90-release Tests for $BRANCH_NAME Passed'
                           }
                           unstable {
                              println("qs_rh7_90-release Tests Failed")
                              sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End  quick start 90-nightly tests of the branch $BRANCH_NAME on rh7 failed. Please fix the tests and create a PR or create a bug for the failures.',false,'qs_rh7_90-release Tests for $BRANCH_NAME Failed'
                          }
                          }
        		}
        		stage('qs_rh7_10-release'){
                			agent { label 'lnx-dhf-jenkins-slave-2'}
                			steps{
                                 dhfqsLinuxTests("10.0-3","Release")
                			}
                			post{

                                  success {
                                    println("qs_rh7_10-release Tests Completed")
                                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End quick start tests on Rh7 10-release of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'qs_rh7_10-release Tests for $BRANCH_NAME Passed'
                                   }
                                   unstable {
                                      println("qs_rh7_10-release Tests Failed")
                                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End  quick start 10-release tests of the branch $BRANCH_NAME on rh7 failed. Please fix the tests and create a PR or create a bug for the failures.',false,'qs_rh7_10-release Tests for $BRANCH_NAME Failed'
                                  }
                                  }
                		}
		}
		}
		stage('Windows Core Parallel'){
		when {
          			branch props['ExecutionBranch']
          			beforeAgent true
        		}
		    parallel{
		stage('w12_SN_9.0-Nightly'){
			agent { label 'dhfWinagent'}
			steps{
			    dhfWinTests("9.0","Latest")
			}
			post{
				always{
				  	 bat 'RMDIR /S/Q xdmp'
				  }
                  success {
                    println("w12_SN_9.0-nightly Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on Windows SN on latest 90 nightly server build of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'w12_SN_90_nightly on latest server build Tests for $BRANCH_NAME Passed'
                   }
                   unstable {
                      println("w12_SN_9.0-nightly Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on Windows SN latest 90 nightly server build w2k12 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'w12_SN_90_nightly Tests on latest server build for $BRANCH_NAME Failed'
                  }
                  }
		}
        stage('w12_SN_10.0-Nightly'){
			agent { label 'dhfWinagent'}
			steps{
			    dhfWinTests("10.0","Latest")
			}
			post{
				always{
				  	 bat 'RMDIR /S/Q xdmp'
				  }
                  success {
                    println("w12_SN_10.0-nightly Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on Windows SN on latest 10 nightly server build of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'w12_SN_10_nightly on latest server build Tests for $BRANCH_NAME Passed'
                   }
                   unstable {
                      println("w12_SN_10.0-nightly Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on Windows SN latest 10 nightly server build w2k12 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'w12_SN_10_nightly Tests on latest server build for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('w12_SN_9.0-11'){
			agent { label 'dhfWinagent'}
			steps{
                dhfWinTests("9.0-11","Release")
			}
			post{
				always{
                       bat 'RMDIR /S/Q xdmp'
				  }
                  success {
                    println("w12_SN_9.0-11 Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on W2k12 SN 9.0-11 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'w12_SN_9.0-11 Tests for $BRANCH_NAME Passed'
                   }
                   unstable {
                      println("w12_SN_9.0-11 Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 9.0-11 w2k12 SN failed. Please fix the tests and create a PR or create a bug for the failures.',false,'w12_SN_9.0-11 Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('w12_cluster_10.0-3'){
			agent { label 'dhfWinCluster'}
			steps{
                    script{
                        copyMSI "Release","10.0-3";
                        def pkgOutput=bat(returnStdout:true , script: '''
                	                    cd xdmp/src
                	                    for /f "delims=" %%a in ('dir /s /b *.msi') do set "name=%%~a"
                	                    echo %name%
                	                    ''').trim().split();
                	    def pkgLoc=pkgOutput[pkgOutput.size()-1]
                	    gitCheckout 'ml-builds','https://github.com/marklogic/MarkLogic-Builds','master'
                	    def bldOutput=bat(returnStdout:true , script: '''
                        	           cd ml-builds/scripts/lib/
                        	           CD
                        	        ''').trim().split();
                        def bldPath=bldOutput[bldOutput.size()-1]
                        setupMLWinCluster bldPath,pkgLoc,"w2k16-10-dhf-2,w2k16-10-dhf-3"
                        bat 'cd data-hub & gradlew.bat clean'
                        bat 'cd data-hub & gradlew.bat marklogic-data-hub:test  || exit /b 0'
                        bat 'cd data-hub & gradlew.bat ml-data-hub:test  || exit /b 0'
                        bat 'cd data-hub & gradlew.bat web:test || exit /b 0'
                        junit '**/TEST-*.xml'
                        commitMessage = sh (returnStdout: true, script:'''
                                            curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
                        def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
                        def commit=slurper.message.toString().trim();
                        JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
                        JIRA_ID=JIRA_ID.split(" ")[0];
                        commitMessage=null;
                         //jiraAddComment comment: 'Jenkins rh7_cluster_9.0-Nightly Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
                    }
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("w12_cluster_10.0-3 Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on W2k12 cluster 10.0-3 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'w12_cluster_10.0-3 Tests for $BRANCH_NAME Passed'
                   }
                   unstable {
                      println("w12_cluster_10.0-3 Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 10.0-3 w2k12 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'w12_cluster_10.0-3 Tests for $BRANCH_NAME Failed'
                  }
                  }
		}

		    }
		}
		stage('Merge PR to Release Branch'){
		when {
  			branch 'develop'
  			beforeAgent true
		}
		agent {label 'dhmaster'}
		steps{
		withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
		script{
			//JIRA_ID=env.CHANGE_TITLE.split(':')[0]
			prResponse = sh (returnStdout: true, script:'''
			curl -u $Credentials  -X POST -H 'Content-Type:application/json' -d '{\"title\": \"Automated PR for Release Branch\" , \"head\": \"develop\" , \"base\": \"'''+props['ReleaseBranch']+'''\" }' '''+githubAPIUrl+'''/pulls ''')
			println(prResponse)
			def slurper = new JsonSlurper().parseText(prResponse)
			println(slurper.number)
			prNumber=slurper.number;
			}
			}
			withCredentials([usernameColonPassword(credentialsId: 'a0ec09aa-f339-44de-87c4-1a4936df44f5', variable: 'Credentials')]) {
                    sh "curl -u $Credentials  -X POST  -d '{\"event\": \"APPROVE\"}' "+githubAPIUrl+"/pulls/${prNumber}/reviews"
                }
                withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
              script{
             sh "curl -o - -s -w \"\n%{http_code}\n\" -X PUT -d '{\"commit_title\": \"$JIRA_ID: Merge pull request\", \"merge_method\": \"rebase\"}' -u $Credentials  "+githubAPIUrl+"/pulls/${prNumber}/merge | tail -2 > mergeResult.txt"
    					def mergeResult = readFile('mergeResult.txt').trim()
    					if(mergeResult=="200"){
    						println("Merge successful")
    					}else{
    						println("Merge Failed")
                sh 'exit 1'
    					}
    			}
             }

		}
		post{
                  success {
                    println("Automated PR For Release branch created")
           
                   }
                   failure {
                      println("Creation of Automated PR Failed")
                  }
                  }
		}
		stage('Sanity Tests'){
			when {
  			branch props['ReleaseBranch']
  			beforeAgent true
		}
			agent { label 'dhfLinuxAgent'}
			steps{
			script{
			    props = readProperties file:'data-hub/pipeline.properties';
				copyRPM 'Release','10.0-3'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;./gradlew clean;./gradlew marklogic-data-hub:test || true;sleep 10s;./gradlew ml-data-hub:test || true;sleep 10s;./gradlew web:test || true;'
				junit '**/TEST-*.xml'
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins Sanity Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("Sanity Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the sanity tests of the branch $BRANCH_NAME passed and next stage is to release',false,'Sanity Tests for $BRANCH_NAME Passed'
                    script{
						def transitionInput =[transition: [id: '31']]
						//JIRA_ID=env.CHANGE_TITLE.split(':')[0]
						//jiraTransitionIssue idOrKey: JIRA_ID, input: transitionInput, site: 'JIRA'
						}
                    sendMail Email,'Run the release pipeline to release Datahub',false,'Datahub is ready for Release'

                   }
                   unstable {
                      println("Sanity Tests Failed")
                      sh 'mkdir -p MLLogs;cp -r /var/opt/MarkLogic/Logs/* $WORKSPACE/MLLogs/'
                      archiveArtifacts artifacts: 'MLLogs/**/*'
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the Sanity tests of the branch $BRANCH_NAME on  failed. Please fix the tests and create a PR or create a bug for the failures.',false,'Sanity Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
	}
}
