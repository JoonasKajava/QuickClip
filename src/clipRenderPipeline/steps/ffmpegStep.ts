import Ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
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

    command: FfmpegCommand | null = null;

    perform(input: string, output: string, clip: clip, actionsPerformed: PipelineAction[]): Promise<IPipelineStepOutput> {
        return new Promise<IPipelineStepOutput>((resolve, reject) => {
            this.command = Ffmpeg(input);
            this.command.inputFormat("mp4");
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
                this.command.seekInput(clip.start);
                this.command.duration(clip.duration);
                actionsDone.push(PipelineAction.Cut);
            }

            this.command.outputOptions([
                '-filter:v ' + filters.join(","),
                '-preset veryslow'
            ]);
            

            if (clip.bitrate) {
                this.command.videoBitrate(clip.bitrate.toKiloBits());
            }

            this.command.outputFormat("mp4");
            this.command.output(output);


            this.command.on('progress', (progress: IClipProgress) => {
                if (this.onProgress) {
                    this.onProgress(moment.duration(progress.timemark).asMilliseconds() / moment.duration(clip.duration, 'seconds').asMilliseconds());
                }
            });

            this.command.on('error',() => {
                reject("Error");
            });

            this.command.on('end', () => {
                this.command = null;
                resolve({
                    output: output,
                    actionsDone: actionsDone
                })
            });


            this.command.run();

        });
    }

    cancel() {
        this.command?.kill("SIGKILL");
    }
}