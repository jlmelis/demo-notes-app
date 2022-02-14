import * as iam from 'aws-cdk-lib/aws-iam';
import * as sst from '@serverless-stack/resources';

export default class AuthStack extends sst.Stack {
    // Public reference to the auth instance
    auth;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { api, bucket } = props;

        // Create a Cognito User Pool and Identity Pool
        this.auth = new sst.Auth(this, 'Auth', {
            cognito: {
                userPool: {
                    // Users can login with their email and passwords
                    signInAliases: { email: true },
                },
            },
        });

        this.auth.attachPermissionsForAuthUsers([
            // allow access to the api
            api,
            // Policy granting access to a specific folder in the bucket
            new iam.PolicyStatement({
                actions: ['s3:*'],
                effect: iam.Effect.ALLOW,
                resources: [
                    bucket.bucketArn + '/private/${cognito-identity.amazonaws.com:sub}/*',
                ]
            })
        ]);

        // Show the auth resources in the output
        this.addOutputs({
            Region: scope.region,
            UserPoolId: this.auth.cognitoUserPool.userPoolId,
            IndentityPoolId: this.auth.cognitoCfnIdentityPool.ref,
            UserPoolClientId: this.auth.cognitoUserPoolClient.userPoolClientId,
        });
    }
}