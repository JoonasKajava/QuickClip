import store from "../store/store";
import Butterflow from "../helpers/butterflow";
import Clip from "../store/clip";
import { IPipelineOutput, IPipelineStep, IPipelineStepOutput } from "./pipelineTypes";
import ButterflowStep from "./steps/butterflowStep";
import ffmpegStep from "./steps/ffmpegStep";
import { tryGetFilePath } from "../helpers/fileHelpers";
import { remote } from "electron";
import fs from 'fs';


export enum PipelineAction {
    Cut,
    Scale,
    Speed,
    Framerate,
    Bitrate
}

export default class Pipeline {

    currentStep : IPipelineStep | null = null;

    async run(input: string, output: string, clip: Clip) : Promise<IPipelineOutput> {

        return new Promise(async (resolve, reject) => {
            clip.progress.currentlyProgressing = true;
            let pipelineSteps: IPipelineStep[] = [];
            let actionsPerformed: PipelineAction[] = [];

            let canButterFlow = false;
            try {
                canButterFlow = await Butterflow.canUseHardwareAcceleration()
            }catch(e){
                store.enqueueSnackbar("Cannot use ButterFlow. Slowmotion disabled", {variant: "error"});
            }
            if(canButterFlow && clip.speed != 1) pipelineSteps.push(new ButterflowStep());
            pipelineSteps.push(new ffmpegStep());
            var workfile = input;
            var cacheItems = [];
            for(const [index, step] of pipelineSteps.entries()) {
                this.currentStep = step;
                clip.progress.stage = index;
                const isLast = index >= (pipelineSteps.length-1);
                const out = isLast ? output : tryGetFilePath(store.settings.cacheLocation, clip.name + ".mp4");

                if(!isLast) cacheItems.push(out);

                step.onProgress = (percent: number) => {
                    clip.progress.percent = percent / pipelineSteps.length;
                    remote.getCurrentWindow().setProgressBar(percent / pipelineSteps.length);
                };
                
                let result: IPipelineStepOutput | undefined;
                try {
                    result = await step.perform(workfile,out, clip, actionsPerformed);
                }catch(e) {
                    store.enqueueSnackbar(`Error performing ${step.name}: ${e}`, {variant: "error"} );
                    reject(`Error performing ${step.name}: ${e}`);
                }
                if(result) {
                    workfile = result.output;
                    actionsPerformed = actionsPerformed.concat(result.actionsDone);
                }
            }

            for(const item in cacheItems){
                if(fs.existsSync(item)) {
                    fs.unlinkSync(item);
                }
            }
 
            resolve({
                output: workfile
            });
        });
    }


    cancel() {
        this.currentStep?.cancel();
    }
} 