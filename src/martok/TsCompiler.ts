import {
  createFSBackedSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import ts from "typescript";
import { MartokConfig } from "./MartokConfig";

const compilerOptions: ts.CompilerOptions = {
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  esModuleInterop: true,
};

export class TsCompiler {
  constructor(private config: MartokConfig) {}

  public compileFiles(files: Map<string, string>) {
    const system = createFSBackedSystem(files, this.config.sourceRoot, ts);
    const env = createVirtualTypeScriptEnvironment(
      system,
      [...files.keys()],
      ts,
      compilerOptions
    );
    const program = env.languageService.getProgram();
    if (!program) throw new Error("Failed to create program");
    return {
      program,
      env,
    };
  }
}
