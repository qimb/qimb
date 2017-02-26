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
class DeleteRequest {
    constructor(event) {
        this.subscriberId = event.headers["X-Qimb-NodeId"];
        this.receiptHandle = decodeURIComponent(event.pathParameters.handle);
        this.sqsClient = new AWS.SQS();
    }
    execute(queueUrlPrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            var queueUrl = queueUrlPrefix + "qimb-sub-" + this.subscriberId;
            console.log("Queue Url: " + queueUrl);
            console.log("Receipt Handle: " + this.receiptHandle);
            yield this.sqsClient.deleteMessage({
                QueueUrl: queueUrl,
                ReceiptHandle: this.receiptHandle
            }).promise();
        });
    }
}
exports.DeleteRequest = DeleteRequest;
