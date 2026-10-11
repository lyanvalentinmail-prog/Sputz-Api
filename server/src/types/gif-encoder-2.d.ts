declare module "gif-encoder-2" {
  class GIFEncoder {
    constructor(width: number, height: number, algorithm?: string, useTransparent?: boolean);
    setDelay(ms: number): void;
    setRepeat(n: number): void;
    setTransparent(color: number[] | false): void;
    start(): void;
    addFrame(ctx: unknown): void;
    finish(): void;
    out: { getData(): Buffer };
  }
  export = GIFEncoder;
}
