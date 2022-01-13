import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
// Utils
import { createHashId, loadConfiguration } from "../utils/util";

export class Role {
  private _role: iam.CfnRole;
  private _scope: Construct;

  constructor(scope: Construct) {
    this._scope = scope;
  }

  public init(configFile: string):void {
    // Load a configuration data
    const config: any = loadConfiguration(configFile);
    // Set properties for role (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html)
    const props: iam.CfnRoleProps = {
      assumeRolePolicyDocument: {
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Principal": {
            "Service": config.assumeService
          },
          "Action": ["sts:AssumeRole"]
        }]
      },
      description: config.description,
      managedPolicyArns: config.managedPolicyArns,
      roleName: config.name
    };
    // Create cloudFormation resource for role
    this._role = new iam.CfnRole(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for role
   * @returns arn for role
   */
  public getArn(): string {
    return this._role.attrArn;
  }

  /**
   * Get an id for role
   * @returns id for role
   */
  public getId(): string {
    return this._role.attrRoleId;
  }
};