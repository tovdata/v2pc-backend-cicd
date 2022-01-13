import { Aws, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// Name set
import { SERVICE_NAME } from '../models/name';
// Resources
import { Topic } from "../resources/sns";
import { Queue } from "../resources/sqs";

export class V2PcBackendInfraForCicdStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Set environment variables
    process.env.account = "";
    process.env.region = "ap-northeast-2";

    // Create an amazon sns (topic)
    const topic = new Topic(this);
    topic.init(SERVICE_NAME.SNS);
    // Create an amazon sqs (queue)
    const queue = new Queue(this);
    queue.init(SERVICE_NAME.SQS);
    // Create subscription to sqs
    topic.setSubscripitionToSqs(queue.getArn());
  }
}
