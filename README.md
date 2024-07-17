# JenkinsTest

curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' https://hooks.slack.com/services/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



#!/bin/bash
echo "{
    \"id\": \"environment-id\",
    \"name\": \"jenkins-environment\",
    \"values\": [
        {
            \"key\": \"slack_webhook_url\",
            \"value\": \"$SLACK_WEBHOOK_URL\",
            \"enabled\": true
        }
    ]
}" > env.json

newman run your_collection.json -e env.json --verbose
rm env.json

