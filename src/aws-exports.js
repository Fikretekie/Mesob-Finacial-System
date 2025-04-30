import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    region: 'us-east-1', // e.g., 'us-east-1'
    userPoolId: 'us-east-1_us-east-1_laMPlcB1N',
    userPoolWebClientId: 'ulrla7en4ocu2gfbh9i536fnk',
    oauth: {
      domain: 'us-east-1lamplcb1n.auth.us-east-1.amazoncognito.com',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:3000', // your frontend URL
      redirectSignOut: 'http://localhost:3000',
      responseType: 'code' // 'code' for Authorization Code Grant
    }
  }
};

Amplify.configure(awsConfig);

export default awsConfig;
