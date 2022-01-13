import { Construct } from "constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codestarnotifications from "aws-cdk-lib/aws-codestarnotifications";
// Util
import { createHashId } from "../utils/util";

export class BuildProject {
  private _project: codebuild.CfnProject;
  private _scope: Construct;

  constructor(scope: Construct) {
    this._scope = scope;
  }

  /**
   * Create cloudFormation resource for build project
   * @param config build project configuration
   * @param roleArn arn for role
   * @param bucketArn arn for bucket to store the artifacts
   */
  public init(config: any, roleArn: string, bucketArn: string): void {
    // Create artifacts properties (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-codebuild-project-artifacts.html)
    const artifacts: codebuild.CfnProject.ArtifactsProperty = {
      location: bucketArn,
      namespaceType: "NONE",
      overrideArtifactName: true,
      packaging: "ZIP",
      type: "S3"
    };
    
    // Set environment variables
    const environmentVariables: codebuild.CfnProject.EnvironmentVariableProperty[] = config.environments.map((elem: any): codebuild.CfnProject.EnvironmentVariableProperty => { return { name: elem.name, value: elem.value, type: "PLAINTEXT" }; });
    // Add s3 bucket name to store output in environment variables
    environmentVariables.push({ name: "S3_BUCKET", value: bucketArn, type: "PLAINTEXT" });
    // Create environment (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-codebuild-project-environment.html)
    const environment: codebuild.CfnProject.EnvironmentProperty = {
      computeType: "BUILD_GENERAL1_SMALL",
      environmentVariables: environmentVariables,
      image: "aws/codebuild/amazonlinux2-x86_64-standard:3.0",
      imagePullCredentialsType: "CODEBUILD",
      privilegedMode: false,
      type: "LINUX_CONTAINER"
    };

    // Create trigger (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-codebuild-project-projecttriggers.html)
    const trigger: codebuild.CfnProject.ProjectTriggersProperty = {
      buildType: "BUILD",                                       // a single build [BUILD|BUILD_BATCH]
      filterGroups: [[{
        pattern: "PUSH,PULL_REQUEST_MERGED",
        type: "EVENT"
      },{
        excludeMatchedPattern: false,
        pattern: "src/*",
        type: "FILE_PATH"                                       // the type of webhook filter [EVENT|ACTOR_ACCOUNT_ID|HEAD_REF|BASE_REF|FILE_PATH|COMMIT_MESSAGE]
      }]],
      webhook: true
    };

    // Create source (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-codebuild-project-source.html)
    const source: codebuild.CfnProject.SourceProperty = {
      type: "GITHUB",                                           // source type [BITBUCKET|CODECOMMIT|CODEPIPELINE|GITHUB|GITHUB_ENTERPRISE|NO_SOURCE|S3]
      gitCloneDepth: 1,
      location: config.source.location                                // source url for https
    };

    // Set properties for build project (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-codebuild-project.html)
    const props: codebuild.CfnProjectProps = {
      artifacts: artifacts,
      badgeEnabled: false,
      cache: {
        type: "NO_CACHE"
      },
      description: config.description,
      environment: environment,
      logsConfig: {
        cloudWatchLogs: {
          status: "ENABLED"
        }
      },
      name: config.name,
      serviceRole: roleArn,
      source: source,
      sourceVersion: config.source.branch,
      tags: [{
        key: "Name",
        value: config.name
      },{
        key: "Position",
        value: "builder"
      },{
        key: "Project",
        value: "CICD-for-v2pc-inspector-backend"
      }],
      triggers: trigger
    };
    // Create cloudFormation resource for build project
    this._project = new codebuild.CfnProject(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for build project
   * @returns arn for build project
   */
  public getArn(): string {
    return this._project.attrArn;
  }

  /**
   * Get a name for build project
   * @returns name for build project
   */
  public getName(): string {
    return this._project.ref;
  }

  /**
   * Create cloudFormation resource for notification rule
   * @param snsArn arn for sns topic
   */
  public createNotificationRule(topicArn: string): void {
    // Set properties (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-codestarnotifications-notificationrule.html)
    const props: codestarnotifications.CfnNotificationRuleProps = {
      detailType: "FULL",
      eventTypeIds: ["codebuild-project-build-state-failed", "codebuild-project-build-state-succeeded"],
      name: `${this._project.ref}-notifications`,
      resource: this._project.attrArn,
      status: "ENABLED",
      tags: {
        "Name": `${this._project.ref}-notifications`,
        "Position": "notification-rule",
        "Project": "CICD-for-v2pc-inspector-backend"
      },
      targets: [{
        targetAddress: topicArn,
        targetType: "SNS"
      }]
    };
    // Create cloudFormation resource for notification rule
    new codestarnotifications.CfnNotificationRule(this._scope, createHashId(JSON.stringify(props)), props);
  }
}