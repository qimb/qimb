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
const PublishDirect = require("./PublishDirect");
const Publish = require("./Publish");
const Receive = require("./Receive");
const Delete = require("./Delete");
const SubscribeDirect = require("./SubscribeDirect");
const Subscribe = require("./Subscribe");
var getSqsUrlPrefix = () => {
    return process.env.SQS_URL_PREFIX;
};
var getSnsArnPrefix = () => {
    return process.env.SNS_ARN_PREFIX;
};
exports.delete = (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
    var request = new Delete.DeleteRequest(event);
    console.log("start");
    try {
        yield request.execute(getSqsUrlPrefix());
        callback(null, { statusCode: 200 });
    }
    catch (e) {
        console.log("Exception: " + e);
        callback(null, { statusCode: 500 });
    }
    console.log("end");
});
exports.subscribe = (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
    var request = new Subscribe.SubscribeRequest(event);
    console.log("start");
    try {
        yield request.execute();
        callback(null, { statusCode: 200 });
    }
    catch (e) {
        console.log("Exception: " + e);
        callback(null, { statusCode: 500 });
    }
    console.log("end");
});
exports.publishDirect = (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
    var request = new PublishDirect.PublishDirectRequest(event);
    console.log("start");
    console.log("request: " + JSON.stringify(event));
    try {
        var snsMessageId = yield request.execute(getSnsArnPrefix());
        callback(null, { statusCode: 201, body: JSON.stringify({ snsMessageId: snsMessageId }) });
    }
    catch (e) {
        console.log("Exception: " + e);
        callback(null, { statusCode: 500 });
    }
    console.log("end");
});
exports.publish = (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
    var request = new Publish.PublishRequest(event);
    console.log("start");
    console.log("request: " + JSON.stringify(event));
    try {
        var snsMessageId = yield request.execute(getSnsArnPrefix());
        callback(null, { statusCode: 201, body: JSON.stringify({ snsMessageId: snsMessageId }) });
    }
    catch (e) {
        console.log("Exception: " + e);
        callback(null, { statusCode: 500 });
    }
    console.log("end");
});
exports.receive = (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
    var request = new Receive.ReceiveRequest(event);
    console.log("start");
    try {
        var messages = yield request.execute(getSqsUrlPrefix());
        callback(null, { statusCode: 200, body: JSON.stringify(messages) });
    }
    catch (e) {
        console.log("Exception: " + e);
        callback(null, { statusCode: 500 });
    }
    console.log("end");
});
exports.subscribeDirect = (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
    var request = new SubscribeDirect.SubscribeDirectRequest(event);
    console.log("start");
    try {
        yield request.execute();
        callback(null, { statusCode: 200 });
    }
    catch (e) {
        console.log("Exception: " + e);
        callback(null, { statusCode: 500 });
    }
    console.log("end");
});
