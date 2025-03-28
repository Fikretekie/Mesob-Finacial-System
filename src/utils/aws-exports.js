import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
Amplify.configure = {
  ...awsconfig,
  oauth: {
    region: "us-east-1", // Change to your AWS region
    userPoolId: "us-east-1_us-east-1_laMPlcB1N", // Replace with your Cognito User Pool ID
    userPoolWebClientId: "ulrla7en4ocu2gfbh9i536fnk", // Replace with your Cognito App Client ID
    mandatorySignIn: false, // Set to true if sign-in is required before accessing the app
    authenticationFlowType: "USER_PASSWORD_AUTH", // Can be "USER_SRP_AUTH" for Secure Remote Password authentication
    oauth: {
      domain: "your-auth-domain.auth.us-east-1.amazoncognito.com",
      scope: ["email", "openid", "profile"],
      redirectSignIn: "http://localhost:3000/", // Change for production
      redirectSignOut: "http://localhost:3000/",
      responseType: "token", // or "code" for authorization code flow
    },
  },
};

export default awsConfig;
