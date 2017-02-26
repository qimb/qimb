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
class SubscribeRequest {
    constructor(event) {
        this.messageType = event.pathParameters.messagetype.toLowerCase();
        this.subscriberId = event.headers["X-Qimb-NodeId"].toLowerCase();
        var content = JSON.parse(event.body);
        this.pushEndpoint = content.pushEndpoint;
        this.snsClient = new AWS.SNS();
        this.sqsClient = new AWS.SQS();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            var messageTypeQueueName = "qimb-type-" + this.messageType;
            var subscriberQueueName = "qimb-sub-" + this.subscriberId;
            var topicName = "qimb-type-" + this.messageType;
            console.log("Message type queue name: " + messageTypeQueueName);
            console.log("Subscriber queue name: " + subscriberQueueName);
            console.log("Topic name: " + topicName);
            var createMessageTypeQueuePromise = this.createQueue(messageTypeQueueName);
            var createSubscriberQueuePromise = this.createQueue(subscriberQueueName);
            var createTopicPromise = this.createTopic(topicName);
            var messageTypeQueueDetails = yield createMessageTypeQueuePromise;
            var subscriberQueueDetails = yield createSubscriberQueuePromise;
            var topicArn = yield createTopicPromise;
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
                var pushNotificationSubscriptionArn = yield this.subscribe(topicArn, this.pushEndpoint, "http");
                console.log("HTTP push subscribed to topic: " + pushNotificationSubscriptionArn);
            }
            var messageTypeSubscriptionArn = yield subscribeMessageTypeQueuePromise;
            var subscriberSubscriptionArn = yield subscribeSubscriberQueuePromise;
            console.log("SQS queue subscribed to topic: " + messageTypeSubscriptionArn);
            console.log("SQS queue subscribed to topic: " + subscriberSubscriptionArn);
        });
    }
    subscribe(topicArn, endpoint, protocol) {
        return __awaiter(this, void 0, void 0, function* () {
            var subscribeResponse = yield this.snsClient.subscribe({
                TopicArn: topicArn,
                Protocol: protocol,
                Endpoint: endpoint
            }).promise();
            return subscribeResponse.SubscriptionArn;
        });
    }
    createTopic(topicName) {
        return __awaiter(this, void 0, void 0, function* () {
            var createTopicResponse = yield this.snsClient.createTopic({
                Name: topicName
            }).promise();
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
}
exports.SubscribeRequest = SubscribeRequest;
