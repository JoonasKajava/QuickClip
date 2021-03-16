import { remote } from "electron";
import { makeAutoObservable } from "mobx";
import path from 'path';


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

    resourcesFolder = process.env.NODE_ENV === 'development' ? path.resolve("./resources") : process.resourcesPath;
}