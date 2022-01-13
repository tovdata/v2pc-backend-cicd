import { readFileSync } from "fs";
import { join } from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
// Util
import { createHashId } from "../utils/util";

// Directory path
const SRC_DIR = join(__dirname, "../src");

export class LambdaFunction {
  private _function: lambda.CfnFunction;
  private _scope: Construct;

  constructor(scope: Construct) {
    this._scope = scope;
  }

  /**
   * Create cloudFormation resource for function
   * @param roleArn arn for role 
   * @param config function configuration
   */
  public init(roleArn: string, config: any): void {
    // Set properties for function (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html)
    const props: lambda.CfnFunctionProps = {
      architectures: ["x86_64"],
      code: {
        zipFile: readFileSync(join(SRC_DIR, `${config.name}.py`)).toString("utf8")
      },
      description: config.description,
      functionName: config.name,
      handler: "index.lambda_handler",
      memorySize: config.memory,
      role: roleArn,
      runtime: "python3.9",
      tags: [{
        key: "Name",
        value: config.name
      },{
        key: "Position",
        value: "code-deployer"
      },{
        key: "Project",
        value: "CICD-for-v2pc-inspector-backend"
      }],
      timeout: config.timeout
    };
    // Create cloudFormation resource for lambda function
    this._function = new lambda.CfnFunction(this._scope, createHashId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for function
   * @returns arn for function
   */
  public getArn(): string {
    return this._function.attrArn;
  }

  /**
   * Get a name for function
   * @returns name for function
   */
  public getName(): string {
    return this._function.ref;
  }

  /**
   * Set environment variables for function
   * @param variables environment variables
   */
  public setEnvironmentVariables(variables: any) {
    this._function.addPropertyOverride("Environment", {
      "Variables": variables
    });
  }

  /**
   * Set trigger
   * @param srcArn arn for source resource
   */
  public setTrigger(srcArn: string) {
    // Set properties for event source mapping (Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-eventsourcemapping.html)
    const props: lambda.CfnEventSourceMappingProps = {
      batchSize: 1,
      eventSourceArn: srcArn,
      functionName: this._function.ref
    };
    // Create cloudFormation resource for event source mapping
    new lambda.CfnEventSourceMapping(this._scope, createHashId(JSON.stringify(props)), props);
  }
}