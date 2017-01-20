/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict"

import * as AWS from 'aws-sdk';

export class DeleteRequest {
    private subscriberId: string;
    private receiptHandle: string;

    constructor(event: any) {
        this.subscriberId = event.headers["X-Qimb-NodeId"];
        this.receiptHandle = decodeURIComponent(event.pathParameters.handle);
    }

    public async execute() {
        var sqsClient = new AWS.SQS();

        var queueUrl = "https://sqs.eu-west-1.amazonaws.com/170643467817/qimb-sub-" + this.subscriberId;

        console.log("Queue Url: " + queueUrl);
        console.log("Receipt Handle: " + this.receiptHandle);

        await this.executeAwsRequestAsync((callback) =>
            sqsClient.deleteMessage(
                {
                    QueueUrl: queueUrl,
                    ReceiptHandle: this.receiptHandle
                },
                callback));
    }

    private executeAwsRequestAsync(request: (callback: (err, data) => void) => void) {
        console.log("start request ");

        return new Promise(
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
