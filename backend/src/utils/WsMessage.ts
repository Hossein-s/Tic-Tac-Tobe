export const WsMessage = {
  make(event: string, args?: Record<string, string>) {
    return JSON.stringify({ event, args });
  },
  parse(message: string | Buffer): {
    command: string;
    args: Record<string, string>;
  } {
    if (message instanceof Buffer) {
      message = message.toString("utf-8");
    }

    return JSON.parse(message);
  },
};
