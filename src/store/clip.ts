import { remote, shell } from "electron";
import { autorun, makeAutoObservable } from "mobx";
import FileSize from "../helpers/filesize";
import store from "./store";
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import moment from "moment";
import fs from 'fs';
import { IClipProgress } from "./storeTypes";


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

    progress = {
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
        if(!this.end || !this.start) return 0;
        return (this.end-this.start) * (1/this.speed);
    }

    get estimatedSize(): FileSize {
        if(this.duration <= 0 || !this.bitrate) return FileSize.fromBits(0);
        return FileSize.fromBits((this.bitrate.bits + store.video.audioBitrate.bits) * this.duration);
    }


    constructor() {
        makeAutoObservable(this)
        autorun(() => {
            if(!this.maxFileSize || this.maxFileSize.bits <= 0 || !this.start || !this.end || this.bitrateLock) return;
            this.setBitrate(FileSize.fromBits(this.maxFileSize.bits / Math.abs(this.end - this.start) - store.video.audioBitrate.bits));
        });
        this.create.bind(this)
    }

    onStart() {
        this.progress.currentlyProgressing = true;
        this.progress.framerate = 0;
        this.progress.percent = 0;
    }

    onProgress(progress: IClipProgress) {
        // Native progress percentage doesn't work correctly so this is to make it work
        this.progress.percent = moment.duration(progress.timemark).asMilliseconds() / moment.duration(this.duration, 'seconds').asMilliseconds();
        remote.getCurrentWindow().setProgressBar(this.progress.percent);
    }

    onEnd() {
        this.progress.currentlyProgressing = false;
        remote.getCurrentWindow().setProgressBar(0);
        shell.openPath("D:/Videos/Clips/");
    }

    onError(name: string) {
        fs.unlinkSync(name);
        this.progress.currentlyProgressing = false;
        remote.getCurrentWindow().setProgressBar(0);
    }

    command: FfmpegCommand | null = null;
    create() {
        
        var videoFilters = [
            'scale=' + this.resolution.replace("x", ":"),
            "fps=fps=" + this.framerate
        ];
        if (!store.video.isValid) {
            new Notification('Error', {
                body: 'Could not get video data. Cannot create clip'
            });
            return;
        }
        this.command = ffmpeg(store.video.location);
        
        this.command.inputFormat("mp4")


        if(this.speed != 1) {
            videoFilters.push("setpts=PTS/" + this.speed);
        }
        this.command.outputOptions(['-filter:v ' + videoFilters.join(",")]);

        if (this.start && this.end) {
            this.command.seekInput(this.start)
            this.command.duration(this.duration)
        }

        this.command.on('start', this.onStart.bind(this));

        this.command.on('progress', this.onProgress.bind(this));

        this.command.on('end', this.onEnd.bind(this));

        if (this.bitrate) {
            this.command.videoBitrate(this.bitrate.toKiloBits());
            this.command.audioBitrate(store.video.audioBitrate.toKiloBits())
        }
        
        this.command.outputFormat("mp4")
        let counter = 0;
        let folder = "D:/Videos/Clips/"
        let filePath = (c:number) => `${folder + this.name}${(c > 0 ? ` (${c})` : "")}.mp4`;

        try {
            
            while(fs.existsSync(filePath(counter))) {
                counter++;
            }    
        }catch(er) {

        }

        this.command.on('error', () => this.onError(filePath(counter)));
        this.command.output(filePath(counter));

        
        this.command.run();
    }


    cancel() {
        this.command?.kill("SIGKILL");
    }
}