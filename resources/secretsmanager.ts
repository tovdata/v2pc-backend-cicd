import { Construct } from "constructs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as customresource from "aws-cdk-lib/custom-resources";
// Util
import { createHashId, loadRawData } from "../utils/util";
// Name set
import { PARAMETERS, SERVICE_NAME, SERVICE_TYPE } from "../models/name";

export class Secret {
  private _secret: secretsmanager.CfnSecret;
  private _scope: Construct;

  constructor(scope: Construct) {
    this._scope = scope;
  }

  /**
   * Create cloudFormation resource for secret
   */
  public init(): void {
    // Set properties for secret (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-secretsmanager-secret.html)
    const props: secretsmanager.CfnSecretProps = {
      description: "Token for accessing github used by codebuild",
      name: SERVICE_NAME.SECRETMANAGER,
      secretString: `{"${PARAMETERS.SECRET_ID}":""}`
    };
    // Create cloudFormation resource for secret
    this._secret = new secretsmanager.CfnSecret(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for secret
   * @returns arn for secret
   */
  public getArn(): string {
    return this._secret.ref;
  }

  /**
   * Set default secret value (for github access token)
   */
  public setDefaultSecretValue(): void {
    // Set properties for aws sdk call (Ref. https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.AwsSdkCall.html)
    const props: customresource.AwsCustomResourceProps = {
      onCreate: {
        action: "putSecretValue",
        service: "SecretsManager",
        apiVersion: "2017-10-17",
        parameters: {
          SecretId: this._secret.ref,
          SecretString: loadRawData(SERVICE_TYPE.SECRETSMANAGER)
        },
        physicalResourceId: customresource.PhysicalResourceId.of(this._secret.ref)
      },
      policy: customresource.AwsCustomResourcePolicy.fromSdkCalls({
        resources: customresource.AwsCustomResourcePolicy.ANY_RESOURCE
      })
    };
    // Create an aws custom resource for aws sdk call
    new customresource.AwsCustomResource(this._scope, "AwsSdkCall", props);
  }
}