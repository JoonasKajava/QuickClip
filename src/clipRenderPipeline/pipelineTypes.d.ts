import Clip from "../store/clip";
import { PipelineAction } from "./pipeline";

export interface Action<T> {
    (item: T): void;
}

export interface IPipelineStep {
    name: string;
    description: string;
    onProgress: Action<number> | undefined; 
    perform: (input: string, output: string, clip: Clip, actionsPerformed: PipelineAction[]) => Promise<IPipelineStepOutput>;
    cancel: () => void;
}

export interface IPipelineStepOutput {
    output: string;
    actionsDone: PipelineAction[]
}

export interface IPipelineOutput {
    output: string;
}