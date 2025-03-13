import { CPath } from 'src/lib/ericchase/Platform/FilePath.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { ProcessorMethod, ProcessorModule } from 'tools/lib/Processor.js';

export class ProjectFile {
  constructor(
    public builder: BuilderInternal,
    public src_path: CPath,
    public out_path: CPath,
  ) {}

  $processor_list: { processor: ProcessorModule; method: ProcessorMethod }[] = [];
  addProcessor(processor: ProcessorModule, method: ProcessorMethod): void {
    this.$processor_list.push({ processor, method });
  }

  /** When true, file contents have been modified during the current processing phase. */
  ismodified = false;
  /** When false, $bytes/$text are no longer from the original file. */
  isoriginal = true;

  $bytes?: Uint8Array;
  $text?: string;

  // Get cached contents or contents from file on disk as Uint8Array.
  async getBytes(): Promise<Uint8Array> {
    if (this.$bytes === undefined) {
      if (this.$text === undefined) {
        this.$bytes = await this.builder.platform.File.readBytes(this.src_path);
      } else {
        this.$bytes = new TextEncoder().encode(this.$text);
        this.$text = undefined;
      }
    }
    return this.$bytes;
  }
  // Get cached contents or contents from file on disk as string.
  async getText(): Promise<string> {
    if (this.$text === undefined) {
      if (this.$bytes === undefined) {
        this.$text = await this.builder.platform.File.readText(this.src_path);
      } else {
        this.$text = new TextDecoder().decode(this.$bytes);
        this.$bytes = undefined;
      }
    }
    return this.$text;
  }

  // Set cached contents to Uint8Array.
  setBytes(bytes: Uint8Array) {
    this.isoriginal = false;
    this.ismodified = true;
    this.$bytes = bytes;
    this.$text = undefined;
  }
  // Set cached contents to string.
  setText(text: string) {
    this.isoriginal = false;
    this.ismodified = true;
    this.$bytes = undefined;
    this.$text = text;
  }

  // Clears the cached contents and resets attributes.
  resetBytes() {
    this.isoriginal = true;
    this.ismodified = false;
    this.$bytes = undefined;
    this.$text = undefined;
  }

  // Attempts to write cached contents to file on disk.
  // Returns number of bytes written.
  async write(): Promise<number> {
    let byteswritten = 0;
    if (this.$text !== undefined) {
      byteswritten = await this.builder.platform.File.writeText(this.out_path, this.$text);
    } else {
      byteswritten = await this.builder.platform.File.writeBytes(this.out_path, await this.getBytes());
    }
    return byteswritten;
  }

  // Useful for some console log coercion.
  toString(): string {
    return this.src_path.toString();
  }
}
