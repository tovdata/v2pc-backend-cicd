import { Construct } from "constructs";
import * as sns from "aws-cdk-lib/aws-sns";
// Service types
import { SERVICE_TYPE } from "../models/name";
// Util
import { createHashId, loadPolicyDocument } from "../utils/util";

export class Topic {
  private _scope: Construct;
  private _topic: sns.CfnTopic;

  constructor(scope: Construct) {
    this._scope = scope;
  }

  /**
   * Create cloudFormation resource for topic
   * @param name resource name for topic
   */
  public init(name: string): void {
    // Set properties for topic (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html)
    const props: sns.CfnTopicProps = {
      displayName: name,
      fifoTopic: false,
      tags: [{
        key: "Name",
        value: name
      },{
        key: "Position",
        value: "Notifications"
      },{
        key: "Project",
        value: "CICD-for-backend"
      }],
      topicName: name
    };
    // Create cloudFormation resource for topic
    this._topic = new sns.CfnTopic(this._scope, createHashId(JSON.stringify(props)), props);
    // Set a policy
    this.setPolicy();
  }

  /**
   * Create cloudFormation resource for subscription to amazon sqs queue
   * @param queueArn arn for queue
   */
  public setSubscripitionToSqs(queueArn: string): void {
    // Set properties for subscription (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-sns-subscription.html)
    const props: sns.CfnSubscriptionProps = {
      endpoint: queueArn,
      protocol: SERVICE_TYPE.SQS,
      rawMessageDelivery: false,
      topicArn: this._topic.ref
    };
    // Create cloudFormation resource for subscription
    new sns.CfnSubscription(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get a arn for toipc
   */
  public getArn() {
    return this._topic.ref;
  }

  /**
   * Get a name for topic
   * @returns 
   */
  public getName() {
    return this._topic.attrTopicName;
  }

  /**
   * Create cloudFormation resource for topic policy and assciate a topic
   */
  private setPolicy(): void {
    // Create a list of topic arn
    const topics: string[] = [this._topic.ref];
    // Load a policy document for topic
    const policyDocument: any = loadPolicyDocument(SERVICE_TYPE.SNS);
    // Set resource arn in policy document
    policyDocument.Statement[0].Resource = this._topic.ref;

    // Set properties for topic policy (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sns-policy.html)
    const props: sns.CfnTopicPolicyProps = {
      policyDocument: policyDocument,
      topics: topics
    };
    // Create cloudFormation resourse for topic policy
    new sns.CfnTopicPolicy(this._scope, createHashId(JSON.stringify(props)), props);
  }
};