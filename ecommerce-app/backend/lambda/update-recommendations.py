import boto3
import json

def lambda_handler(event, context):
    # Initialize the EMR Serverless client
    client = boto3.client("emr-serverless")

    # Extract parameters from the event
    application_id = "00foem0grmo6ru3d"
    execution_role_arn = "arn:aws:iam::329599659312:role/recommendation_engine_emr_serverless_role"
    entry_point = "s3://recommendation-engine-emr-files/recommendation_engine_serverless.py"
    dependencies = "s3://recommendation-engine-emr-files/dependencies.zip"

    try:
        # Submit the job
        response = client.start_job_run(
            applicationId=application_id,
            executionRoleArn=execution_role_arn,
            jobDriver={
                "sparkSubmit": {
                    "entryPoint": entry_point,
                    "sparkSubmitParameters": f"--py-files {dependencies}",
                }
            },
        )
        # Return the Job Run ID
        return {
            "statusCode": 200,
            "body": json.dumps(
                {
                    "message": "Job submitted successfully!",
                    "jobRunId": response["jobRunId"],
                }
            ),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Error submitting job.", "error": str(e)}),
        }


# print(lambda_handler(None, None))