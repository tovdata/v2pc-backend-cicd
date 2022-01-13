import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { createHashId } from "../utils/util";

export class Bucket {
  private _bucket: s3.CfnBucket;
  private _scope: Construct;

  constructor(scope: Construct) {
    this._scope = scope;
  }

  public init(name: string) {
    // Set properties for bucket (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket.html)
    const props: s3.CfnBucketProps = {
      bucketName: name,
      tags: [{
        key: "Name",
        value: name
      },{
        key: "Position",
        value: "storage"
      },{
        key: "Project",
        value: "CICD-for-v2pc-inspector-backend"
      }]
    };
    // Create cloudFormation resource for bucket
    this._bucket = new s3.CfnBucket(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for bucket
   * @returns arn for bucket
   */
  public getArn(): string {
    return this._bucket.attrArn;
  }

  /**
   * Get a domain name for bucket
   * @returns domain name for bucket
   */
  public getDomainName(): string {
    return this._bucket.attrDomainName;
  }

  /**
   * Get a name for bucket
   * @returns name for bucket
   */
  public getName(): string {
    return this._bucket.ref;
  }
}