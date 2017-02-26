"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
"use strict";
class PublishRequest {
    constructor(event) {
        this.message = event.body;
        this.messageType = event.pathParameters.messagetype;
        this.messageId = event.pathParameters.messageid;
        this.senderNodeId = event.headers["X-Qimb-NodeId"];
        this.snsClient = new AWS.SNS();
        this.sqsClient = new AWS.SQS();
    }
    execute(snsArnPrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            var topicArn = snsArnPrefix + "qimb-type-" + this.messageType;
            console.log("Topic Arn: " + topicArn);
            var messageId = null;
            try {
                messageId = yield this.publish(topicArn);
            }
            catch (e) {
                if (e.name === "NotFound") {
                    var messageTypeQueueName = "qimb-type-" + this.messageType;
                    var topicName = "qimb-type-" + this.messageType;
                    console.log("Message type queue name: " + messageTypeQueueName);
                    console.log("Topic name: " + topicName);
                    var createMessageTypeQueuePromise = this.createQueue(messageTypeQueueName);
                    var createTopicPromise = this.createTopic(topicName);
                    var messageTypeQueueDetails = yield createMessageTypeQueuePromise;
                    var createTopicArn = yield createTopicPromise;
                    console.log("SQS queue created: " +
                        messageTypeQueueDetails.queueUrl +
                        ":" +
                        messageTypeQueueDetails.queueArn);
                    console.log("SNS topic created: " + createTopicArn);
                    var messageTypeSubscriptionArn = yield this.subscribe(topicArn, messageTypeQueueDetails.queueArn);
                    console.log("SQS queue subscribed to topic: " + messageTypeSubscriptionArn);
                    messageId = yield this.publish(topicArn);
                }
                else {
                    console.log("exception type: " + e.constructor.name);
                    throw e;
                }
            }
            console.log("Published: " + messageId);
            return messageId;
        });
    }
    publish(topicArn) {
        return __awaiter(this, void 0, void 0, function* () {
            var publishResponse = yield this.snsClient.publish({
                TopicArn: topicArn,
                Message: JSON.stringify({
                    message: this.message,
                    messageId: this.messageId,
                    senderNodeId: this.senderNodeId,
                    messageType: this.messageType
                })
            }).promise();
            return publishResponse.MessageId;
        });
    }
    createTopic(topicName) {
        return __awaiter(this, void 0, void 0, function* () {
            var createTopicResponse = yield this.snsClient.createTopic({ Name: topicName }).promise();
            return createTopicResponse.TopicArn;
        });
    }
    createQueue(queueName) {
        return __awaiter(this, void 0, void 0, function* () {
            var createQueueResponse = yield this.sqsClient.createQueue({
                QueueName: queueName,
                Attributes: {
                    Policy: '{"Version": "2012-10-17","Id": "SNSSendMessage","Statement": [{"Sid": "Allow-SNS-SendMessage","Effect": "Allow","Principal": "*","Action": ["sqs:SendMessage","SQS:ReceiveMessage","SQS:DeleteMessage"],"Resource": "arn:aws:*:*:*"}]}'
                }
            }).promise();
            var queueAttributesResponse = yield this.sqsClient.getQueueAttributes({
                QueueUrl: createQueueResponse.QueueUrl,
                AttributeNames: ["All"]
            }).promise();
            return { queueArn: queueAttributesResponse.Attributes["QueueArn"], queueUrl: createQueueResponse.QueueUrl };
        });
    }
    subscribe(topicArn, queueArn) {
        return __awaiter(this, void 0, void 0, function* () {
            var subscribeResponse = yield this.snsClient.subscribe({
                TopicArn: topicArn,
                Protocol: "sqs",
                Endpoint: queueArn
            }).promise();
            return subscribeResponse.SubscriptionArn;
        });
    }
}
exports.PublishRequest = PublishRequest;
