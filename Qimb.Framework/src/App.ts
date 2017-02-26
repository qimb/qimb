import * as PublishDirect from "./PublishDirect";
import * as Publish from "./Publish";
import * as Receive from "./Receive";
import * as Delete from "./Delete";
import * as SubscribeDirect from "./SubscribeDirect";
import * as Subscribe from "./Subscribe";

declare var exports: any;
declare var process: any;

var getSqsUrlPrefix = () => {
    return process.env.SQS_URL_PREFIX;
};
var getSnsArnPrefix = () => {
    return process.env.SNS_ARN_PREFIX;
};
exports.delete = async (event: any, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
    var request = new Delete.DeleteRequest(event);

    console.log("start");

    try {

        await request.execute(getSqsUrlPrefix());

        callback(null, { statusCode: 200 });
    } catch (e) {
        console.log("Exception: " + e);

        callback(null, { statusCode: 500 });
    }

    console.log("end");
}

exports.subscribe = async (event: any, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
    var request = new Subscribe.SubscribeRequest(event);

    console.log("start");

    try {

        await request.execute();

        callback(null, { statusCode: 200 });
    } catch (e) {
        console.log("Exception: " + e);

        callback(null, { statusCode: 500 });
    }

    console.log("end");
}

exports.publishDirect = async (event: any, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
    var request = new PublishDirect.PublishDirectRequest(event);

    console.log("start");
    console.log("request: " + JSON.stringify(event));

    try {

        var snsMessageId = await request.execute(getSnsArnPrefix());

        callback(null, { statusCode: 201, body: JSON.stringify({ snsMessageId: snsMessageId }) });
    } catch (e) {
        console.log("Exception: " + e);

        callback(null, { statusCode: 500 });
    }

    console.log("end");
}

exports.publish = async (event: any, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
    var request = new Publish.PublishRequest(event);

    console.log("start");
    console.log("request: " + JSON.stringify(event));

    try {

        var snsMessageId = await request.execute(getSnsArnPrefix());

        callback(null, { statusCode: 201, body: JSON.stringify({ snsMessageId: snsMessageId }) });
    } catch (e) {
        console.log("Exception: " + e);

        callback(null, { statusCode: 500 });
    }

    console.log("end");
}

exports.receive = async (event: any, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
    var request = new Receive.ReceiveRequest(event);

    console.log("start");

    try {

        var messages = await request.execute(getSqsUrlPrefix());

        callback(null, { statusCode: 200, body: JSON.stringify(messages) });
    } catch (e) {
        console.log("Exception: " + e);

        callback(null, { statusCode: 500 });
    }

    console.log("end");
}

exports.subscribeDirect = async (event: any, context: AWSLambda.Context, callback: AWSLambda.Callback) => {
    var request = new SubscribeDirect.SubscribeDirectRequest(event);
    console.log("start");

    try {

        await request.execute();


        callback(null, { statusCode: 200 });
    } catch (e) {
        console.log("Exception: " + e);

        callback(null, { statusCode: 500 });
    }

    console.log("end");
}