import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// Name set
import { SERVICE_NAME } from '../models/name';
// Resources
import { BuildProject } from '../resources/codebuild';
import { Role } from '../resources/iam';
import { Bucket } from '../resources/s3';
import { Topic } from '../resources/sns';
import { Queue } from '../resources/sqs';
// Util
import { loadConfiguration } from '../utils/util';

export class V2PcBackendInfraForCicdStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Set environment variables
    process.env.account = "";
    process.env.region = "ap-northeast-2";

    // Create an amazon s3 (bucket)
    const bucket = new Bucket(this);
    bucket.init(SERVICE_NAME.S3);
    // Create an amazon sns (topic)
    const topic = new Topic(this);
    topic.init(SERVICE_NAME.SNS);
    // Create an amazon sqs (queue)
    const queue = new Queue(this);
    queue.init(SERVICE_NAME.SQS);
    // Create subscription to sqs
    topic.setSubscripitionToSqs(queue.getArn());

    // Create the aws codebulid (build project)
    createBuildProjects(this, bucket.getArn(), topic.getArn());
  }
}

/**
 * Create the build projects
 * @param scope scope context
 * @param bucketArn arn for a3 bucket
 * @param topicArn arn for sns topic
 */
function createBuildProjects(scope: Construct, bucketArn: string, topicArn: string): void {
  // Create a role for build project
  const role = new Role(scope);
  role.init("roleForCodeBuild");

  // Load a configurations for build projects
  const configs: any = loadConfiguration("build");
  // Create the build project based config
  for (const config of configs) {
    const buildProject = new BuildProject(scope);
    buildProject.init(config, role.getArn(), bucketArn);
    // Create a notification rule
    buildProject.createNotificationRule(topicArn);
  }
}