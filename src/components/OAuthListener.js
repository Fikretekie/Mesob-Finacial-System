import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import getUserInfo from "../utils/Getuser";

const OAuthListener = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthFlow = async () => {
      try {
        console.log("🔵 OAuthListener started...");
        console.log("🔵 Full URL:", window.location.href);

        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        if (error) {
          console.error("🔴 OAuth error detected:", error);
          console.error("🔴 Error description:", errorDescription);
          console.error("🔴 Full query string:", window.location.search);
          throw new Error(`${error}: ${errorDescription || 'No description'}`);
        }

        console.log("🟢 No error found in search params, listening for sign-in...");

        // Hub.listen returns a function to stop listening
        const stopListening = Hub.listen("auth", async ({ payload }) => {
          console.log("🟡 Auth Event Received:", payload);

          // Changed from "signIn" to "signedIn"
          if (payload.event === "signedIn") {
            console.log("✅ User signed in event detected, fetching user...");

            try {
              const retryGetUser = async (attempt = 1) => {
                try {
                  console.log(`🔄 Attempt ${attempt} to fetch current user...`);
                  const user = await getCurrentUser();
                  console.log("✅ Successfully retrieved user:", user);
                  return user;
                } catch (error) {
                  console.error(`⚠️ Attempt ${attempt} failed:`, error);
                  if (attempt <= 3) {
                    await new Promise((resolve) =>
                      setTimeout(resolve, 500 * attempt)
                    );
                    return retryGetUser(attempt + 1);
                  }
                  throw error;
                }
              };

              const user = await retryGetUser();

              console.log("🔍 Fetching user info from backend...");
              const userInfo = await getUserInfo();
              console.log("✅ User info retrieved:", userInfo);

              localStorage.setItem("userId", userInfo.userId);
              localStorage.setItem("user_email", userInfo.email || "");
              localStorage.setItem("user_name", userInfo.name || "");
              localStorage.setItem("role", userInfo.role?.toString() || "2");

              console.log("✅ User data stored in localStorage.");

              navigate(
                userInfo.role === "2"
                  ? "/customer/dashboard"
                  : "/admin/dashboard"
              );
            } catch (err) {
              console.error("🔴 Error processing sign-in:", err);
              navigate("/login");
            } finally {
              // Call the function returned by Hub.listen to stop listening
              stopListening();
            }
          }
        });

        const timeout = setTimeout(() => {
          console.warn("⚠️ OAuth sign-in timeout reached, redirecting to login...");
          // Call the function to stop listening
          stopListening();
          navigate("/login");
        }, 10000);

        return () => {
          console.log("🛑 Cleaning up OAuth listener...");
          clearTimeout(timeout);
          // Call the function to stop listening
          stopListening();
        };
      } catch (error) {
        console.error("🔴 OAuth flow error:", error);
        navigate("/login");
      }
    };

    handleOAuthFlow();
  }, [navigate, searchParams]);

  return null;
};

export default OAuthListener;
