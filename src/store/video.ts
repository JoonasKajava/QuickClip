import { FfprobeData } from "fluent-ffmpeg";
import { makeAutoObservable } from "mobx";
import path from 'path';
import FileSize from "../helpers/filesize";
import ffmpeg from 'fluent-ffmpeg';
import store from "./store";

export default class Video {
    src: FfprobeData | null = null;
    constructor() {
        makeAutoObservable(this);
    }

    get location() {
        return this.src?.format.filename;
    }

    get name() {
        return path.basename(this.src?.format.filename ?? "");
    }

    get size() {
        return FileSize.fromBytes(this.src?.format.size ?? 0);
    }

    get duration() {
        return this.src?.format.duration ?? 0;
    }

    get videoBitrate() {
        return FileSize.fromBits(this.src?.format.bit_rate ?? 0);
    }

    get audioBitrate() {
        return FileSize.fromBits(parseInt(this.audioStream?.bit_rate ?? "0"));
    }

    get resolution() {
        if(!this.videoStream) return null;
        return this.videoStream.width + "x" + this.videoStream.height;
    }

    get framerate() {
        if(!this.videoStream) return null;
        return parseInt(this.videoStream.r_frame_rate?.split("/")[0] ?? "0");
    }

    get videoStream() {
        return this.src?.streams.find(x => x.codec_type === 'video');
    }
    
    get audioStream() {
        return this.src?.streams.find(x => x.codec_type === 'audio');
    }

    get isValid() {
        return this.src != null;
    }

    setSrc(src: FfprobeData | null) {
        this.src = src;
        if(src === null) {
            store.clip.setStart(null);
            store.clip.setEnd(null);
        }
    }

    loadFile(file: string) {
        let command = ffmpeg(file);

        command.ffprobe((err, data) => {
            if (data) {
                this.setSrc(data);
                store.clip.setStart(null);
                store.clip.setEnd(null);
            }
        });
    }
}