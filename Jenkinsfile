@Library('shared-libraries') _
import groovy.json.JsonSlurper
import groovy.json.JsonSlurperClassic
import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException
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
    		sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew marklogic-data-hub:test || true;sleep 10s;./gradlew ml-data-hub:test || true;sleep 10s;./gradlew web:test || true;sleep 10s;./gradlew one-ui:test || true;sleep 10s; ./gradlew marklogic-data-hub:testBootstrap || true;sleep 10s;./gradlew ml-data-hub:testFullCycle || true;sleep 10s;./gradlew one-ui:testFullCycle || true;"'
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
        bat 'cd data-hub & gradlew.bat one-ui:test || exit /b 0'
        junit '**/TEST-*.xml'
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
	JAVA_HOME_DIR="~/java/jdk-11.0.2"
	GRADLE_DIR="/.gradle"
	MAVEN_HOME="/usr/local/maven"
	DMC_USER     = credentials('MLBUILD_USER')
    DMC_PASSWORD= credentials('MLBUILD_PASSWORD')
	}
	parameters{
	string(name: 'Email', defaultValue: 'stadikon@marklogic.com,kkanthet@marklogic.com,sbalasub@marklogic.com,nshrivas@marklogic.com,ssambasu@marklogic.com,rrudin@marklogic.com,rdew@marklogic.com,mwooldri@marklogic.com,rvudutal@marklogic.com,asonvane@marklogic.com,ban@marklogic.com,hliu@marklogic.com,tisangul@marklogic.com,Vasu.Gourabathina@marklogic.com,Sanjeevani.Vishaka@marklogic.com,Inder.Sabharwal@marklogic.com', description: 'Who should I say send the email to?')
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
                    sendMail email,'<h3>Pipeline Failed as there is no JIRA ID. Please add JIRA ID to the <a href=${CHANGE_URL}>PR Title</a></h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'NO JIRA ID for $BRANCH_NAME | pipeline Failed  '
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
				archiveArtifacts artifacts: 'data-hub/marklogic-data-hub/build/libs/* , data-hub/ml-data-hub-plugin/build/libs/* , data-hub/web/build/libs/* , data-hub/one-ui/build/libs/*', onlyIfSuccessful: true			}
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
                     sendMail email,'<h3>Pipeline Failed at the stage while building datahub. Please fix the issues</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'Data Hub Build for $BRANCH_NAME Failed'
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
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;set +e;./gradlew clean;./gradlew marklogic-data-hub:testAcceptance || true;sleep 10s;./gradlew ml-data-hub:test || true;./gradlew web:test || true;./gradlew one-ui:test || true;'
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
                    sendMail email,'<h3>All the Unit Tests Passed on $BRANCH_NAME and the next stage is Code-review.</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'Unit Tests for  $BRANCH_NAME Passed'
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
                      sendMail email,'<h3>Some of the  Unit Tests Failed on  $BRANCH_NAME. Please look into the issues and fix it.</h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'Unit Tests for $BRANCH_NAME Failed'
                      }
                  }
                  }
		}
		stage('code-review'){
		when {
  			 allOf {
    changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: 'develop', title: '', url: ''
  }
  			beforeAgent true
		}
		agent {label 'dhmaster'};
		steps{
		script{
		def count=0;
		retry(4){
		count++;
		    props = readProperties file:'data-hub/pipeline.properties';
		     def  reviewResponse;
		    withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
		     reviewResponse = sh (returnStdout: true, script:'''
                               curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID/reviews
                               ''')
		    }
		    def reviewState=getReviewStateOfPR reviewResponse,2,env.GIT_COMMIT ;
			if((env.CHANGE_TITLE.split(':')[1].contains("Automated PR")) || reviewState.equalsIgnoreCase("APPROVED")){
				println("Automated PR")
				sh 'exit 0'
			}
			else if(reviewState.equalsIgnoreCase("APPROVED")){
			  sh 'exit 0'
			}
			else if(reviewState.equalsIgnoreCase("CHANGES_REQUESTED")){
			    println("Changes Requested")
                def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                email=getEmailFromGITUser author;

                if(count==4){
                sendMail email,'<h3>Changes Requested for <a href=${CHANGE_URL}>PR</a>. Please resolve those Changes</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'Changes Requested for $BRANCH_NAME '
                }
			    currentBuild.result = 'ABORTED'
			}
			else{
                    withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
                  def  reviewersList = sh (returnStdout: true, script:'''
                   curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID/requested_reviewers
                   ''')
                   def  reviewesList = sh (returnStdout: true, script:'''
                                      curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID/reviews
                                      ''')
                    def slurper = new JsonSlurperClassic().parseText(reviewersList.toString().trim())
                    def emailList="";
                    if(slurper.users.isEmpty() && reviewesList.isEmpty()){
                        def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                        email=getEmailFromGITUser author;
                        if(count==4){
                        sendMail email,'<h3>Please assign some code reviewers <a href=${CHANGE_URL}>PR</a>. and restart this stage to continue.</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'No Code reviewers assigned for $BRANCH_NAME '
                        }
                        sh 'exit 123'
                    }else{
                        for(def user:slurper.users){
                            email=getEmailFromGITUser user.login;
                            emailList+=email+',';
                        }
                        sendMail emailList,'<h3>Code Review Pending on <a href=${CHANGE_URL}>PR</a>.</h3><h3>Please click on proceed button from the pipeline view below if all the reviewers approved the code </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'Code Review Pending on $BRANCH_NAME '
                        try{
                            timeout(time: 15, unit: 'MINUTES') {
                                input message:'Code-Review Done?'
                            }
                        }catch(FlowInterruptedException err){
                            user = err.getCauses()[0].getUser().toString();
                            if(user.equalsIgnoreCase("SYSTEM")){
                                 echo "Timeout 15mins"
                                 sh 'exit 123'
                            }else{
                                   currentBuild.result = 'ABORTED'
                            }
                        }
                        def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                        email=getEmailFromGITUser author;
                        if(count==4){
                        sendMail email,'<h3>Code Review is incomplete on <a href=${CHANGE_URL}>PR</a>.</h3><h3>Please Restart this stage from the pipeline view once code review is completed. </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'Code Review is incomplete on $BRANCH_NAME  '
                        }
                    }
                 }
            }
        }
        }
		}
		}
		stage('Merge-PR'){
		when {
  			changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: 'develop', title: '', url: ''
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
                            sh 'exit 123'
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
                sh 'exit 123'
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
					sendMail email,'<h3><a href=${CHANGE_URL}>$BRANCH_NAME</a> is merged </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME is Merged'
					}
                   }
                   failure {
                      println("Retried 5times")
                      script{
                    def author=env.CHANGE_AUTHOR.toString().trim().toLowerCase()
                    def email=getEmailFromGITUser author
                    sendMail email,'<h3>Could not rebase and merge the <a href=${CHANGE_URL}>$BRANCH_NAME</a></h3><h3>Please check if there are any conflicts due to rebase and merge and resolve them</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'Merging Failed on $BRANCH_NAME'
                      }
                  }
                  }
		}
		stage('rh7-singlenode'){
		when {
	            expression{
	                props = readProperties file:'data-hub/pipeline.properties';
                    println(props['ExecutionBranch'])
	            return (env.BRANCH_NAME==props['ExecutionBranch'])
	            }
	           }
			agent { label 'dhfLinuxAgent'}
			steps{
			 script{
                props = readProperties file:'data-hub/pipeline.properties';
				copyRPM 'Release','9.0-12'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew marklogic-data-hub:test -Dorg.gradle.jvmargs=-Xmx1g || true;sleep 10s;./gradlew ml-data-hub:test || true;sleep 10s;./gradlew web:test || true;sleep 10s;./gradlew one-ui:test || true;sleep 10s;./gradlew marklogic-data-hub:testBootstrap || true;sleep 10s;./gradlew ml-data-hub:testFullCycle || true;sleep 10s;./gradlew one-ui:testFullCycle || true;'
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
                    sendMail Email,'<h3>Tests Passed on Released 9.0 ML Server Single Node </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-12 | Single Node | Passed'

                   }
                   unstable {
                      println("End-End Tests Failed")
                      sh 'mkdir -p MLLogs;cp -r /var/opt/MarkLogic/Logs/* $WORKSPACE/MLLogs/'
                      archiveArtifacts artifacts: 'MLLogs/**/*'
                      sendMail Email,'<h3>Some Tests Failed on Released 9.0 ML Server Single Node </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-12 | Single Node | Failed'
                  }
                  }
		}
		stage('Linux Core Parallel Execution'){
		when {
	            expression{
	             node('dhmaster'){
	                props = readProperties file:'data-hub/pipeline.properties';
                    println(props['ExecutionBranch'])
	            return (env.BRANCH_NAME==props['ExecutionBranch'])
	            }
	            }
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
                    sendMail Email,'<h3>Tests Passed on Nigtly 10.0 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-10.0-Nightly | Cluster | Passed'
                    // sh './gradlew publish'
                   }
                   unstable {
                      println("rh7_cluster_10.0-Nightly Tests Failed")
                      sendMail Email,'<h3>Some Tests Failed on Nightly 10.0 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-10.0-Nightly | Cluster | Failed'
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
                    sendMail Email,'<h3>Tests Passed on Nigtly 9.0 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-Nightly | Cluster | Passed'
                   }
                   unstable {
                      println("rh7_cluster_9.0-Nightly Failed")
                      sendMail Email,'<h3>Some Tests Failed on Nightly 9.0 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-Nightly | Cluster | Failed'
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
                    sendMail Email,'<h3>Tests Passed on  9.0-11 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-11 | Cluster | Passed'
                   }
                   unstable {
                      println("rh7_cluster_9.0-11 Tests Failed")
                      sendMail Email,'<h3>Some Tests Failed on 9.0-11 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-11 | Cluster | Failed'
                  }
                  }
		}
        stage('rh7_cluster_9.0-12'){
			agent { label 'dhfLinuxAgent'}
			steps{
		    dhflinuxTests("9.0-12","Release")
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("rh7_cluster_9.0-12 Tests Completed")
                    sendMail Email,'<h3>Tests Passed on  9.0-12 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-12 | Cluster | Passed'
                   }
                   unstable {
                      println("rh7_cluster_9.0-12 Tests Failed")
                      sendMail Email,'<h3>Some Tests Failed on 9.0-12 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-9.0-12 | Cluster | Failed'
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
                             sendMail Email,'<h3>Tests Passed on  10.0-3 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-10.0-3 | Cluster | Passed'
                            }
                            unstable {
                               println("rh7_cluster_10.0-3 Tests Failed")
                               sendMail Email,'<h3>Some Tests Failed on 10.0-3 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Linux RH7 | ML-10.0-3 | Cluster | Failed'
                           }
                           }
             }
		}
		post{
			success{
				node('dhfLinuxAgent'){
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;cp ~/.gradle/gradle.properties $GRADLE_USER_HOME;chmod 777  $GRADLE_USER_HOME/gradle.properties;./gradlew build -x test;./gradlew publish'
				}
			}
		}
		}
		stage('example projects parallel'){
		when {
	            expression{
	            node('dhmaster'){
	                props = readProperties file:'data-hub/pipeline.properties';
                    println(props['ExecutionBranch'])
	            return (env.BRANCH_NAME==props['ExecutionBranch'])
	            }
	            }
              }
            parallel{
            stage('dh5-example'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                     sh 'cd $WORKSPACE/data-hub/examples/dh-5-example;repo="    maven {url \'http://distro.marklogic.com/nexus/repository/maven-snapshots/\'}";sed -i "/repositories {/a$repo" build.gradle; '
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh '''
                            docker exec -u builder -i '''+dockerhost+''' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;\
                            export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR; \
                            export M2_HOME=$MAVEN_HOME/bin; \
                            export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin; \
                            cd $WORKSPACE/data-hub/examples/dh-5-example; \
                            rm -rf $GRADLE_USER_HOME/caches; \
                            ./gradlew -i hubInit -Ptesting=true; \
                            cp ../../marklogic-data-hub/gradle.properties .; \
                            ./gradlew -i mlDeploy -Ptesting=true -PmlUsername=admin -PmlPassword=admin; \
                            ./gradlew hubRunFlow -PflowName=ingestion_only-flow -Ptesting=true; \
                            ./gradlew hubRunFlow -PflowName=ingestion_mapping-flow -Ptesting=true; \
                            ./gradlew hubRunFlow -PflowName=ingestion_mapping_mastering-flow -Ptesting=true;
                            "
                        '''
                        }
                 }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'<h3>dh5example ran successfully on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'dh5-example on $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'<h3>dh5example Failed on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create a bug and fix issues in the example project</h4>',false,'dh5-example on $BRANCH_NAME Failed'
                 }
                 }
            }
            stage('dhf-customhook'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                      sh 'cd $WORKSPACE/data-hub/examples/dhf5-custom-hook;repo="    maven {url \'http://distro.marklogic.com/nexus/repository/maven-snapshots/\'}";sed -i "/repositories {/a$repo" build.gradle; '
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh '''
                            docker exec -u builder -i '''+dockerhost+''' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;\
                            export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR; \
                            export M2_HOME=$MAVEN_HOME/bin; \
                            export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin; \
                            cd $WORKSPACE/data-hub/examples/dhf5-custom-hook; \
                            rm -rf $GRADLE_USER_HOME/caches; \
                            ./gradlew -i hubInit -Ptesting=true; \
                            cp ../../marklogic-data-hub/gradle.properties .; \
                            ./gradlew -i mlDeploy -Ptesting=true -PmlUsername=admin -PmlPassword=admin; \
                            ./gradlew hubRunFlow -PflowName=LoadOrders -Ptesting=true; \
                            ./gradlew hubRunFlow -PflowName=LoadOrders -Ptesting=true;
                            "
                        '''
                        }
                     }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'<h3>dh5-customhook ran successfully on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'dh5-customhook on $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'<h3>dh5-customhook Failed on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create a bug and fix issues in the example project</h4>',false,'dh5-customhook on $BRANCH_NAME Failed'
                 }
                 }


            }
            stage('mapping-example'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                     sh 'cd $WORKSPACE/data-hub/examples/mapping-example;repo="    maven {url \'http://distro.marklogic.com/nexus/repository/maven-snapshots/\'}";sed -i "/repositories {/a$repo" build.gradle; '
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh '''
                            docker exec -u builder -i '''+dockerhost+''' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;\
                            export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR; \
                            export M2_HOME=$MAVEN_HOME/bin; \
                            export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin; \
                            cd $WORKSPACE/data-hub/examples/mapping-example; \
                            rm -rf $GRADLE_USER_HOME/caches; \
                            ./gradlew -i hubInit -Ptesting=true; \
                            cp ../../marklogic-data-hub/gradle.properties .; \
                            ./gradlew -i mlDeploy -Ptesting=true -PmlUsername=admin -PmlPassword=admin; \
                            ./gradlew hubRunFlow -PflowName=jsonToJson -Ptesting=true; \
                            ./gradlew hubRunFlow -PflowName=jsonToXml -Ptesting=true; \
                            ./gradlew hubRunFlow -PflowName=xmlToJson -Ptesting=true; \
                            ./gradlew hubRunFlow -PflowName=xmlToXml -Ptesting=true;
                            "
                        '''
                        }
                 }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'<h3>mapping-example ran successfully on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'mapping-example on $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'<h3>mapping-example Failed on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create a bug and fix issues in the example project</h4>',false,'mapping-example on $BRANCH_NAME Failed'
                 }
                 }
            }
            stage('smart-mastering-complete'){
                 agent { label 'dhfLinuxAgent'}
                steps{
                     sh 'cd $WORKSPACE/data-hub/examples/smart-mastering-complete;repo="    maven {url \'http://distro.marklogic.com/nexus/repository/maven-snapshots/\'}";sed -i "/repositories {/a$repo" build.gradle; '
                     copyRPM 'Release','10.0-3'
                     script{
                        props = readProperties file:'data-hub/pipeline.properties';
                        def dockerhost=setupMLDockerCluster 3
                        sh '''
                            docker exec -u builder -i '''+dockerhost+''' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;\
                            export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR; \
                            export M2_HOME=$MAVEN_HOME/bin; \
                            export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin; \
                            cd $WORKSPACE/data-hub/examples/smart-mastering-complete; \
                            rm -rf $GRADLE_USER_HOME/caches; \
                            ./gradlew -i hubInit -Ptesting=true; \
                            cp ../../marklogic-data-hub/gradle.properties .; \
                            ./gradlew -i mlDeploy -Ptesting=true -PmlUsername=admin -PmlPassword=admin; \
                            ./gradlew hubRunFlow -PflowName=persons -Ptesting=true;
                            "
                        '''
                        }
                 }
                 post{
                 always{
                    sh 'rm -rf $WORKSPACE/xdmp';
                 }
                 success{
                    sendMail Email,'<h3>smart-mastering-complete ran successfully on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'smart-mastering-complete on $BRANCH_NAME Passed'
                 }
                 unstable{
                    sendMail Email,'<h3>smart-mastering-complete Failed on the  branch $BRANCH_NAME </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create a bug and fix issues in the example project</h4>',false,'smart-mastering-complete on $BRANCH_NAME Failed'
                 }
                 }
            }
            }


		}
		stage('quick start linux parallel'){
		when {
	            expression{
	             node('dhmaster'){
	                props = readProperties file:'data-hub/pipeline.properties';
                    println(props['ExecutionBranch'])
	            return (env.BRANCH_NAME==props['ExecutionBranch'])
	            }
	            }
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
                    sendMail Email,'<h3>Quick start End-End Tests Passed on Nigtly 9.0 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-9.0-Nightly | Cluster | Passed'
                   }
                   unstable {
                      println("qs_rh7_90-nightly Tests Failed")
                      sendMail Email,'<h3>Some Quick Start End-End Tests Failed on Nightly 9.0 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-9.0-Nightly | Cluster | Failed'
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
                            sendMail Email,'<h3>Quick start End-End Tests Passed on Nigtly 10.0 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-10.0-Nightly | Cluster | Passed'
                           }
                           unstable {
                              println("qs_rh7_10-nightly Tests Failed")
                              sendMail Email,'<h3>Some Quick Start End-End Tests Failed on Nightly 10.0 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-9.0-Nightly | Cluster | Failed'
                          }
                          }
        		}
        stage('qs_rh7_90-release'){
        			agent { label 'lnx-dhf-jenkins-slave-2'}
        			steps{
                     dhfqsLinuxTests("9.0-12","Release")
        			}
        			post{

                          success {
                            println("qs_rh7_90-release Tests Completed")
                            sendMail Email,'<h3>Quick start End-End Tests Passed on Released 9.0 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-9.0-12 | Cluster | Passed'
                           }
                           unstable {
                              println("qs_rh7_90-release Tests Failed")
                              sendMail Email,'<h3>Some Quick Start End-End Tests Failed on Nightly 9.0 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-9.0-12 | Cluster | Failed'
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
                                    sendMail Email,'<h3>Quick start End-End Tests Passed on Released 10.0 ML Server Cluster </h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-10.0-3 | Cluster | Passed'
                                   }
                                   unstable {
                                      println("qs_rh7_10-release Tests Failed")
                                      sendMail Email,'<h3>Some Quick Start End-End Tests Failed on Released 10.0 ML Server Cluster </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Quick Start End-End | Linux RH7 | ML-10.0-3 | Cluster | Failed'
                                  }
                                  }
                		}
		}
		}
		stage('Windows Core Parallel'){
		when {
	            expression{
	             node('dhmaster'){
	                props = readProperties file:'data-hub/pipeline.properties';
                    println(props['ExecutionBranch'])
	            return (env.BRANCH_NAME==props['ExecutionBranch'])
	            }
	            }
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
                    sendMail Email,'<h3>Tests Passed on Nigtly 9.0 ML Server on Windows Platform</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-9.0-Nightly | Single Node | Passed'
                   }
                   unstable {
                      println("w12_SN_9.0-nightly Tests Failed")
                      sendMail Email,'<h3>Some Tests Failed on Nightly 9.0 ML Server on Windows Platform </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-9.0-Nightly | Single Node | Failed'
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
                    sendMail Email,'<h3>Tests Passed on Nigtly 10.0 ML Server on Windows Platform</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-10.0-Nightly | Single Node | Passed'
                   }
                   unstable {
                      println("w12_SN_10.0-nightly Tests Failed")
                      sendMail Email,'<h3>Some Tests Failed on Nightly 10.0 ML Server on Windows Platform </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-10.0-Nightly | Single Node | Failed'
                  }
                  }
		}
		stage('w12_SN_9.0-12'){
			agent { label 'dhfWinagent'}
			steps{
                dhfWinTests("9.0-12","Release")
			}
			post{
				always{
                       bat 'RMDIR /S/Q xdmp'
				  }
                  success {
                    println("w12_SN_9.0-12 Tests Completed")
                    sendMail Email,'<h3>Tests Passed on Released 9.0 ML Server on Windows Platform</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-9.0-12 | Single Node | Passed'
                   }
                   unstable {
                      println("w12_SN_9.0-12 Tests Failed")
                      sendMail Email,'<h3>Some Tests Failed on Released 9.0 ML Server on Windows Platform </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-9.0-12 | Single Node | Failed'
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
                         //jiraAddComment comment: 'Jenkins rh7_cluster_9.0-Nightly Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
                    }
			}
			post{
				always{
				  	bat 'RMDIR /S/Q xdmp'
				  }
                  success {
                    println("w12_cluster_10.0-3 Tests Completed")
                    sendMail Email,'<h3>Tests Passed on Released 10.0 ML Server Cluster on Windows Platform</h3><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-10.0-3 | Cluster | Passed'
                   }
                   unstable {
                      println("w12_cluster_10.0-3 Tests Failed")
                      sendMail Email,'<h3>Some Tests Failed on Released 10.0 ML Server on Windows Platform </h3><h4><a href=${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID/tests><font color=red>Check the Test Report</font></a></h4><h4><a href=${RUN_DISPLAY_URL}>Check the Pipeline View</a></h4><h4> <a href=${BUILD_URL}/console> Check Console Output Here</a></h4><h4>Please create bugs for the failed regressions and fix them</h4>',false,'$BRANCH_NAME branch | Windows W2k12 | ML-10.0-3 | Cluster | Failed'
                  }
                  }
		}

		    }
		}
		stage('Merge PR to Release Branch'){
		when {
	            expression{
	                props = readProperties file:'data-hub/pipeline.properties';
                    println(props['ExecutionBranch'])
	            return (env.BRANCH_NAME==props['ExecutionBranch'])
	            }
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
	            expression{
	                props = readProperties file:'data-hub/pipeline.properties';
                    println(props['ExecutionBranch'])
	            return (env.BRANCH_NAME==props['ReleaseBranch'])
	            }
		}
			agent { label 'dhfLinuxAgent'}
			steps{
			script{
			    props = readProperties file:'data-hub/pipeline.properties';
				copyRPM 'Release','10.0-3'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;./gradlew clean;./gradlew marklogic-data-hub:test || true;sleep 10s;./gradlew ml-data-hub:test || true;sleep 10s;./gradlew web:test || true;./gradlew one-ui:test || true;'
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
                    //sendMail Email,'Run the release pipeline to release Datahub',false,'Datahub is ready for Release'

                   }
                   unstable {
                      println("Sanity Tests Failed")
                      sh 'mkdir -p MLLogs;cp -r /var/opt/MarkLogic/Logs/* $WORKSPACE/MLLogs/'
                      archiveArtifacts artifacts: 'MLLogs/**/*'
                      //sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the Sanity tests of the branch $BRANCH_NAME on  failed. Please fix the tests and create a PR or create a bug for the failures.',false,'Sanity Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
	}
}
