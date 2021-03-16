import { remote } from "electron";
import { makeAutoObservable } from "mobx";
import { createViewModel } from "mobx-utils";


export default class Settings {
    clipSaveLocation: string = remote.app.getPath("videos") + "\\Clips\\";

    cacheLocation: string = remote.app.getPath("temp") + "\\QuickClip\\";

    videoPlayerVolume: number = 1;
    constructor() {
        makeAutoObservable(this);
    }

    setVideoPlayerVolume(newVolume: number) {
        this.videoPlayerVolume = Math.max(Math.min(newVolume,1), 0);
    }
}