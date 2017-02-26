"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const AWS = require("aws-sdk");
"use strict";
class SubscribeDirectRequest {
    constructor(event) {
        this.subscriberId = event.headers["X-Qimb-NodeId"].toLowerCase();
        var content = JSON.parse(event.body);
        this.pushEndpoint = content.pushEndpoint;
        this.snsClient = new AWS.SNS();
        this.sqsClient = new AWS.SQS();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            var subscriberQueueName = "qimb-sub-" + this.subscriberId;
            var topicName = "qimb-sub-" + this.subscriberId;
            console.log("Subscriber queue name: " + subscriberQueueName);
            console.log("Topic name: " + topicName);
            var createSubscriberQueuePromise = this.createQueue(subscriberQueueName);
            var createTopicPromise = this.createTopic(topicName);
            var subscriberQueueDetails = yield createSubscriberQueuePromise;
            var topicArn = yield createTopicPromise;
            console
                .log("SQS queue created: " + subscriberQueueDetails.queueUrl + ":" + subscriberQueueDetails.queueArn);
            console.log("SNS topic created: " + topicArn);
            var subscribeSubscriberQueuePromise = this.subscribe(topicArn, subscriberQueueDetails.queueArn, "sqs");
            if (this.pushEndpoint) {
                var pushNotificationSubscriptionArn = yield this.subscribe(topicArn, this.pushEndpoint, "http");
                console.log("HTTP push subscribed to topic: " + pushNotificationSubscriptionArn);
            }
            var subscriberSubscriptionArn = yield subscribeSubscriberQueuePromise;
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
exports.SubscribeDirectRequest = SubscribeDirectRequest;
