/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict"

import * as AWS from 'aws-sdk';

export class ReceiveRequest {
    private subscriberId: string;

    constructor(event: any) {
        this.subscriberId = event.headers["X-Qimb-NodeId"];
    }

    public async execute(): Promise<any> {
        var sqsClient = new AWS.SQS();

        var queueUrl = "https://sqs.eu-west-1.amazonaws.com/170643467817/qimb-sub-" + this.subscriberId;

        console.log("Queue Url: " + queueUrl);

        var receiveMessageResponse = await this.executeAwsRequestAsync<AWS.SQS.ReceiveMessageResult>((callback) =>
            sqsClient.receiveMessage(
                {
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: 10,
                    VisibilityTimeout: 10
                },
                callback));

        if (receiveMessageResponse.Messages) {
            var messages = new Array<any>();
            receiveMessageResponse.Messages.forEach((value, indexed) => {
                var body = JSON.parse(value.Body);
                var envolope = JSON.parse(body.Message);
                messages.push({
                    receiptHandle: value.ReceiptHandle,
                    message: envolope.message,
                    messageId: envolope.messageId,
                    snsMessageId: body.MessageId,
                    messageType: envolope.messageType,
                    senderNodeId: envolope.senderNodeId
                });
            });

            console.log(messages);

            return messages;

        } else {
            console.log("No messages");
            return [];
        }
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