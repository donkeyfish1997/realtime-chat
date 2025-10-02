class Api {
  static async login(email: string, password: string) {
    if (email === "david@example.com" && password === "pass") {
      return {
        name: "David",
        email: "david@example.com",
        refreshToken: "aaabbcc",
      };
    }
    throw "verify error";
  }

  static async requestPasswordReset(email: string): Promise<{ token: string }> {
    if (email) {
      return { token: "a112233" };
    }
    throw "can't find email";
  }
  static async PasswordReset({
    token,
    identifier,
    newPassword,
  }: {
    token: string;
    identifier: string;
    newPassword: string;
  }): Promise<true> {
    if (token === "a112233") return true;
    throw "PasswordReset error";
  }
}

export default Api;
