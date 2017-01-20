declare module "aws-lambda" {

    export class Exports {
        public handler: (event: IEvent, context: Context, callback: Callback) => void;
    }

    interface Context {
        /**
         * You should call this method when your job become done.
         *
         * @param err If any error is happen.
         * @param value Pass some string to log to console.
         */
        done(err: any, value: string): void;

        /**
         * An unique string ID for each invocation.
         */
        invokeid: string;
    }

    interface IEvent {
    }

    export class EventBase<T> implements IEvent {
        Records: Array<T>
    }

    export class RecordBase {
        eventVersion: string;
        eventSource: string;
    }

    interface Callback { (err: any, value: any): void }

// SNS Event

    export class SNSEvent extends EventBase<SNSRecord> {
    }

    export class SNSRecord extends RecordBase {
        eventSubscriptionArn: string;
        sns: SNS;
    }

    export class SNS {
        SignatureVersion: number;
        Timestamp: string;
        Signature: string;
        signingCertUrl: string;
        messageId: string;
        message: string;
        type: string;
        unsubscribeUrl: string;
        topicArn: string;
        subject: string;
    }


// S3 Put Event

    export class S3PutEvent extends EventBase<S3PutRecord> {
    }

    export class S3PutRecord extends RecordBase {
        awsRegion: string;
        eventTime: string;
        eventName: string;
        userIdentity: S3UserIdentity;
        requestParameters: S3RequestParameters;
        responseElements: S3ResponseElements;
        s3: S3;
    }

    export class S3UserIdentity {
        principalId: string;
    }

    export class S3RequestParameters {
        sourceIPAddress: string;
    }

    export class S3ResponseElements {
        "x-amz-request-id": string;
        "x-amz-id-2": string;
    }

    export class S3 {
        s3SchemaVersion: string;
        configurationId: string;
        bucket: S3Bucket;
        object: S3Object;
    }

    export class S3Bucket {
        name: string;
        ownerIdentity: S3UserIdentity;
        arn: string;
    }

    export class S3Object {
        key: string;
        size: number;
        eTag: string;
    }
}