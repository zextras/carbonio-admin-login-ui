// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

@Library("zextras-library@0.5.0") _

def nodeCmd(String cmd) {
	sh '. load_nvm && nvm install && nvm use && ' + cmd
}

def getCommitParentsCount() {
	return sh(script: '''
		COMMIT_ID=$(git log -1 --oneline | sed 's/ .*//')
		(git cat-file -p $COMMIT_ID | grep -w "parent" | wc -l)
	''', returnStdout: true).trim()
}

def getCurrentVersion() {
	return sh(script: 'grep \'"version":\' package.json | sed -n --regexp-extended \'s/.*"version": "([^"]+).*/\\1/p\' ', returnStdout: true).trim()
}

def getRepositoryName() {
	return sh(script: '''#!/bin/bash
			git remote -v | head -n1 | cut -d$'\t' -f2 | cut -d' ' -f1 | sed -e 's!https://bitbucket.org/!!g' -e 's!git@bitbucket.org:!!g' -e 's!.git!!g'
		''', returnStdout: true).trim()
}

def executeNpmLogin() {
	withCredentials([usernamePassword(credentialsId: 'npm-zextras-bot-auth-token', usernameVariable: 'AUTH_USERNAME', passwordVariable: 'AUTH_PASSWORD')]) {
//         NPM_AUTH_TOKEN = sh(
//                 script: """
//                                             curl -s \
//                                                 -H "Accept: application/json" \
//                                                 -H "Content-Type:application/json" \
//                                                 -X PUT --data \'{"name": "${AUTH_USERNAME}", "password": "${AUTH_PASSWORD}"}\' \
//                                                 https://registry.npmjs.com/-/user/org.couchdb.user:${AUTH_USERNAME} 2>&1 | grep -Po \
//                                                 \'(?<="token":")[^"]*\';
//                                             """,
//                 returnStdout: true
//         ).trim()
//         sh(
//                 script: """
//                     touch .npmrc;
//                     echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > .npmrc
//                     """,
//                 returnStdout: true
//         ).trim()
			sh(
				script: """
					touch .npmrc;
					echo "//registry.npmjs.org/:_authToken=${AUTH_PASSWORD}" > .npmrc
					""",
				returnStdout: true
			).trim()
	}
}

def createRelease(branchName) {
	// def isRelease = branchName ==~ /(release)/
	println("Inside createRelease")
	sh(script: """#!/bin/bash
		git config user.email \"bot@zextras.com\"
		git config user.name \"Tarsier Bot\"
		git remote set-url origin \$(git remote -v | head -n1 | cut -d\$'\t' -f2 | cut -d\" \" -f1 | sed 's!https://bitbucket.org/zextras!git@bitbucket.org:zextras!g')
		git fetch --unshallow
	""")
	executeNpmLogin()
	sh(script: """#!/bin/bash
		git subtree pull --squash --prefix translations/ git@bitbucket.org:$TRANSLATIONS_REPOSITORY_NAME\\.git master
	""")
	nodeCmd "npm install"
	nodeCmd "npx pinst --enable"
	nodeCmd "npm run release -- --no-verify --prerelease rc"
	nodeCmd "NODE_ENV='production' npm run build"
	sh(script: """#!/bin/bash
		git add translations
		git commit --no-verify -m 'chore(i18n): extracted translations'
		git subtree push --squash --prefix translations/ git@bitbucket.org:$TRANSLATIONS_REPOSITORY_NAME\\.git translations-updater/v${getCurrentVersion()}
	""")
	withCredentials([usernameColonPassword(credentialsId: 'tarsier-bot-pr-token', variable: 'PR_ACCESS')]) {
		def defaultReviewers = sh(script: """
			curl https://api.bitbucket.org/2.0/repositories/$TRANSLATIONS_REPOSITORY_NAME/default-reviewers \
			-u '$PR_ACCESS' \
			--request GET \
			| \
			jq '.values | map_values({ uuid: .uuid })'
		""", returnStdout: true).trim()
		println(defaultReviewers)
		sh(script: """#!/bin/bash
			curl https://api.bitbucket.org/2.0/repositories/$TRANSLATIONS_REPOSITORY_NAME/pullrequests \
			-u '$PR_ACCESS' \
			--request POST \
			--header 'Content-Type: application/json' \
			--data '{
				\"title\": \"Updated translations in ${getCurrentVersion()}\",
				\"source\": {
					\"branch\": {
						\"name\": \"translations-updater/v${getCurrentVersion()}\"
					}
				},
				\"destination\": {
					\"branch\": {
						\"name\": \"master\"
					}
				},
				\"reviewers\": $defaultReviewers,
				\"close_source_branch\": true
			}'
		""")
	}
	sh(script: """#!/bin/bash
		echo \"---\nid: CHANGELOG\ntitle: Change Log\nsidebar_label: Change Log\n---\" > docs/docs/CHANGELOG.md
		tail -n +3 CHANGELOG.md >> docs/docs/CHANGELOG.md
		git add docs/docs/CHANGELOG.md
		git commit --no-verify -m "chore(release): updated change log into documentation"
	""")
	sh(script: """#!/bin/bash
	  git push --follow-tags origin HEAD:$branchName
	  git push origin HEAD:refs/heads/version-bumper/v${getCurrentVersion()}
	""")
	withCredentials([usernameColonPassword(credentialsId: 'tarsier-bot-pr-token', variable: 'PR_ACCESS')]) {
		def defaultReviewers = sh(script: """
			curl https://api.bitbucket.org/2.0/repositories/$REPOSITORY_NAME/default-reviewers \
			-u '$PR_ACCESS' \
			--request GET \
			| \
			jq '.values | map_values({ uuid: .uuid })'
		""", returnStdout: true).trim()
		println(defaultReviewers)
		sh(script: """
			curl https://api.bitbucket.org/2.0/repositories/$REPOSITORY_NAME/pullrequests \
			-u '$PR_ACCESS' \
			--request POST \
			--header 'Content-Type: application/json' \
			--data '{
				\"title\": \"Bumped version to ${getCurrentVersion()}\",
				\"source\": {
					\"branch\": {
						\"name\": \"version-bumper/v${getCurrentVersion()}\"
					}
				},
				\"destination\": {
					\"branch\": {
						\"name\": \"devel\"
					}
				},
				\"reviewers\": $defaultReviewers,
				\"close_source_branch\": true
			}'
		""")
	}
}

def createBuild(sign) {
	executeNpmLogin()
	nodeCmd "npm install"
	nodeCmd "NODE_ENV='production' npm run build:zimlet"
	if (sign) {
		dir("artifact-deployer") {
			git(
				branch: "master",
				credentialsId: "tarsier_bot-ssh-key",
				url: "git@bitbucket.org:zextras/artifact-deployer.git"
			)
			sh(script: """#!/bin/bash
				./sign-zextras-zip ../pkg/com_zextras_zapp_login.zip
			""")
		}
	}
}

def createDocumentation(branchName) {
	dir("docs/website") {
		executeNpmLogin()
		nodeCmd "npm install"
		nodeCmd "BRANCH_NAME=$branchName npm run build"
	}
}

def publishOnNpm(branchName) {
	def isRelease = branchName ==~ /(release)/
	executeNpmLogin()
	nodeCmd "npm install"
	if (isRelease) {
		nodeCmd "NODE_ENV='production' npm publish --tag rc"
	} else {
		nodeCmd "NODE_ENV='production' npm publish"
	}
}

pipeline {
	agent {
		node {
			label 'nodejs-agent-v2'
		}
	}
	parameters {
		booleanParam defaultValue: false, description: 'Whether to upload the packages in playground repositories', name: 'PLAYGROUND'
	}
	options {
		timeout(time: 20, unit: 'MINUTES')
		buildDiscarder(logRotator(numToKeepStr: '50'))
	}
	environment {
		BUCKET_NAME = "zextras-artifacts"
		PUPPETEER_DOWNLOAD_HOST = "https://chromirror.zextras.com"
		LOCAL_REGISTRY = "https://npm.zextras.com"
		COMMIT_PARENTS_COUNT = getCommitParentsCount()
		REPOSITORY_NAME = getRepositoryName()
		TRANSLATIONS_REPOSITORY_NAME = "zextras/com_zextras_zapp_login"
	}
	stages {

		// ===== Tests =====

		stage("Tests") {
			when {
				beforeAgent(true)
				allOf {
					expression { BRANCH_NAME ==~ /PR-\d+/ }
				}
			}
			parallel {
				// stage("Type Checking") {
				// 	agent {
				// 		node {
				// 			label "nodejs-agent-v2"
				// 		}
				// 	}
				// 	steps {
				// 		executeNpmLogin()
				// 		nodeCmd "npm install"
				// 		nodeCmd "npm run type-check"
				// 	}
				// }
				// stage("Unit Tests") {
				// 	agent {
				// 		node {
				// 			label "nodejs-agent-v2"
				// 		}
				// 	}
				// 	steps {
				// 		executeNpmLogin()
				// 		nodeCmd "npm install"
				// 		nodeCmd "npm run test"
				// 	}
				// 	post {
				// 		always {
				// 			junit "junit.xml"
				// 			// publishCoverage adapters: [coberturaAdapter('coverage/cobertura-coverage.xml')], calculateDiffForChangeRequests: true, failNoReports: true
				// 		}
				// 	}
				// }
				stage("Linting") {
					agent {
						node {
							label "nodejs-agent-v2"
						}
					}
					steps {
						executeNpmLogin()
						nodeCmd "npm install"
						nodeCmd "npm run lint"
					}
				}
				stage("Build") {
					agent {
						node {
							label "nodejs-agent-v2"
						}
					}
					steps {
						createBuild(false)
					}
				}
				stage("SonarQube Check"){
					agent {
						node{
							label "nodejs-agent-v2"
						}
					}
					steps {
						createBuild(false)
						nodeCmd 'npm install -D jest-sonar-reporter sonarqube-scanner'
						nodeCmd 'npm install -g npx --force'
						nodeCmd "npx jest --passWithNoTests"
						nodeCmd "npx jest --coverage --passWithNoTests"
						withSonarQubeEnv(credentialsId: 'sonarqube-user-token', installationName: 'SonarQube instance') {
							nodeCmd 'npx sonar-scanner'
						}
					}
				}
			}
		}

		// ===== Release automation =====

		stage("Release automation") {
			when {
				beforeAgent(true)
				allOf {
					expression { BRANCH_NAME ==~ /(release)/ }
					environment(
						name: "COMMIT_PARENTS_COUNT",
						value: "2"
					)
				}
			}
			steps {
				createRelease("$BRANCH_NAME")
				archiveArtifacts(
					artifacts: "CHANGELOG.md",
					fingerprint: true
				)
				stash(
					includes: "CHANGELOG.md",
					name: 'changelog'
				)
				createBuild(true)
				archiveArtifacts(
					artifacts: "pkg/com_zextras_zapp_login.zip",
					fingerprint: true
				)
				stash(
					includes: "pkg/com_zextras_zapp_login.zip",
					name: 'zimlet_package'
				)
				createDocumentation("$BRANCH_NAME")
				script {
					doc.rm(file: "iris/zapp-login/$BRANCH_NAME")
					doc.mkdir(folder: "iris/zapp-login/$BRANCH_NAME")
					doc.upload(
						file: "docs/website/build/com_zextras_zapp_login/**",
						destination: "iris/zapp-login/$BRANCH_NAME"
					)
				}
				// publishOnNpm("$BRANCH_NAME")
			}
		}
		stage('Build deb/rpm') {
			stages {
				stage('Build') {
					steps {
						executeNpmLogin()
						nodeCmd "npm install"
						nodeCmd "NODE_ENV=production npm run build"
					}
				}
				stage('Stash') {
					steps {
						stash includes: "pacur.json,PKGBUILD,build/**", name: 'binaries'
					}
				}
				stage('pacur') {
					parallel {
						stage('Ubuntu 20.04') {
							agent {
								node {
									label 'pacur-agent-ubuntu-20.04-v1'
								}
							}
							options {
								skipDefaultCheckout()
							}
							steps {
								unstash 'binaries'
								sh 'sudo cp -r * /tmp'
								sh 'sudo pacur build ubuntu'
								stash includes: 'artifacts/', name: 'artifacts-deb'
							}
							post {
								always {
									archiveArtifacts artifacts: "artifacts/*.deb", fingerprint: true
								}
							}
						}

						stage('Rocky 8') {
							agent {
								node {
									label 'pacur-agent-rocky-8-v1'
								}
							}
							options {
								skipDefaultCheckout()
							}
							steps {
								unstash 'binaries'
								sh 'sudo cp -r * /tmp'
								sh 'sudo pacur build rocky'
								dir("artifacts/") {
									sh 'echo carbonio-admin-login-ui* | sed -E "s#(carbonio-admin-login-ui-[0-9.]*).*#\\0 \\1.x86_64.rpm#" | xargs sudo mv'
								}
								stash includes: 'artifacts/', name: 'artifacts-rpm'
							}
							post {
								always {
									archiveArtifacts artifacts: "artifacts/*.rpm", fingerprint: true
								}
							}
						}
					}
				}
			}
		}

		stage('Upload To Playground') {
			when {
				anyOf {
					branch 'playground/*'
					expression { params.PLAYGROUND == true }
				}
			}
			steps {
				unstash 'artifacts-deb'
				unstash 'artifacts-rpm'
				script {
					def server = Artifactory.server 'zextras-artifactory'
					def buildInfo
					def uploadSpec

					buildInfo = Artifactory.newBuildInfo()
					uploadSpec = """{
						"files": [
							{
								"pattern": "artifacts/carbonio-admin-login-ui*.deb",
								"target": "ubuntu-playground/pool/",
								"props": "deb.distribution=focal;deb.component=main;deb.architecture=amd64"
							}
							{
								"pattern": "artifacts/(carbonio-admin-login-ui)-(*).rpm",
								"target": "centos8-playground/zextras/{1}/{1}-{2}.rpm",
								"props": "rpm.metadata.arch=x86_64;rpm.metadata.vendor=zextras"
							}
						]
					}"""
					server.upload spec: uploadSpec, buildInfo: buildInfo, failNoOp: false
				}
			}
		}

		stage('Upload To RC') {
				when {
					anyOf {
						branch 'release/*'
						buildingTag()
					}
				}
				steps {
					unstash 'artifacts-deb'
					unstash 'artifacts-rpm'
					script {
						def server = Artifactory.server 'zextras-artifactory'
						def buildInfo
						def uploadSpec

						//ubuntu
						buildInfo = Artifactory.newBuildInfo()
						uploadSpec = """{
							"files": [
								{
									"pattern": "artifacts/carbonio-admin-login-ui*.deb",
									"target": "ubuntu-rc/pool/",
									"props": "deb.distribution=focal;deb.component=main;deb.architecture=amd64"
								}
							]
						}"""
						server.upload spec: uploadSpec, buildInfo: buildInfo, failNoOp: false
						config = [
								'buildName'          : buildInfo.name,
								'buildNumber'        : buildInfo.number,
								'sourceRepo'         : 'ubuntu-rc',
								'targetRepo'         : 'ubuntu-release',
								'comment'            : 'Do not change anything! Just press the button',
								'status'             : 'Released',
								'includeDependencies': false,
								'copy'               : true,
								'failFast'           : true
						]
						Artifactory.addInteractivePromotion server: server, promotionConfig: config, displayName: "Ubuntu Promotion to Release"
						server.publishBuildInfo buildInfo
	
						//rocky8
						buildInfo = Artifactory.newBuildInfo()
						buildInfo.name += "-centos8"
						uploadSpec= """{
							"files": [
								{
									"pattern": "artifacts/(carbonio-admin-login-ui)-(*).rpm",
									"target": "centos8-rc/zextras/{1}/{1}-{2}.rpm",
									"props": "rpm.metadata.arch=x86_64;rpm.metadata.vendor=zextras"
								}
							]
						}"""
						server.upload spec: uploadSpec, buildInfo: buildInfo, failNoOp: false
						config = [
								'buildName'          : buildInfo.name,
								'buildNumber'        : buildInfo.number,
								'sourceRepo'         : 'centos8-rc',
								'targetRepo'         : 'centos8-release',
								'comment'            : 'Do not change anything! Just press the button',
								'status'             : 'Released',
								'includeDependencies': false,
								'copy'               : true,
								'failFast'           : true
						]
						Artifactory.addInteractivePromotion server: server, promotionConfig: config, displayName: "Centos8 Promotion to Release"
						server.publishBuildInfo buildInfo
					}
				}
			}

		// ===== Deploy =====

// 		stage("Deploy") {
// 			parallel {
// 				stage("Deploy Beta on demo server") {
// 					agent {
// 						node {
// 							label 'nodejs-agent-v2'
// 						}
// 					}
// 					options {
//                         skipDefaultCheckout(true)
//                     }
// 					when {
//                         beforeAgent(true)
//                         allOf {
//                             expression { BRANCH_NAME ==~ /(release|beta)/ }
//                             environment(
//                                 name: "COMMIT_PARENTS_COUNT",
//                                 value: "2"
//                             )
//                         }
// 					}
// 					steps {
// 					}
// 				}
// 			}
// 		}

	}
	post {
		always {
			script {
				GIT_COMMIT_EMAIL = sh(
						script: 'git --no-pager show -s --format=\'%ae\'',
						returnStdout: true
				).trim()
			}
			emailext attachLog: true, body: '$DEFAULT_CONTENT', recipientProviders: [requestor()], subject: '$DEFAULT_SUBJECT', to: "${GIT_COMMIT_EMAIL}"
		}
	}
}
