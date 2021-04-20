import { remote, shell } from "electron";
import { autorun, makeAutoObservable } from "mobx";
import FileSize from "../helpers/filesize";
import store from "./store";
import { tryGetFilePath } from "../helpers/fileHelpers";
import Pipeline from "../clipRenderPipeline/pipeline";
import generate from 'project-name-generator';


export default class Clip {

    name: string = generate({ words: 3 }).dashed;

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
        percent: 0
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

    currentPipeline: Pipeline | null = null;

    create() {
        if (!store.video.location) return;
        const finalFile = tryGetFilePath(store.settings.clipSaveLocation, this.name + ".mp4");

        this.currentPipeline = new Pipeline();

        this.currentPipeline.run(store.video.location, finalFile, this).then((result) => {
            shell.showItemInFolder(result.output);
        }).catch((e) => {
            store.enqueueSnackbar(`Pipeline error: ${e}`, { variant: "error" });
        }).finally(() => {
            this.progress.currentlyProgressing = false;
            this.progress.percent = 0;
            this.progress.stage = 0;
            remote.getCurrentWindow().setProgressBar(0);
        });

        if (!store.video.isValid) {
            new Notification('Error', {
                body: 'Could not get video data. Cannot create clip'
            });
            return;
        }
    }


    cancel() {
        if (!this.currentPipeline) return;

        this.currentPipeline.cancel();


        this.progress.currentlyProgressing = false;
        this.progress.percent = 0;
        this.progress.stage = 0;
        remote.getCurrentWindow().setProgressBar(0);
    }
}