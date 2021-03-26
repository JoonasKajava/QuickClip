import Ffmpeg from "fluent-ffmpeg";
import moment from "moment";
import clip from "../../store/clip";
import { PipelineAction } from "../pipeline";
import { Action, IPipelineStep, IPipelineStepOutput } from "../pipelineTypes";

interface IClipProgress {
    currentFps: number;
    currentKbps: number;
    frames: number;
    percent: number;
    targetSize: number;
    timemark: string;
}

export default class ffmpegStep implements IPipelineStep {
    onProgress: Action<number> | undefined;
    name: string = "FFmpeg";
    description: string = "Scaling and bitrate management";
    perform(input: string, output: string, clip: clip, actionsPerformed: PipelineAction[]): Promise<IPipelineStepOutput> {
        return new Promise<IPipelineStepOutput>((resolve, reject) => {
            const command = Ffmpeg(input);
            command.inputFormat("mp4");
            let filters = [];
            var actionsDone: PipelineAction[] = [];
            if (!actionsPerformed.includes(PipelineAction.Scale)) {
                filters.push('scale=' + clip.resolution.replace("x", ":"))
                actionsDone.push(PipelineAction.Scale);
            }
            if (!actionsPerformed.includes(PipelineAction.Framerate)) {
                filters.push("fps=fps=" + clip.framerate)
                actionsDone.push(PipelineAction.Framerate);
            }
            if (!actionsPerformed.includes(PipelineAction.Speed)) {
                filters.push("setpts=PTS/" + clip.speed)
                actionsDone.push(PipelineAction.Speed);
            }

            if (!actionsPerformed.includes(PipelineAction.Cut) && clip.start && clip.end) {
                command.seekInput(clip.start);
                command.duration(clip.duration);
                actionsDone.push(PipelineAction.Cut);
            }

            command.outputOptions(['-filter:v ' + filters.join(",")]);

            if (clip.bitrate) {
                command.videoBitrate(clip.bitrate.toKiloBits());
            }

            command.outputFormat("mp4");
            command.output(output);


            command.on('progress', (progress: IClipProgress) => {
                if (this.onProgress) {
                    this.onProgress(moment.duration(progress.timemark).asMilliseconds() / moment.duration(clip.duration, 'seconds').asMilliseconds());
                }
            });

            command.on('error',() => {
                reject("Error");
            });

            command.on('end', () => {
                resolve({
                    output: output,
                    actionsDone: actionsDone
                })
            });


            command.run();

        });
    }

}