import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// Name set
import { SERVICE_NAME } from '../models/name';
// Resources
import { BuildProject, createSourceCredentials } from '../resources/codebuild';
import { Application } from '../resources/codedeploy';
import { Role } from '../resources/iam';
import { LambdaFunction } from '../resources/lambda';
import { Bucket } from '../resources/s3';
import { Topic } from '../resources/sns';
import { Queue } from '../resources/sqs';
// Util
import { loadConfiguration } from '../utils/util';

export class V2PcBackendInfraForCicdStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
    createBuildProjects(this, bucket.getArn(), bucket.getName(), topic.getArn());

    // Create the aws lambda (function for deploy)
    createLambdaFunctionForDeploy(this, queue.getArn());

    // Create the aws codedeploy (deployment application and groups)
    createDeploymentApplication(this);
  }
}

/**
 * Create the build projects
 * @param scope scope context
 * @param bucketArn arn for a3 bucket
 * @param topicArn arn for sns topic
 */
function createBuildProjects(scope: Construct, bucketArn: string, bucketName: string, topicArn: string): void {
  // Set a source credentials for codebuild
  createSourceCredentials(scope);

  // Create a role for build project
  const role = new Role(scope);
  role.init("roleForCodeBuild");

  // Load a configurations for build projects
  const configs: any = loadConfiguration("build");
  // Create the build project based config
  for (const config of configs) {
    const buildProject = new BuildProject(scope);
    buildProject.init(config, role.getArn(), bucketArn, bucketName);
    // Create a notification rule
    buildProject.createNotificationRule(topicArn);
  }
}

/**
 * Create the deployment application
 * @param scope scope context
 */
function createDeploymentApplication(scope: Construct): void {
  // Create a role for deployment group
  const role = new Role(scope);
  role.init("roleForCodeDeploy");

  // Create a deployment application
  const application = new Application(scope);
  application.init(SERVICE_NAME.CODEDEPLOY);

  // Load a configuration for deployment group
  const configs: any = loadConfiguration("deploy");
  // Create the deployment group based config
  for (const config of configs) {
    application.createDeploymentGroup(role.getArn(), config);
  }
}

/**
 * Create the function for deploy
 * @param scope scope context
 * @param sqsArn arn for sqs
 */
function createLambdaFunctionForDeploy(scope: Construct, sqsArn: string): void {
  // Create a role for lambda function
  const role = new Role(scope);
  role.init("roleForLambda");

  // Load a configuration for lambda function
  const config = loadConfiguration("lambda");
  // Set enviroment variables
  const variables: any = {
    "DEPLOY_APPLICATION": SERVICE_NAME.CODEDEPLOY,
    "S3_BUCKET": SERVICE_NAME.S3
  };

  // Create a lambda function (deployer)
  const lambdaFunc = new LambdaFunction(scope);
  lambdaFunc.init(role.getArn(), config);
  // Set environment variables
  lambdaFunc.setEnvironmentVariables(variables);
  // Set trigger
  lambdaFunc.setTrigger(sqsArn);
}