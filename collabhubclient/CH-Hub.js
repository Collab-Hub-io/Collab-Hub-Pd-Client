// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the PD-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
// --------------------------------------------------------------------------

import http from "http";
import https from "https";
import { io } from "socket.io-client";
// future versions will require other environment libraries (like OSC, P5.js, etc)
import { PDClient } from "./pd-lib.cjs";
import { OSCClient } from "./osc-lib.js";
import { NORNSClient } from "./norns-lib.js";

export const MESSAGETYPE = {
  EVENT: "event",
  CONTROL: "control",
  CHAT: "chat",
};

export const ENVIRONMENT = {
  ARDUINO: "arduino",
  PD: "pd",
  MAX: "max",
  PROCESSING: "processing",
  UNITY: "unity",
  OSC: "osc",
  NORNS: "norns",
};

// most current server is V3.2
export const CH = {
  DEFAULT: "https://server.collab-hub.io",
  LOCAL: "http://localhost:3000",
};

const AUTH_ERROR_PATTERN = /(token|auth|credential)/i;

export class Collabclient {
  constructor(options) {
    const resolvedOptions = options || {};

    // CH server details
    this.namespace = resolvedOptions.namespace || "/hub";
    this.url = resolvedOptions.url || CH.DEFAULT;

    // Client and Environment details
    this.name = resolvedOptions.name || "CH-Client";
    this.username = resolvedOptions.username || "";
    this.password = resolvedOptions.password || "";
    this.environment = resolvedOptions.environment || ENVIRONMENT.MAX;
    this.recPort = resolvedOptions.recPort;
    this.sendPort = resolvedOptions.sendPort;
    this.ipAddress = resolvedOptions.ipAddress;
    this.passwordAuthEnabled =
      this.username.length > 0 && this.password.length > 0;
    this.socketUsername = this.username;
    this.authState = {
      accessToken: "",
      refreshToken: "",
      username: this.username,
      mode: "",
    };

    console.log(this.url + this.namespace);
    this.socket = io.connect(this.url + this.namespace, {
      query: { username: this.socketUsername },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
    });

    // client options components
    let clientoptions = {
      toClientMethod: this.toClient.bind(this),
      name: this.name,
      username: this.username,
      environment: this.environment,
      recPort: this.recPort || "",
      sendPort: this.sendPort || "",
      ipAddress: this.ipAddress || "",
      socket: this.socket,
    };

    // env specific -- PD
    if (this.environment == ENVIRONMENT.PD) {
      this.client = new PDClient(clientoptions);
    }

    // env specific -- OSC
    if (this.environment == ENVIRONMENT.OSC) {
      this.client = new OSCClient(clientoptions);
    }

    if (this.environment == ENVIRONMENT.NORNS) {
      this.client = new NORNSClient(clientoptions);
    }

    console.log(
      "[PD Client] Attempting to connected to CH server at " +
        this.url +
        this.namespace,
    );
    this.socket.on("serverMessage", (data) => {
      console.log("[PD Client] Server message: " + data.message);
    });

    // --------------------
    // Incoming from server
    // current implementation received events, controls, and chat

    let authRecoveryInFlight = false;

    this.socket.on("connect", () => {
      if (this.socketUsername) {
        this.socket.emit("addUsername", { username: this.socketUsername });
      }
      this.client.toEnv(MESSAGETYPE.EVENT, {
        header: "connection",
      });
      console.log(
        `[PD Client] Connected to a Collab-Hub Server: - ${this.url}: ` +
          this.socket.id,
      );
      this.socketid = this.socket.id;
    });

    this.socket.on("event", (data) => {
      this.client.toEnv(MESSAGETYPE.EVENT, data);
    });

    this.socket.on("control", (data) => {
      this.client.toEnv(MESSAGETYPE.CONTROL, data);
    });

    this.socket.on("chat", (data) => {
      this.client.toEnv(MESSAGETYPE.CHAT, data);
    });

    this.socket.on("connect_error", async (err) => {
      console.log("[PD Client] Socket connect_error:", err.message || err);

      if (
        !AUTH_ERROR_PATTERN.test(String(err && err.message ? err.message : err))
      ) {
        return;
      }

      if (authRecoveryInFlight) {
        return;
      }

      authRecoveryInFlight = true;
      try {
        const refreshed = await this.refreshSocketSession();
        if (!refreshed) {
          await this.establishInitialSession();
        }

        if (!this.authState.accessToken) {
          this.emitAuthStatus(
            "auth_missing",
            this.passwordAuthEnabled
              ? "Password login failed. Provide a valid username and password."
              : "Guest auth unavailable; falling back only works on unauthenticated servers.",
          );
        }

        this.applySocketAuth();
        this.socket.connect();
      } catch (authErr) {
        const message =
          authErr && authErr.message ? authErr.message : String(authErr);
        this.emitAuthStatus("auth_recovery_failed", message);
      } finally {
        authRecoveryInFlight = false;
      }
    });

    this.bootstrapSocketConnection();
  }

  emitAuthStatus(status, detail) {
    console.log(`[auth] ${status}: ${detail}`);
  }

  syncIdentity(username) {
    this.username = username;
    this.socketUsername = username;
    this.authState.username = username;

    if (this.client) {
      this.client.username = username;
    }
  }

  requestJson(urlString, method, body) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(urlString);
      const payload = body ? JSON.stringify(body) : "";
      const transport = parsed.protocol === "https:" ? https : http;

      const req = transport.request(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || undefined,
          path: `${parsed.pathname}${parsed.search}`,
          method,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let responseText = "";

          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            responseText += chunk;
          });
          res.on("end", () => {
            let responseBody = {};
            if (responseText.trim().length > 0) {
              try {
                responseBody = JSON.parse(responseText);
              } catch (_err) {
                responseBody = { raw: responseText };
              }
            }

            resolve({
              ok:
                (res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300,
              status: res.statusCode || 500,
              payload: responseBody,
            });
          });
        },
      );

      req.on("error", reject);
      if (payload.length > 0) {
        req.write(payload);
      }
      req.end();
    });
  }

  async loginWithConfiguredCredentials() {
    if (!this.passwordAuthEnabled) {
      return null;
    }

    const result = await this.requestJson(
      `${this.url}/api/v1/auth/login`,
      "POST",
      {
        username: this.username,
        password: this.password,
      },
    );

    if (
      !result.ok ||
      !result.payload.accessToken ||
      !result.payload.refreshToken
    ) {
      const message =
        result.payload.error || `Login failed with status ${result.status}.`;
      throw new Error(message);
    }

    this.authState = {
      accessToken: result.payload.accessToken,
      refreshToken: result.payload.refreshToken,
      username: this.username,
      mode: "password",
    };
    this.syncIdentity(this.username);
    this.emitAuthStatus("login_ok", this.username);
    return this.authState;
  }

  async createGuestSession() {
    const payload = {};
    if (this.username.length > 0) {
      payload.username = this.username;
    }

    const result = await this.requestJson(
      `${this.url}/api/v1/auth/guest`,
      "POST",
      payload,
    );

    if (!result.ok) {
      if (result.status === 404) {
        this.emitAuthStatus(
          "guest_unavailable",
          "Server does not support guest auth.",
        );
        return null;
      }

      const message =
        result.payload.error ||
        `Guest login failed with status ${result.status}.`;
      throw new Error(message);
    }

    if (!result.payload.accessToken || !result.payload.refreshToken) {
      throw new Error("Guest login did not return session tokens.");
    }

    const resolvedUsername =
      result.payload.username || this.username || "guest";
    this.authState = {
      accessToken: result.payload.accessToken,
      refreshToken: result.payload.refreshToken,
      username: resolvedUsername,
      mode: "guest",
    };
    this.syncIdentity(resolvedUsername);
    this.emitAuthStatus("guest_ok", resolvedUsername);
    return this.authState;
  }

  async establishInitialSession() {
    if (this.passwordAuthEnabled) {
      return this.loginWithConfiguredCredentials();
    }

    return this.createGuestSession();
  }

  async refreshSocketSession() {
    if (!this.authState.refreshToken) {
      return false;
    }

    const result = await this.requestJson(
      `${this.url}/api/v1/auth/refresh`,
      "POST",
      {
        refreshToken: this.authState.refreshToken,
      },
    );

    if (
      !result.ok ||
      !result.payload.accessToken ||
      !result.payload.refreshToken
    ) {
      return false;
    }

    this.authState = {
      accessToken: result.payload.accessToken,
      refreshToken: result.payload.refreshToken,
      username: this.authState.username,
      mode: this.authState.mode,
    };
    this.emitAuthStatus(
      this.authState.mode === "guest" ? "refresh_guest_ok" : "refresh_ok",
      this.authState.username,
    );
    return true;
  }

  applySocketAuth() {
    if (!this.socketUsername) {
      this.socketUsername = `CH-PD-Client_${Math.floor(Math.random() * 1000)}`;
    }

    this.socket.io.opts.query = { username: this.socketUsername };
    this.socket.auth = this.authState.accessToken
      ? { token: this.authState.accessToken }
      : {};
  }

  async bootstrapSocketConnection() {
    try {
      if (!this.authState.accessToken) {
        await this.establishInitialSession();
      }
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      this.emitAuthStatus("login_failed", message);
    }

    if (!this.authState.accessToken) {
      this.emitAuthStatus(
        "anonymous_fallback",
        this.socketUsername ||
          "No credentials supplied; using anonymous socket connection.",
      );
    }

    this.applySocketAuth();
    this.socket.connect();
  }

  // utility methods
  toClient(routing, data) {
    console.log(`[PD Client] received data: ${routing}, ${data}`);
    console.dir(data);

    if (!this.socket) {
      console.log("[PD Client] Cannot emit outbound message: socket missing.");
      return;
    }

    if (!this.socket.connected) {
      console.log(
        `[PD Client] Outbound emit queued while socket disconnected: ${routing}`,
      );
    }

    this.socket.emit(routing, data);
  }

  GetSocketID() {
    console.log("[PD Client] my socketid : " + this.socketid);
    return this.socketid;
  }

  Disconnect() {
    console.log(`[PD Client]Disconnecting...`);
    this.socket.disconnect();
  }
}

//
// module.exports = {
//   ENVIRONMENT
// };
