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
class ReceiveRequest {
    constructor(event) {
        this.subscriberId = event.headers["X-Qimb-NodeId"];
        this.sqsClient = new AWS.SQS();
    }
    execute(sqsUrlPrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            var queueUrl = sqsUrlPrefix + "qimb-sub-" + this.subscriberId;
            console.log("Queue Url: " + queueUrl);
            var receiveMessageResponse = yield this.sqsClient.receiveMessage({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 10,
                VisibilityTimeout: 10
            }).promise();
            if (receiveMessageResponse.Messages) {
                var messages = new Array();
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
            }
            else {
                console.log("No messages");
                return [];
            }
        });
    }
}
exports.ReceiveRequest = ReceiveRequest;
