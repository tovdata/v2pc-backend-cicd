import { SecretsManagerClient, CreateSecretCommand, CreateSecretCommandInput, CreateSecretCommandOutput } from "@aws-sdk/client-secrets-manager"
// Model
import { SERVICE_NAME, SERVICE_TYPE } from "../models/name";
// Util
import { loadConfiguration } from "../utils/util";

(async function() {
  // Create client
  const client: SecretsManagerClient = new SecretsManagerClient({ region: "ap-northeast-2" });

  // Set properties for secret
  const props: CreateSecretCommandInput = {
    Description: "Token for accessing github used by codebuild",
    Name: SERVICE_NAME.SECRETMANAGER,
    SecretString: JSON.stringify(loadConfiguration(SERVICE_TYPE.SECRETSMANAGER))
  };
  // Create command using properties
  const command: CreateSecretCommand = new CreateSecretCommand(props);

  // Execute command
  const response: CreateSecretCommandOutput = await client.send(command);
  console.log(response);
})();