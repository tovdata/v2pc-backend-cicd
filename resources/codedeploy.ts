import { Construct } from "constructs";
import * as codedeploy from "aws-cdk-lib/aws-codedeploy";
// Util
import { createHashId } from "../utils/util";

export class Application {
  private _application: codedeploy.CfnApplication;
  private _deployGroups: codedeploy.CfnDeploymentGroup[];
  private _scope: Construct;

  constructor(scope: Construct) {
    this._scope = scope;
    this._deployGroups = [];
  }

  /**
   * Create cloudFormation resource for deploy application
   * @param name application name
   */
  public init(name: string): void {
    // Set properties for codedeploy application (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-codedeploy-application.html)
    const props: codedeploy.CfnApplicationProps = {
      applicationName: name,
      computePlatform: "Lambda",
      tags: [{
        key: "Name",
        value: name
      },{
        key: "Position",
        value: "deploy-group"
      },{
        key: "Project",
        value: "CICD-for-v2pc-inspector-backend"
      }]
    };
    // Create cloudFormation resource for deploy application
    this._application = new codedeploy.CfnApplication(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get a name for deploy application
   * @returns name for deploy application
   */
  public getName(): string {
    return this._application.ref;
  }

  /**
   * Create cloudFormation resource for deployment group
   * @param roleArn arn for role
   * @param config deployment group configuration
   */
  public createDeploymentGroup(roleArn: string, config: any): void {
    // Set properties for deployment group (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-codedeploy-deploymentgroup.html)
    const props: codedeploy.CfnDeploymentGroupProps = {
      applicationName: this._application.ref,
      autoRollbackConfiguration: {
        enabled: true,
        events: ["DEPLOYMENT_FAILURE"]
      },
      deploymentConfigName: config.deploymentConfigName,
      deploymentGroupName: config.name,
      deploymentStyle: {
        deploymentOption: "WITH_TRAFFIC_CONTROL",
        deploymentType: "BLUE_GREEN"
      },
      serviceRoleArn: roleArn
    };
    // Create cloudFormation resource for deployment group
    const cfnDeploymentGroup = new codedeploy.CfnDeploymentGroup(this._scope, createHashId(JSON.stringify(props)), props);
    // Append
    this._deployGroups.push(cfnDeploymentGroup);
  }
};