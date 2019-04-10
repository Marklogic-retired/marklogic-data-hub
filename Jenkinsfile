@Library('shared-libraries') _
import groovy.json.JsonSlurper
import groovy.json.JsonSlurperClassic
def JIRA_ID="";
def commitMessage="";
def prResponse="";
def prNumber;
def githubAPIUrl="https://api.github.com/repos/marklogic/marklogic-data-hub"
pipeline{
	agent none;
	options {
  	checkoutToSubdirectory 'data-hub'
  	skipStagesAfterUnstable()
	}
	environment{
	JAVA_HOME_DIR="~/java/jdk1.8.0_72"
	GRADLE_DIR="/.gradle"
	MAVEN_HOME="/usr/local/maven"
	DMC_USER     = credentials('MLBUILD_USER')
    DMC_PASSWORD= credentials('MLBUILD_PASSWORD')
	}
	parameters{ 
	string(name: 'Email', defaultValue: 'stadikon@marklogic.com,rvudutal@marklogic.com,kkanthet@marklogic.com,sbalasub@marklogic.com', description: 'Who should I say send the email to?')
	}
	stages{
		stage('Build-datahub'){
		agent { label 'dhfLinuxAgent'}
			steps{
				script{
				if(env.CHANGE_TITLE){
				JIRA_ID=env.CHANGE_TITLE.split(':')[0];
				def transitionInput =[transition: [id: '41']]
				//jiraTransitionIssue idOrKey: JIRA_ID, input: transitionInput, site: 'JIRA'
				}
				}
				println(BRANCH_NAME)
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean --stacktrace;./gradlew build -x test;'
				archiveArtifacts artifacts: 'data-hub/marklogic-data-hub/build/libs/* , data-hub/ml-data-hub-plugin/build/libs/* , data-hub/quick-start/build/libs/', onlyIfSuccessful: true			}
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
				copyRPM 'Release','9.0-9'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;./gradlew clean;./gradlew marklogic-data-hub:test;sleep 10s;./gradlew ml-data-hub:test;sleep 10s;./gradlew quick-start:test;'
				junit '**/TEST-*.xml'
				script{
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
                   failure {
                      println("Unit Tests Failed")
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
    changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: '', title: '', url: ''
  }
  			beforeAgent true
		}
		agent {label 'master'};
		steps{
		script{
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
  			changeRequest()
  			beforeAgent true
		}
		agent {label 'master'};
			steps{
			retry(5){
				withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
				script{
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
  			branch '4.x-develop'
			}
			agent { label 'dhfLinuxAgent'}
			steps{
				copyRPM 'Release','9.0-9'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;./gradlew clean;set +e;./gradlew marklogic-data-hub:test -Dorg.gradle.jvmargs=-Xmx1g;sleep 10s;./gradlew ml-data-hub:test;sleep 10s;./gradlew quick-start:test;sleep 10s;./gradlew marklogic-data-hub:testBootstrap -Pskipui=true;sleep 10s;./gradlew clean;./gradlew ml-data-hub:testFullCycle -Pskipui=true;'
				junit '**/TEST-*.xml'
				script{
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
                   failure {
                      println("End-End Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7-singlenode Tests for  $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('Merge PR to Integration Branch'){
		when {
  			branch 'FeatureBranch'
  			beforeAgent true
		}
		agent {label 'master'}
		steps{
		withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
		script{
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
		stage('Parallel Execution'){
		when {
  			branch '4.x-develop'
  			beforeAgent true
		}
		parallel{
		stage('rh7_cluster_9.0-6'){
			agent { label 'dhfLinuxAgent'}
			steps{ 
				copyRPM 'Release','9.0-6'
				script{
				def dockerhost=setupMLDockerCluster 3
				sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew marklogic-data-hub:test;sleep 10s;./gradlew ml-data-hub:test ;sleep 10s;./gradlew quick-start:test ;sleep 10s;./gradlew marklogic-data-hub:testBootstrap -Pskipui=true;sleep 10s;./gradlew clean;./gradlew ml-data-hub:testFullCycle -Pskipui=true;"'
				}
				junit '**/TEST-*.xml'
					script{
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins rh7_cluster_9.0-6 Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				 always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("rh7_cluster_9.0-6 Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on rh7 cluster 9.0-6 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'rh7_cluster_9.0-6 Tests $BRANCH_NAME Passed'
                    // sh './gradlew publish'
                   }
                   failure {
                      println("rh7_cluster_9.0-6 Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 9.0-6 rh7 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7_cluster_9.0-6 Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('rh7_cluster_9.0-7'){
			agent { label 'dhfLinuxAgent'}
			steps{ 
				copyRPM 'Release','9.0-7'
				script{
				def dockerhost=setupMLDockerCluster 3
				sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "su -builder;export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew marklogic-data-hub:test;sleep 10s;./gradlew ml-data-hub:test;sleep 10s;./gradlew quick-start:test;sleep 10s;./gradlew marklogic-data-hub:testBootstrap -Pskipui=true;sleep 10s;./gradlew clean;./gradlew ml-data-hub:testFullCycle -Pskipui=true;"'
				}
				junit '**/TEST-*.xml'
					script{
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins rh7_cluster_9.0-7 Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("rh7_cluster_9.0-7 Completed")
                     sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on rh7 cluster 9.0-7 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'rh7_cluster_9.0-7 Tests for $BRANCH_NAME Passed'
                   }
                   failure {
                      println("rh7_cluster_9.0-7 Failed")
                       sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 9.0-7 rh7 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7_cluster_9.0-7 Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('rh7_cluster_9.0-8'){
			agent { label 'dhfLinuxAgent'}
			steps{ 
				copyRPM 'Release','9.0-8'
				script{
				def dockerhost=setupMLDockerCluster 3
				sh 'docker exec -u builder -i '+dockerhost+' /bin/sh -c "export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;set +e;./gradlew marklogic-data-hub:test;sleep 10s;./gradlew ml-data-hub:test;sleep 10s;./gradlew quick-start:test;sleep 10s;./gradlew marklogic-data-hub:testBootstrap -Pskipui=true;sleep 10s;./gradlew clean;./gradlew ml-data-hub:testFullCycle -Pskipui=true;"'
				}
				junit '**/TEST-*.xml'
					script{
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins rh7_cluster_9.0-8 Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("rh7_cluster_9.0-8 Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on rh7 cluster 9.0-8 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'rh7_cluster_9.0-8 Tests for $BRANCH_NAME Passed'
                   }
                   failure {
                      println("rh7_cluster_9.0-8 Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 9.0-8 rh7 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'rh7_cluster_9.0-8 Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('w12_cluster_9.0-6'){
			agent { label 'master'}
			steps{ 
				build 'dhf-core-4.x-develop-winserver2012-cluster_9.0-6'
					script{
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins w12_cluster_9.0-6 Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("w12_cluster_9.0-6 Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End tests on W2k12 cluster 9.0-6 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'w12_cluster_9.0-6 Tests for $BRANCH_NAME Passed'
                   }
                   failure {
                      println("w12_cluster_9.0-6 Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End tests of the branch $BRANCH_NAME on 9.0-6 w2k12 cluster failed. Please fix the tests and create a PR or create a bug for the failures.',false,'w12_cluster_9.0-6 Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('qs_rh7_singlenode'){
			agent { label 'master'}
			steps{ 
				build 'NO_CI_dhf-qs-4.x-develop-rh7'
					script{
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins qs_rh7_singlenode.0-8 Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				
                  success {
                    println("qs_rh7_singlenode.0-8 Tests Completed")
                   sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End quick start tests on Rh7 single node of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'qs_rh7_singlenode Tests for $BRANCH_NAME Passed'
                   }
                   failure {
                      println("qs_rh7_singlenode.0-8 Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End  quick start tests of the branch $BRANCH_NAME on rh7 failed. Please fix the tests and create a PR or create a bug for the failures.',false,'qs_rh7_singlenode Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
		stage('qs_w12_singlenode'){
			agent { label 'master'}
			steps{ 
				build 'NO_CI_dhf-qs-4.x-develop-winserver2012'
					script{
				 commitMessage = sh (returnStdout: true, script:'''
			curl -u $Credentials -X GET "'''+githubAPIUrl+'''/git/commits/${GIT_COMMIT}" ''')
			def slurper = new JsonSlurperClassic().parseText(commitMessage.toString().trim())
				def commit=slurper.message.toString().trim();
				JIRA_ID=commit.split(("\\n"))[0].split(':')[0].trim();
				JIRA_ID=JIRA_ID.split(" ")[0];
				commitMessage=null;
				//jiraAddComment comment: 'Jenkins qs_w12_singlenode Test Results For PR Available', idOrKey: JIRA_ID, site: 'JIRA'
				}
			}
			post{
				always{
				  	sh 'rm -rf $WORKSPACE/xdmp'
				  }
                  success {
                    println("qs_w12_singlenode Tests Completed")
                    sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n All the End to End quick start tests on W2k12 of the branch $BRANCH_NAME passed and the next stage is to merge it to release branch if all the end-end tests pass',false,'qs_w12_singlenode Tests for $BRANCH_NAME Passed'
                   }
                   failure {
                      println("qs_w12_singlenode Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the End to End  quick start tests of the branch $BRANCH_NAME on w2k12 failed. Please fix the tests and create a PR or create a bug for the failures.',false,'qs_w12_singlenode Tests for $BRANCH_NAME Failed'
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
		stage('Merge PR to Release Branch'){
		when {
  			branch '4.x-develop'
  			beforeAgent true
		}
		agent {label 'master'}
		steps{
		withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
		script{
			//JIRA_ID=env.CHANGE_TITLE.split(':')[0]
			prResponse = sh (returnStdout: true, script:'''
			curl -u $Credentials  -X POST -H 'Content-Type:application/json' -d '{\"title\": \"Automated PR for Release Branch\" , \"head\": \"4.x-develop\" , \"base\": \"release/4.2.2\" }' '''+githubAPIUrl+'''/pulls ''')
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
  			branch 'Release/4.2.2'
  			beforeAgent true
		}
			agent { label 'dhfLinuxAgent'}
			steps{
				copyRPM 'Release','9.0-9'
				setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
				sh 'export JAVA_HOME=`eval echo "$JAVA_HOME_DIR"`;export GRADLE_USER_HOME=$WORKSPACE$GRADLE_DIR;export M2_HOME=$MAVEN_HOME/bin;export PATH=$GRADLE_USER_HOME:$PATH:$MAVEN_HOME/bin;cd $WORKSPACE/data-hub;rm -rf $GRADLE_USER_HOME/caches;./gradlew clean;./gradlew clean;./gradlew marklogic-data-hub:test;sleep 10s;./gradlew ml-data-hub:test;sleep 10s;./gradlew quick-start:test;'
				junit '**/TEST-*.xml'
				script{
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
                   failure {
                      println("Sanity Tests Failed")
                      sendMail Email,'Check the Pipeline View Here: ${JENKINS_URL}/blue/organizations/jenkins/Datahub_CI/detail/$JOB_BASE_NAME/$BUILD_ID  \n\n\n Check Console Output Here: ${BUILD_URL}/console \n\n\n Some of the Sanity tests of the branch $BRANCH_NAME on  failed. Please fix the tests and create a PR or create a bug for the failures.',false,'Sanity Tests for $BRANCH_NAME Failed'
                  }
                  }
		}
	}
}