# QIMB

QIMB is a zero management, platform agnostic message bus. 

* Serverless architecture powered 100% on AWS services such as SQS, SNS and Lambda (No software, database, queue to install)
* Zero management (no servers or software to maintain)
* Cross Platform (use it from windows, linux, mac, mobile, web-sockets in any programming language)
* Publish/Subscribe pattern (multicast message without knowing subscribers)
* Point-to-point message delivery (singlecast to known receiver)
* Guarantied message delivery
* Push delivery (using http hooks)
* Pull delivery

## Delivery semantics

| Application     | AWS API Gateway  | AWS Lambda      | AWS SNS         | AWS SQS         | HTTP Request    |
|:---------------:|:----------------:|:---------------:|:---------------:|:---------------:|:---------------:|
| ![Application](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-application.png "Application") | ![AWS API Gateway](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-apigateway.png "AWS API Gateway") | ![AWS Lambda](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-lambda.png "AWS Lambda") | ![AWS SNS](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-sns.png "AWS SNS") | ![AWS SQS](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-sqs.png "AWS SQS") | ![HTTP Request](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/signature-httprequest.png "HTTP Request") |

![Publish Subscribe](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/publish-subscribe-multicast.png "Publish Subscribe Multicast")
![Direct Message](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/publish-subscribe-multicast-push.png "Push Messages")
![Direct Message](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/publish-subscribe-unicast.png "Direct Subscribe Unicast")
![Direct Message](https://raw.githubusercontent.com/qimb/qimb/master/doc/images/direct-message.png "Direct Message")
