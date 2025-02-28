import { getCurrentUser } from "aws-amplify/auth";

async function getUserInfo() {
  try {
    const { username, userId, signInDetails } = await getCurrentUser();
    console.log("Username:", username);
    console.log("User ID:", userId);
    console.log("Sign-in details:", signInDetails);
    return { username, userId, signInDetails };
  } catch (error) {
    console.error("Error getting user info:", error);
  }
}
export default getUserInfo;
