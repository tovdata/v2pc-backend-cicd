import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
// Service types
import { SERVICE_TYPE } from "../models/name";
// Util
import { createHashId, loadPolicyDocument } from "../utils/util";

export class Queue {
  private _scope: Construct;
  private _queue: sqs.CfnQueue;

  constructor(scope: Construct) {
    this._scope = scope;
  }

  /**
   * Create cloudFormation resource for queue
   * @param name resource name for queue
   */
  public init(name: string) {
    // Set properties for queue (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html)
    const props: sqs.CfnQueueProps = {
      delaySeconds: 0,
      maximumMessageSize: 262144,
      messageRetentionPeriod: 86400,
      queueName: name,
      receiveMessageWaitTimeSeconds: 0,
      tags: [{
        key: "Name",
        value: name
      },{
        key: "Position",
        value: "build-result-queue"
      },{
        key: "Project",
        value: "CICD-for-v2pc-inspector-backend"
      }],
      visibilityTimeout: 30
    };
    // Create cloudFormation resource for queue
    this._queue = new sqs.CfnQueue(this._scope, createHashId(JSON.stringify(props)), props);
    // Set a policy
    this.setPolicy();
  }

  /**
   * Get a arn for queue
   * @returns arn for queue
   */
   public getArn(): string {
    return this._queue.attrArn;
  }

  /**
   * Get a name for queue
   * @returns name for queue
   */
  public getName(): string {
    return this._queue.attrQueueName;
  }

  /**
   * Get a url for queue
   * @returns url for queue
   */
   public getUrl(): string {
    return this._queue.ref;
  }

  /**
   * Create cloudFormation resource for queue policy and assciate a queue
   */
  private setPolicy() {
    // Create a list of queue
    const queues: string[] = [this._queue.ref];
    // Load a policy document for queue
    const policyDocument: any = loadPolicyDocument(SERVICE_TYPE.SQS);
    // Set resource arn in policy document
    policyDocument.Statement[0].Resource = this._queue.attrArn;

    // Set properties for queue policy (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-sqs-queuepolicy.html)
    const props: sqs.CfnQueuePolicyProps = {
      policyDocument: policyDocument,
      queues: queues
    };
    // Create cloudFormation resource for queue policy
    new sqs.CfnQueuePolicy(this._scope, createHashId(JSON.stringify(props)), props);
  }
};