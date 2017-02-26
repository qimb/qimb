import * as AWS from 'aws-sdk';

"use strict"

interface IQueueDetails {
    queueUrl: string;
    queueArn: string;
}

export class PublishDirectRequest {
    private message: string;
    private messageId: string;
    private senderNodeId: string;
    private receiverNodeId: string;
    private snsClient: AWS.SNS;
    private sqsClient: AWS.SQS;

    constructor(event: any) {
        this.message = event.body;
        this.messageId = event.pathParameters.messageid;
        this.receiverNodeId = event.pathParameters.nodeid;
        this.senderNodeId = event.headers["X-Qimb-NodeId"];
        this.snsClient = new AWS.SNS();
        this.sqsClient = new AWS.SQS();
    }

    public async execute(snsArnPrefix: string): Promise<string> {

        var topicArn = snsArnPrefix + "qimb-sub-" + this.receiverNodeId;

        console.log("Topic Arn: " + topicArn);
        var messageId = null;

        try {
            messageId = await this.publish(topicArn);
        } catch (e) {
            if (e.name === "NotFound") {
                var messageTypeQueueName = "qimb-sub-" + this.receiverNodeId;
                var topicName = "qimb-sub-" + this.receiverNodeId;

                console.log("Message type queue name: " + messageTypeQueueName);
                console.log("Topic name: " + topicName);

                var createMessageTypeQueuePromise = this.createQueue(messageTypeQueueName);
                var createTopicPromise = this.createTopic(topicName);

                var messageTypeQueueDetails = await createMessageTypeQueuePromise;
                var createTopicArn = await createTopicPromise;

                console.log("SQS queue created: " +
                    messageTypeQueueDetails.queueUrl +
                    ":" +
                    messageTypeQueueDetails.queueArn);
                console.log("SNS topic created: " + createTopicArn);

                var messageTypeSubscriptionArn = await this.subscribe(topicArn, messageTypeQueueDetails.queueArn);

                console.log("SQS queue subscribed to topic: " + messageTypeSubscriptionArn);

                messageId = await this.publish(topicArn);
            } else {

                console.log("exception type: " + e.constructor.name);
                throw e;
            }
        }

        console.log("Published: " + messageId);

        return messageId;
    }

    private async publish(topicArn: string): Promise<string> {
        var publishResponse = await this.snsClient.publish({
            TopicArn: topicArn,
            Message: JSON.stringify({
                message: this.message,
                messageId: this.messageId,
                senderNodeId: this.senderNodeId
            })
        }).promise();

        return publishResponse.MessageId;
    }

    private async createTopic(topicName: string): Promise<string> {
        var createTopicResponse = await this.snsClient.createTopic({
             Name: topicName
        }).promise();

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

    private async subscribe(topicArn: string, queueArn: string): Promise<string> {
        var subscribeResponse = await this.snsClient.subscribe({
            TopicArn: topicArn,
            Protocol: "sqs",
            Endpoint: queueArn
        }).promise();

        return subscribeResponse.SubscriptionArn;
    }
}