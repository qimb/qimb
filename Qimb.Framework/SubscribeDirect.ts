/// <reference path="lib/dts/lambda.d.ts" />
/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict";

import * as AWS from 'aws-sdk';
import * as Lambda from 'aws-lambda';

declare var exports: Lambda.Exports;

exports.handler = async (event: any, context: Lambda.Context, callback: Lambda.Callback) => {
    var request = new SubscribeDirectRequest(event);
    console.log("start");

    try {

        await request.execute();


        callback(null, { statusCode: 200 });
    } catch (e) {
        console.log("Exception: " + e);

        callback({ statusCode: 500 }, null);
    } 

    console.log("end");
}

interface QueueDetails {
    queueUrl: string;
    queueArn: string;
}

class SubscribeDirectRequest {
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

        console.log("SQS queue created: " + subscriberQueueDetails.queueUrl + ":" + subscriberQueueDetails.queueArn);
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

    private async createTopic(topicName: string) : Promise<string> {
        var createTopicResponse = await this.executeAwsRequestAsync<AWS.SNS.CreateTopicResult>((callback) =>
            this.snsClient.createTopic(
                { Name: topicName },
                callback));

        return createTopicResponse.TopicArn;
    }

    private async createQueue(queueName: string) : Promise<QueueDetails> {
        var createQueueResponse = await this.executeAwsRequestAsync<AWS.SQS.CreateQueueResult>((callback) =>
            this.sqsClient.createQueue(
                {
                    QueueName: queueName,
                    Attributes: {
                        Policy: '{"Version": "2012-10-17","Id": "SNSSendMessage","Statement": [{"Sid": "Allow-SNS-SendMessage","Effect": "Allow","Principal": "*","Action": ["sqs:SendMessage","SQS:ReceiveMessage","SQS:DeleteMessage"],"Resource": "arn:aws:*:*:*"}]}'
                    }
                },
                callback));
        var queueAttributesResponse = await this.executeAwsRequestAsync<AWS.SQS.GetQueueAttributesResult>((callback) => {
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