/// <reference path="lib/dts/lambda.d.ts" />
/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict"

import * as AWS from 'aws-sdk';
import * as Lambda from 'aws-lambda';

declare var exports: Lambda.Exports;

exports.handler = async (event: any, context: Lambda.Context, callback: Lambda.Callback) => {
    var request = new ReceiveRequest(event);

    console.log("start");

    try {

        var messages = await request.execute();

        callback(null, { statusCode: 200, body: JSON.stringify(messages) });
    } catch (e) {
        console.log("Exception: " + e);

        callback({ statusCode: 500 }, null);
    }

    console.log("end");
}

class ReceiveRequest {
    private subscriberId: string;

    constructor(event: any) {
        this.subscriberId = event.headers["X-Qimb-NodeId"];
    }

    public async execute() : Promise<any> {
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