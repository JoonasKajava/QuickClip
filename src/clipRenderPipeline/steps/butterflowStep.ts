import Butterflow from "../../helpers/butterflow";
import clip from "../../store/clip";
import { PipelineAction } from "../pipeline";
import { Action, IPipelineStep, IPipelineStepOutput } from "../pipelineTypes";


export default class ButterflowStep implements IPipelineStep {
    onProgress: Action<number> | undefined;
    name: string = "ButterFlow";
    description: string = "Handles slowmotion.";
    perform(input: string, output: string, clip: clip, actionsPerformed: PipelineAction[]): Promise<IPipelineStepOutput> {
        return new Promise(async (resolve, reject) => {
            const butter = new Butterflow();
            var actionsDone = [];
            butter.setInput(input);
            butter.setOutput(output);
            if (!actionsPerformed.includes(PipelineAction.Framerate)) {
                butter.setFramerate(clip.framerate);
                actionsDone.push(PipelineAction.Framerate);
            }
            
            if (!actionsPerformed.includes(PipelineAction.Speed)) {
                butter.setSpeed(clip.speed);
                actionsDone.push(PipelineAction.Speed);
            } 
            if (!actionsPerformed.includes(PipelineAction.Cut)) {
                butter.setStart(clip.start);
                butter.setEnd(clip.end);
                actionsDone.push(PipelineAction.Cut);
            }
            try {
                await butter.processVideo(this.onProgress);
            }catch(e) {
                reject(e);
            }
            
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
}