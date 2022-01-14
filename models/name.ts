/* Serivce name set */
export const SERVICE_NAME = {
  CODEDEPLOY: "v2pc-inspector-deployment-application",
  S3: "v2pc-inspector-operation-management",
  SECRETMANAGER: "v2pc-inspector-code-credentials",
  SNS: "v2pc-inspector-build-notifications",
  SQS: "v2pc-inspector-build-result-queue"
};
/* Service type set */
export const SERVICE_TYPE = {
  SECRETSMANAGER: "secretsmanager",
  SNS: "sns",
  SQS: "sqs"
}
/* Parameters */
export const PARAMETERS = {
  SECRET_ID: "github-access-token"
};