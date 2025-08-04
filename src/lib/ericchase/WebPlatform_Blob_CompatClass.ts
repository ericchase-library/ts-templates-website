export class Class_WebPlatform_Blob_CompatClass {
  constructor(public blob: Blob) {}
  get size(): number | undefined {
    return this.blob.size ?? undefined;
  }
  get type(): string | undefined {
    return this.blob.type ?? undefined;
  }
  async arrayBuffer(): Promise<ArrayBuffer | undefined> {
    return (await this.blob.arrayBuffer?.()) ?? undefined;
  }
  /** `bytes` is not available in most browsers */
  async bytes(): Promise<Uint8Array | undefined> {
    return (await this.blob.bytes?.()) ?? (await this.blob.arrayBuffer?.().then((buffer) => (buffer ? new Uint8Array(buffer) : undefined))) ?? undefined;
  }
  slice(): Blob | undefined {
    return this.blob.slice?.() ?? undefined;
  }
  stream(): ReadableStream<any> | undefined {
    return this.blob.stream?.() ?? undefined;
  }
  async text(): Promise<string | undefined> {
    return (await this.blob.text?.()) ?? undefined;
  }
}

export function WebPlatform_Blob_CompatClass(blob: Blob): Class_WebPlatform_Blob_CompatClass {
  return new Class_WebPlatform_Blob_CompatClass(blob);
}
