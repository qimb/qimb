# QIMB

QIMB is a zero management, platform agnostic message bus. 

* Serverless architecture powered 100% on AWS services such as SQS, SNS and Lambda
* Zero management
* Easy setup
* Cross platform
* Publish/Subscribe pattern (multicast and unicast message without knowing subscribers)
* Direct message (unicast to known receiver)
* Guarantied message delivery
* Push delivery (using http hooks)
* Pull delivery
* Scaleable
* Fault tolerant

## Delivery semantics

### Icons
| Application     | AWS API Gateway  | AWS Lambda      | AWS SNS         | AWS SQS         | HTTP Request    |
|:---------------:|:----------------:|:---------------:|:---------------:|:---------------:|:---------------:|
| ![Application](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-application.png "Application") | ![AWS API Gateway](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-apigateway.png "AWS API Gateway") | ![AWS Lambda](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-lambda.png "AWS Lambda") | ![AWS SNS](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-sns.png "AWS SNS") | ![AWS SQS](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-sqs.png "AWS SQS") | ![HTTP Request](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-httprequest.png "HTTP Request") |

### Publish/Subscribe Multicast
1. Subscribers subscribe to Message Types (Red, Orange, Purple)
2. Publishers send messages to QiMB using the Message Type
..* Publishers do not know the subscribers (or if there are any)
3. Message gets delivered to **all** subscribers of the Message Type

* If there are no subscribers when message is published, the message will never be delivered
* All subscribers are guarenteed to receive the message
* Messages may be delivered out of order

![Publish Subscribe](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/publish-subscribe-multicast.png "Publish Subscribe Multicast")

### Push Delivery
* Multicast messages can optionally be delivered through a HTTP web hook to decrease latency
..* Approx 150 - 250 ms latency

![Direct Message](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/publish-subscribe-multicast-push.png "Push Messages")

### Publish/Subscribe Unicast
1. Subscribers subscribe Message Types to Buckets 
..* e.g. Message Type "OrderCompleted" to Bucket "OrderDetails"
2. Publishers send messages to QiMB using the Message Type
..* Publishers do not know the subscribers (or if there are any)
3. Message gets delivered to **one** subscriber of the Bucket

* If there are no subscribers when message is published, the message will eventually be delivered
* Only one subscriber is guarenteed to receive the message
* Messages may be delivered out of order

![Direct Message](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/publish-subscribe-unicast.png "Direct Subscribe Unicast")

### Direct Message
1. Subscribers subscribe to Direct Messages
2. Publishers send messages to QiMB using the Node ID of the subscriber
..* Publishers needs to know the subcriber
3. Message gets delivered to the subscriber with the Node ID

* If there are no subscribers when message is published, the message will eventually be delivered
* Message is guarenteed to be delivered to the subscriber
* Messages may be delivered out of order

![Direct Message](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/direct-message.png "Direct Message")
