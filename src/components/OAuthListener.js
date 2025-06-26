import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const OAuthListener = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch user info from Cognito's /oauth2/userInfo endpoint
  const fetchUserInfoFromOAuth = async () => {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      if (!accessToken) throw new Error("No access token available");

      const response = await fetch(
        "https://us-east-1avaiojcoe.auth.us-east-1.amazoncognito.com/oauth2/userInfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`UserInfo request failed: ${response.status}`);
      const userInfo = await response.json();
      console.log("🔍 User info from /oauth2/userInfo:", userInfo);
      return userInfo;
    } catch (error) {
      console.error("❌ Failed to fetch user info from OAuth endpoint:", error);
      throw error;
    }
  };

  useEffect(() => {
    const handleOAuthFlow = async () => {
      try {
        console.log("🔵 OAuthListener started...");
        console.log("🔵 Full URL:", window.location.href);

        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        if (error) {
          console.error("🔴 OAuth error:", error, errorDescription);
          navigate("/login", {
            state: {
              error: "oauth_failed",
              message: errorDescription || "OAuth error",
            },
            replace: true,
          });
          return;
        }

        console.log("🟢 Listening for sign-in...");

        const stopListening = Hub.listen("auth", async ({ payload }) => {
          console.log("🟡 Auth Event:", payload);

          if (payload.event === "signedIn") {
            console.log("✅ Signed in, fetching user...");

            try {
              // Get current user
              const user = await getCurrentUser();

              let provider = localStorage.getItem("provider");

              if (user.username && user.username.startsWith("apple_")) {
                provider = "Apple";
              } else if (user.username && user.username.startsWith("google_")) {
                provider = "Google";
              }
              console.log("✅ User:", user);

              let email = null;
              let userName = null;

              // Try from signInDetails
              if (
                user.signInDetails?.loginId &&
                user.signInDetails.loginId.includes("@")
              ) {
                email = user.signInDetails.loginId;
                console.log("📧 Email from signInDetails:", email);
              }

              // Fallback: get from /oauth2/userInfo
              if (!email) {
                console.log(
                  "🔍 Fetching user info from OAuth userInfo endpoint..."
                );
                try {
                  const userInfo = await fetchUserInfoFromOAuth();
                  email = userInfo.email;
                  userName = userInfo.name || userInfo.given_name || "";
                  console.log("📧 Email from OAuth userInfo:", email);
                  console.log("👤 Name from OAuth userInfo:", userName);
                } catch (userInfoError) {
                  console.error(
                    "❌ Could not fetch from OAuth userInfo:",
                    userInfoError
                  );
                  navigate(`/signup?provider=${provider}&needsEmail=true`, {
                    replace: true,
                  });
                  return;
                }
              }

              if (!email) {
                console.error("❌ No email retrieved from any method");
                navigate(`/signup?provider=${provider}&needsEmail=true`, {
                  replace: true,
                });
                return;
              }

              console.log("📧 Final email:", email);

              // Check if user exists in DynamoDB
              console.log("🔍 Checking user in DynamoDB...");
              try {
                const checkResponse = await fetch(
                  `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Signup?email=${encodeURIComponent(
                    email
                  )}`,
                  {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  }
                );

                console.log("🔍 API Response Status:", checkResponse.status);

                if (!checkResponse.ok) {
                  throw new Error(`API error: ${checkResponse.status}`);
                }

                const checkResult = await checkResponse.json();
                console.log("🔎 API Result:", checkResult);

                if (!checkResult.exists) {
                  // User does not exist, redirect to signup
                  console.log("🆕 New user, redirecting to signup...");
                  localStorage.setItem("socialSignup", "true");
                  localStorage.setItem("socialEmail", email);
                  localStorage.setItem("socialProvider", provider);

                  const finalName = userName || "";

                  navigate(
                    `/signup?provider=${provider}&email=${encodeURIComponent(
                      email
                    )}&userId=${user.userId}&name=${encodeURIComponent(
                      finalName
                    )}`,
                    { replace: true }
                  );
                  return;
                } else {
                  console.log("✅ User exists, proceeding with sign-in...");
                  const userData = checkResult.user;
                  console.log("🔎 API Result:", checkResult);
                  localStorage.clear();
                  localStorage.setItem("userId", userData.id);
                  localStorage.setItem("user_email", userData.email || email);
                  localStorage.setItem("user_name", userData.name || "");
                  localStorage.setItem(
                    "role",
                    userData.role?.toString() || "2"
                  );
                  localStorage.setItem(
                    "outstandingDebt",
                    userData.outstandingDebt || "0"
                  );
                  localStorage.setItem(
                    "valueableItems",
                    userData.valueableItems || "0"
                  );
                  localStorage.setItem(
                    "cashBalance",
                    userData.cashBalance || "0"
                  );
                  localStorage.setItem("authToken", "authenticated");

                  console.log("✅ Existing user, navigating to dashboard...");
                  const dashboardPath =
                    userData.role === 2
                      ? "/customer/dashboard"
                      : "/admin/dashboard";
                  navigate(dashboardPath, { replace: true });
                }
              } catch (apiError) {
                console.error("🔴 API Error:", apiError);
                navigate("/login", {
                  state: {
                    error: "api_failed",
                    message: "Could not verify user account",
                  },
                  replace: true,
                });
              }
            } catch (err) {
              console.error("🔴 Sign-in processing error:", err);
              navigate("/login", {
                state: {
                  error: "auth_failed",
                  message: err.message || "Authentication failed",
                },
                replace: true,
              });
            } finally {
              stopListening();
            }
          }
        });
      } catch (error) {
        console.error("🔴 OAuth flow error:", error);
        navigate("/login", {
          state: {
            error: "oauth_failed",
            message: error.message || "OAuth flow failed",
          },
          replace: true,
        });
      }
    };

    handleOAuthFlow();
  }, [navigate, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div>Processing sign-in...</div>
    </div>
  );
};

export default OAuthListener;
