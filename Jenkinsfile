@Library('idp@0.10.8')
def scmUrl = 'ssh://git@code.eu.idealo.com:7999/rflug/lib_react-router-apollo.git'

node('java') {

  stage ('build') {

    def commitHash = checkout([$class: 'GitSCM', branches: [[name: '*/build-tracking']], userRemoteConfigs: [[url: "${scmUrl}"]]]).GIT_COMMIT

    properties([pipelineTriggers([pollSCM('')])])

    def nodeHome = tool name: 'node_js_7_10_1', type: 'com.cloudbees.jenkins.plugins.customtools.CustomTool'
    env.PATH = "${nodeHome}/bin:${env.PATH}"

    sh """
        #!/bin/bash

        npm prune
        npm install
        # CI=true npm run test
        npm run build
        npm publish
    """
  }
}
