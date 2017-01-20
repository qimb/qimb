/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict";

import * as AWS from 'aws-sdk';

interface IQueueDetails {
    queueUrl: string;
    queueArn: string;
}

export class SubscribeRequest {
    private messageType: string;
    private subscriberId: string;
    private pushEndpoint: string;
    private snsClient: AWS.SNS;
    private sqsClient: AWS.SQS;

    constructor(event: any) {
        this.messageType = event.pathParameters.messagetype.toLowerCase();
        this.subscriberId = event.headers["X-Qimb-NodeId"].toLowerCase();
        var content = JSON.parse(event.body);
        this.pushEndpoint = content.pushEndpoint;
        this.snsClient = new AWS.SNS();
        this.sqsClient = new AWS.SQS();
    }

    public async execute() {
        var messageTypeQueueName = "qimb-type-" + this.messageType;
        var subscriberQueueName = "qimb-sub-" + this.subscriberId;
        var topicName = "qimb-type-" + this.messageType;

        console.log("Message type queue name: " + messageTypeQueueName);
        console.log("Subscriber queue name: " + subscriberQueueName);
        console.log("Topic name: " + topicName);

        var createMessageTypeQueuePromise = this.createQueue(messageTypeQueueName);
        var createSubscriberQueuePromise = this.createQueue(subscriberQueueName);
        var createTopicPromise = this.createTopic(topicName);

        var messageTypeQueueDetails = await createMessageTypeQueuePromise;
        var subscriberQueueDetails = await createSubscriberQueuePromise;
        var topicArn = await createTopicPromise;

        console.log("SQS queue created: " +
            messageTypeQueueDetails.queueUrl +
            ":" +
            messageTypeQueueDetails.queueArn);
        console
            .log("SQS queue created: " + subscriberQueueDetails.queueUrl + ":" + subscriberQueueDetails.queueArn);
        console.log("SNS topic created: " + topicArn);

        var subscribeMessageTypeQueuePromise = this.subscribe(topicArn, messageTypeQueueDetails.queueArn, "sqs");
        var subscribeSubscriberQueuePromise = this.subscribe(topicArn, subscriberQueueDetails.queueArn, "sqs");
        if (this.pushEndpoint) {
            var pushNotificationSubscriptionArn = await this.subscribe(topicArn, this.pushEndpoint, "http");
            console.log("HTTP push subscribed to topic: " + pushNotificationSubscriptionArn);
        }

        var messageTypeSubscriptionArn = await subscribeMessageTypeQueuePromise;
        var subscriberSubscriptionArn = await subscribeSubscriberQueuePromise;

        console.log("SQS queue subscribed to topic: " + messageTypeSubscriptionArn);
        console.log("SQS queue subscribed to topic: " + subscriberSubscriptionArn);
    }

    private async subscribe(topicArn: string, endpoint: string, protocol: string): Promise<string> {
        var subscribeResponse = await this.executeAwsRequestAsync<AWS.SNS.SubscribeResult>((callback) =>
            this.snsClient.subscribe(
                {
                    TopicArn: topicArn,
                    Protocol: protocol,
                    Endpoint: endpoint
                },
                callback));

        return subscribeResponse.SubscriptionArn;
    }

    private async createTopic(topicName: string): Promise<string> {
        var createTopicResponse = await this.executeAwsRequestAsync<AWS.SNS.CreateTopicResult>((callback) =>
            this.snsClient.createTopic(
                { Name: topicName },
                callback));

        return createTopicResponse.TopicArn;
    }

    private async createQueue(queueName: string): Promise<IQueueDetails> {
        var createQueueResponse = await this.executeAwsRequestAsync<AWS.SQS.CreateQueueResult>((callback) =>
            this.sqsClient.createQueue(
                {
                    QueueName: queueName,
                    Attributes: {
                        Policy:
                            '{"Version": "2012-10-17","Id": "SNSSendMessage","Statement": [{"Sid": "Allow-SNS-SendMessage","Effect": "Allow","Principal": "*","Action": ["sqs:SendMessage","SQS:ReceiveMessage","SQS:DeleteMessage"],"Resource": "arn:aws:*:*:*"}]}'
                    }
                },
                callback));
        var queueAttributesResponse = await this
            .executeAwsRequestAsync<AWS.SQS.GetQueueAttributesResult>((callback) => {
                this.sqsClient.getQueueAttributes(
                    {
                        QueueUrl: createQueueResponse.QueueUrl,
                        AttributeNames: ["All"]
                    },
                    callback);
            });

        return { queueArn: queueAttributesResponse.Attributes["QueueArn"], queueUrl: createQueueResponse.QueueUrl };
    }

    private executeAwsRequestAsync<TResponse>(request: (callback: (err, data) => void) => void) {
        console.log("start request ");

        return new Promise<TResponse>(
        (resolve, reject) => request((err, data) => {
            if (!err) {
                console.log("success");
                resolve(data);
            } else {
                console.log("error: " + err);

                reject(err);
            }
        }));
    }
}