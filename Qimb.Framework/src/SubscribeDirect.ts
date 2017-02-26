import * as AWS from 'aws-sdk';

"use strict";

interface IQueueDetails {
    queueUrl: string;
    queueArn: string;
}

export class SubscribeDirectRequest {
    private subscriberId: string;
    private pushEndpoint: string;
    private snsClient: AWS.SNS;
    private sqsClient: AWS.SQS;

    constructor(event: any) {
        this.subscriberId = event.headers["X-Qimb-NodeId"].toLowerCase();
        var content = JSON.parse(event.body);
        this.pushEndpoint = content.pushEndpoint;
        this.snsClient = new AWS.SNS();
        this.sqsClient = new AWS.SQS();
    }

    public async execute() {
        var subscriberQueueName = "qimb-sub-" + this.subscriberId;
        var topicName = "qimb-sub-" + this.subscriberId;

        console.log("Subscriber queue name: " + subscriberQueueName);
        console.log("Topic name: " + topicName);

        var createSubscriberQueuePromise = this.createQueue(subscriberQueueName);
        var createTopicPromise = this.createTopic(topicName);

        var subscriberQueueDetails = await createSubscriberQueuePromise;
        var topicArn = await createTopicPromise;

        console
            .log("SQS queue created: " + subscriberQueueDetails.queueUrl + ":" + subscriberQueueDetails.queueArn);
        console.log("SNS topic created: " + topicArn);

        var subscribeSubscriberQueuePromise = this.subscribe(topicArn, subscriberQueueDetails.queueArn, "sqs");
        if (this.pushEndpoint) {
            var pushNotificationSubscriptionArn = await this.subscribe(topicArn, this.pushEndpoint, "http");
            console.log("HTTP push subscribed to topic: " + pushNotificationSubscriptionArn);
        }

        var subscriberSubscriptionArn = await subscribeSubscriberQueuePromise;

        console.log("SQS queue subscribed to topic: " + subscriberSubscriptionArn);
    }

    private async subscribe(topicArn: string, endpoint: string, protocol: string): Promise<string> {
        var subscribeResponse = await this.snsClient.subscribe({
            TopicArn: topicArn,
            Protocol: protocol,
            Endpoint: endpoint
        }).promise();

        return subscribeResponse.SubscriptionArn;
    }

    private async createTopic(topicName: string): Promise<string> {
        var createTopicResponse = await this.snsClient.createTopic({
             Name: topicName }).promise();

        return createTopicResponse.TopicArn;
    }

    private async createQueue(queueName: string): Promise<IQueueDetails> {
        var createQueueResponse = await this.sqsClient.createQueue({
            QueueName: queueName,
            Attributes: {
                Policy:
                    '{"Version": "2012-10-17","Id": "SNSSendMessage","Statement": [{"Sid": "Allow-SNS-SendMessage","Effect": "Allow","Principal": "*","Action": ["sqs:SendMessage","SQS:ReceiveMessage","SQS:DeleteMessage"],"Resource": "arn:aws:*:*:*"}]}'
            }
        }).promise();
        var queueAttributesResponse = await this.sqsClient.getQueueAttributes({
            QueueUrl: createQueueResponse.QueueUrl,
            AttributeNames: ["All"]
        }).promise();

        return { queueArn: queueAttributesResponse.Attributes["QueueArn"], queueUrl: createQueueResponse.QueueUrl };
    }
}
