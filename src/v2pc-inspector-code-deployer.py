import boto3
import json
import os

def lambda_handler(event, context):
  buildResult = None
  deploymentGroupName = None
  functionName = None
  
  ### Extract and transform event data
  try:
    # Transform body data to json
    bodyData = json.loads(event['Records'][0]['body'])
    # Extract event type and message
    eventType = bodyData['Type']
    message = bodyData['Message']
    # Transform message to json
    data = json.loads(message)
    
    # Extract build project name and build result
    projectName = data['detail']['project-name']
    buildResult = data['detail']['build-status']
    # Extract function name from project name and set deployment group name
    functionName = projectName.split('build-')[1]
    deploymentGroupName = 'deploy-' + functionName
  except:
    print('[ERROR] Data extraction or conversion failed')
    # Return
    return {
      'statusCode': 500,
      'body': json.dumps('Data extraction or conversion failed')
    }
  
  ### Deployment
  try:
    # If the result is successful, deal with it.
    if buildResult == "SUCCEEDED":
      # Create client for AWS CodeDeploy
      client = boto3.client('codedeploy')
      
      print("applicationName: " + os.environ['DEPLOY_APPLICATION'])
      print("deploymentGroupName: " + deploymentGroupName)
      print("bucket: " + os.environ['S3_BUCKET'])
      print("key: " + 'codeDeploy/' + functionName + '/appspec.yaml')
      
      # Create deployment
      response = client.create_deployment(
        applicationName=os.environ['DEPLOY_APPLICATION'],
        deploymentGroupName=deploymentGroupName,
        revision={
          'revisionType': 'S3',
          's3Location': {
            'bucket': os.environ['S3_BUCKET'],
            'key': 'codeDeploy/' + functionName + '/appspec.yaml',
            'bundleType': 'YAML'
          }
        }
      )
      print(response)
      
      print('[NOTICE] Deploy successful')
      # Return
      return {
        'statusCode': 200,
        'body': json.dumps('Deploy successful')
      }
    else:
      print('[ERROR] Build Failed')
      # Return
      return {
        'statusCode': 400,
        'body': json.dumps('Build faile')
      }
  except Exception as e:
    print(e)
    print(e.__traceback__)
    
    print('[ERROR] An error occurred during the deployment process')
    # Return
    return {
      'statusCode': 500,
      'body': json.dumps('An error occurred during the deployment process')
    }