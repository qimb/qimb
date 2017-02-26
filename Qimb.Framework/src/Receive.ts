import * as AWS from 'aws-sdk';

"use strict"

export class ReceiveRequest {
    private subscriberId: string;
    private sqsClient: AWS.SQS;

    constructor(event: any) {
        this.subscriberId = event.headers["X-Qimb-NodeId"];
        this.sqsClient = new AWS.SQS();
    }

    public async execute(sqsUrlPrefix: string): Promise<any> {

        var queueUrl = sqsUrlPrefix + "qimb-sub-" + this.subscriberId;

        console.log("Queue Url: " + queueUrl);

        var receiveMessageResponse = await this.sqsClient.receiveMessage({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 10
        }).promise();

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
}