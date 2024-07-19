pipeline {
    agent any

    environment {
        CLIENT_ID = 'your_client_id' // replace with your actual client ID
        CLIENT_SECRET = 'your_client_secret' // replace with your actual client secret
        SLACK_WEBHOOK_URL = 'your_slack_webhook_url' // replace with your actual Slack webhook URL
        THRESHOLD = 75 // set your threshold percentage
    }

    stages {
        stage('Generate Adobe Token') {
            steps {
                script {
                    def response = httpRequest(
                        httpMode: 'POST',
                        url: 'https://ims-na1.adobelogin.com/ims/token/v3',
                        contentType: 'APPLICATION_FORM',
                        requestBody: "grant_type=client_credentials&client_id=${env.CLIENT_ID}&client_secret=${env.CLIENT_SECRET}&scope=openid,AdobeID,additional_info.projectedProductContext"
                    )
                    def responseJson = readJSON text: response.content
                    env.AUTHENTICATION_TOKEN = responseJson.access_token
                }
            }
        }
        
        stage('Check Server Call Usage') {
            steps {
                script {
                    def response = httpRequest(
                        httpMode: 'GET',
                        url: 'https://appservice5.omniture.com/analytics/1.0/servercallusage/servercalls',
                        customHeaders: [
                            [name: 'Accept', value: 'application/json'],
                            [name: 'Authorization', value: "Bearer ${env.AUTHENTICATION_TOKEN}"],
                            [name: 'x-proxy-global-company-id', value: 'ancest1']
                        ]
                    )
                    def responseJson = readJSON text: response.content
                    def threshold = env.THRESHOLD.toInteger()
                    
                    def overallPrimaryCallsMetric = responseJson.metrics.find { it.metricId == 'overallprimarycalls' }
                    def commitment = overallPrimaryCallsMetric.commitment
                    def servercalldata = overallPrimaryCallsMetric.usage.find { it.id == 'currentperiodusage' }.data
                    def lastDataEntry = servercalldata[-1]
                    def lastUsage = lastDataEntry.usage
                    def usagePercentage = (lastUsage / commitment) * 100
                    
                    if (usagePercentage > threshold) {
                        def message = [
                            channel: "#bt-alerts",
                            attachments: [
                                [
                                    mrkdwn_in: ["text"],
                                    color: "#ff0000",
                                    pretext: ":warning: Adobe Server Call Usage Alert",
                                    text: "The server call usage has exceeded the set threshold. Please investigate and take necessary actions.",
                                    fields: [
                                        [title: "Commitment", value: commitment, short: true],
                                        [title: "Date", value: lastDataEntry.date, short: true],
                                        [title: "Usage", value: lastUsage.toString(), short: true],
                                        [title: "Usage Percentage", value: "${usagePercentage.toFixed(2)}%", short: true],
                                        [title: "Threshold", value: "${threshold}%", short: true]
                                    ],
                                    footer: "Server Call Monitoring",
                                    footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
                                    ts: System.currentTimeMillis() / 1000
                                ]
                            ]
                        ]
                        
                        httpRequest(
                            httpMode: 'POST',
                            url: env.SLACK_WEBHOOK_URL,
                            contentType: 'APPLICATION_JSON',
                            requestBody: groovy.json.JsonOutput.toJson(message)
                        )
                    } else {
                        echo "Usage percentage is within acceptable limits: ${usagePercentage}%"
                    }
                }
            }
        }
    }
}
