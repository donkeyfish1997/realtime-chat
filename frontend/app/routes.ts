import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "pages/LoginPage.tsx"),
  route("profile", "pages/ProfilePage.tsx"),
  route("forget-password", "pages/ForgetPasswordPage.tsx"),
  route("sign-up", "pages/SignUpPage.tsx"),
  route("chat", "pages/Chatpage.tsx"),
] satisfies RouteConfig;
