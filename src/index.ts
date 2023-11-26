import WebSocket from "ws";
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type EventType = "READY" | "MESSAGE_CREATE";

class Base {
  private token: string;
  private ws: WebSocket | null;

  constructor(token: string) {
    this.token = token;
    this.ws = null;

    this.connect();
  }

  private connect() {
    this.ws = new WebSocket("wss://gateway.discord.gg/?v=10&encording=json");

    this.ws.on("open", () => {
      console.log("WebSocket opened");
    });
    this.ws.on("close", (code: number) => {
      console.log("WebSocket closed with code: " + code);
      setTimeout(() => this.connect(), 5000);
    });
    this.ws.on("message", (event: string) => this.message(event));
  }

  private message(event: string) {
    const data = JSON.parse(event);

    if (data.d?.heartbeat_interval) {
      const interval = data.d.heartbeat_interval;
      this.heartbeat(interval);

      this.ws?.send(
        JSON.stringify({
          op: 2,
          d: {
            token: this.token,
            properties: {
              os: "",
              browser: "",
            },
            compress: false,
          },
        }),
      );
    }

    switch (data.t as EventType) {
      case "READY":
        console.log("Hi");
        break;
    }
  }

  private async heartbeat(interval: number) {
    while (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws?.send(
        JSON.stringify({
          op: 1,
          d: null,
        }),
      );

      await sleep(interval);
    }
  }
}

new Base("TOKEN");
