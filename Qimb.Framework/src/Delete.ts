import * as AWS from 'aws-sdk';

"use strict"

export class DeleteRequest {
    private subscriberId: string;
    private receiptHandle: string;
    private sqsClient: AWS.SQS;

    constructor(event: any) {
        this.subscriberId = event.headers["X-Qimb-NodeId"];
        this.receiptHandle = decodeURIComponent(event.pathParameters.handle);
        this.sqsClient = new AWS.SQS();

    }

    public async execute(queueUrlPrefix: string) {

        var queueUrl = queueUrlPrefix + "qimb-sub-" + this.subscriberId;

        console.log("Queue Url: " + queueUrl);
        console.log("Receipt Handle: " + this.receiptHandle);


        await this.sqsClient.deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: this.receiptHandle
        }).promise();
    }
}
