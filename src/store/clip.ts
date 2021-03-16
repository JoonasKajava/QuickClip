import { remote, shell } from "electron";
import { autorun, makeAutoObservable } from "mobx";
import FileSize from "../helpers/filesize";
import store from "./store";
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import moment from "moment";
import fs from 'fs';
import path from 'path';
import { IClipProgress } from "./storeTypes";
import Butterflow from "..//helpers/butterflow";
import { isGenerator } from "mobx/dist/internal";
import { ThemeProvider } from "@material-ui/styles";


export default class Clip {

    name: string = "test";

    start: number | null = null;
    end: number | null = null;

    maxFileSize: FileSize | null = FileSize.fromMegaBytes(8);
    bitrate: FileSize | null = null;
    bitrateLock: boolean = false;

    framerate: number = 24;
    speed: number = 1;

    resolution: string = "1280x720";

    private progressStage = {
        BUTTERFLOW: 0,
        FFMPEG: 1,
    };

    progress = {
        stage: 0,
        currentlyProgressing: false,
        percent: 0,
        framerate: 0
    }


    setName(name: string) {
        this.name = name;
    }

    setStart(start: number | null) {
        this.start = start;
    }

    setEnd(end: number | null) {
        this.end = end;
    }

    setMaxFileSize(size: FileSize) {
        this.maxFileSize = size;
    }

    setBitrate(bitrate: FileSize) {
        console.log(bitrate);
        this.bitrate = bitrate;
    }

    setBitrateLock(lock: boolean) {
        this.bitrateLock = lock;
    }

    setFramerate(fps: number) {
        this.framerate = fps;
    }

    setSpeed(speed: number) {
        this.speed = Math.min(Math.max(speed, 0.1), 16);
    }

    setResolution(resolution: string) {
        this.resolution = resolution;
    }


    get duration(): number {
        if (!this.end || !this.start) return 0;
        return (this.end - this.start) * (1 / this.speed);
    }

    get estimatedSize(): FileSize {
        if (this.duration <= 0 || !this.bitrate) return FileSize.fromBits(0);
        return FileSize.fromBits((this.bitrate.bits + store.video.audioBitrate.bits) * this.duration);
    }


    constructor() {
        makeAutoObservable(this)
        autorun(() => {
            if (!this.maxFileSize || this.maxFileSize.bits <= 0 || !this.start || !this.end || this.bitrateLock) return;
            this.setBitrate(FileSize.fromBits(this.maxFileSize.bits / Math.abs(this.duration) - store.video.audioBitrate.bits));
        });
        this.create.bind(this)
    }

    ffmpeg = {
        onStart: () => {
            this.progress.currentlyProgressing = true;
            this.progress.framerate = 0;
            this.progress.percent = 0;
        },
        onProgress: (progress: IClipProgress) => {
            // Native progress percentage doesn't work correctly so this is to make it work
            this.progress.percent = moment.duration(progress.timemark).asMilliseconds() / moment.duration(this.duration, 'seconds').asMilliseconds();
            remote.getCurrentWindow().setProgressBar(this.progress.percent);
        },
        onEnd: () => {
            this.progress.currentlyProgressing = false;
            remote.getCurrentWindow().setProgressBar(0);
            shell.openPath(store.settings.clipSaveLocation);
        },
        onError: (name: string) => {
            if(fs.existsSync(name)) fs.unlinkSync(name);
            this.progress.currentlyProgressing = false;
            remote.getCurrentWindow().setProgressBar(0);
        }
    }

    butter : Butterflow | null = null;

    private butterflowProcessing(src: string, out: string) {
        this.progress.stage = this.progressStage.BUTTERFLOW;
        this.progress.currentlyProgressing = true;
        this.butter = new Butterflow();
        this.butter.setInput(src);
        this.butter.setOutput(out);
        this.butter.setFramerate(this.framerate);
        this.butter.setSpeed(this.speed);
        this.butter.setStart(this.start);
        this.butter.setEnd(this.end);
        return this.butter.processVideo((progress) => {
            this.progress.percent = progress / 100;
        });
    }
    command: FfmpegCommand | null = null;
    private ffmpegProcessing(src: string, out: string, hasBeenProcessed: boolean): Promise<string> {
        return new Promise((resolve, reject) => {
            this.progress.stage = this.progressStage.FFMPEG;
            var videoFilters = [
                'scale=' + this.resolution.replace("x", ":")
            ];
            if (!hasBeenProcessed) videoFilters.push("fps=fps=" + this.framerate);
            if (!hasBeenProcessed) videoFilters.push("setpts=PTS/" + this.speed);

            this.command = ffmpeg(src);
            this.command.inputFormat("mp4");
            this.command.outputOptions(['-filter:v ' + videoFilters.join(",")]);
            if (this.start && this.end && !hasBeenProcessed) {
                this.command.seekInput(this.start)
                this.command.duration(this.duration)
            }

            this.command.on('start', this.ffmpeg.onStart.bind(this));

            this.command.on('progress', this.ffmpeg.onProgress.bind(this));


            if (this.bitrate) {
                this.command.videoBitrate(this.bitrate.toKiloBits());
                this.command.audioBitrate(store.video.audioBitrate.toKiloBits())
            }

            this.command.outputFormat("mp4");

            this.command.on('error', () => {
                this.ffmpeg.onError(out);
                reject("error");
            });
            this.command.on('end', () => {
                resolve(out);
                this.ffmpeg.onEnd();
            });
            this.command.output(out);


            this.command.run();
        });
    }

    create() {
        if (!store.video.location) return;
        const butterflow_enabled = this.speed != 1;
        const cacheFile = this.tryGetFilePath(store.settings.cacheLocation, this.name + ".mp4");
        const finalFile = this.tryGetFilePath(store.settings.clipSaveLocation, this.name + ".mp4");

        const error = (err: string, processor: string) => {
            
            store.enqueueSnackbar(`Error while processing with ${processor}: ${err}`, { variant: "error" });
        };

        if (butterflow_enabled) {
            this.butterflowProcessing(store.video.location, cacheFile).then((processedFile: string | undefined) => {
                this.butter = null;
                if (!processedFile) { store.enqueueSnackbar("Butterflow processing failed. Canceled FFmpeg processing", { variant: "error" }); return; }
                this.ffmpegProcessing(processedFile, finalFile, true).then((out: string) => {
                    fs.unlink(cacheFile, () => {});
                })
                .catch(err => error(err, "FFmpeg"));
            }).catch((err) => error(err, "Butterflow"));
        } else {
            this.ffmpegProcessing(store.video.location, finalFile, false).catch(err => error(err, "FFmpeg"));
        }

        if (!store.video.isValid) {
            new Notification('Error', {
                body: 'Could not get video data. Cannot create clip'
            });
            return;
        }
    }

    private tryGetFilePath(folder: string, file: string) {
        let counter = 0;
        const ext = path.extname(file);
        const name = path.basename(file, ext);

        let absPath = (counter: number) => `${path.join(folder, name)}${(counter > 0 ? ` (${counter})` : "") + ext}`;
        try {
            while (fs.existsSync(absPath(counter))) counter++;
        } catch (err) { }

        return absPath(counter);
    }


    cancel() {
        this.command?.kill("SIGKILL");
        this.butter?.currentProcess?.kill();
        this.progress = {
            stage: 0,
            currentlyProgressing: false,
            percent: 0,
            framerate: 0
        };
    }
}