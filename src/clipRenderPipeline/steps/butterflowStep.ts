import Butterflow from "../../helpers/butterflow";
import clip from "../../store/clip";
import { PipelineAction } from "../pipeline";
import { Action, IPipelineStep, IPipelineStepOutput } from "../pipelineTypes";


export default class ButterflowStep implements IPipelineStep {
    onProgress: Action<number> | undefined;
    name: string = "ButterFlow";
    description: string = "Handles slowmotion.";

    currentButter: Butterflow | null = null;

    perform(input: string, output: string, clip: clip, actionsPerformed: PipelineAction[]): Promise<IPipelineStepOutput> {
        return new Promise(async (resolve, reject) => {
            this.currentButter = new Butterflow();
            var actionsDone = [];
            this.currentButter.setInput(input);
            this.currentButter.setOutput(output);
            if (!actionsPerformed.includes(PipelineAction.Framerate)) {
                this.currentButter.setFramerate(clip.framerate);
                actionsDone.push(PipelineAction.Framerate);
            }
            
            if (!actionsPerformed.includes(PipelineAction.Speed)) {
                this.currentButter.setSpeed(clip.speed);
                actionsDone.push(PipelineAction.Speed);
            } 
            if (!actionsPerformed.includes(PipelineAction.Cut)) {
                this.currentButter.setStart(clip.start);
                this.currentButter.setEnd(clip.end);
                actionsDone.push(PipelineAction.Cut);
            }
            try {
                await this.currentButter.processVideo(this.onProgress);
            }catch(e) {
                reject(e);
            }
            
            this.currentButter = null;
            resolve({
                output: output,
                actionsDone: [
                    PipelineAction.Framerate,
                    PipelineAction.Cut,
                    PipelineAction.Speed
                ]
            })
        });
    }


    cancel() {
        this.currentButter?.currentProcess?.kill();
    }
}