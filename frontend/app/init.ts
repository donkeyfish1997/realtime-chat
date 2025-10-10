import { authControllerGetAccessToken } from "api/auth";
import { setGetTokenFunction } from "api/custom-instance";

export function init() {
  setGetTokenFunction(async () => {
    const { access_token, user } = await authControllerGetAccessToken();
    return { accessToken: access_token, user };
  });
}
