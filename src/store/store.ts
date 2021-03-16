import { remote } from "electron";
import { makeAutoObservable, observable } from "mobx";
import Clip from "./clip";
import Settings from "./settings";
import Video from "./video";
import fs from 'fs';
import { SnackbarMessage, OptionsObject, SnackbarKey } from "notistack";
import { INotification } from "./storeTypes";


class Store {
    video = new Video();
    clip = new Clip();
    settings = new Settings();
    constructor() {
        makeAutoObservable(this);
        this.loadOrCreateSettings();
    }

    notifications: INotification[] = [];

    enqueueSnackbar(message: SnackbarMessage, options?: OptionsObject) {
        this.notifications.push({
            key: new Date().getTime() + Math.random(),
            message,
            options: options
        })
    }

    removeSnackbar(key: SnackbarKey) {
        this.notifications = this.notifications.filter(x => x.key !== key);
    }

    settingsFile = remote.app.getAppPath() + "/settings.json";

    loadOrCreateSettings() {
        if(fs.existsSync(this.settingsFile)) {
            let content = fs.readFileSync(this.settingsFile, "utf-8");
            this.settings = Object.assign(this.settings, JSON.parse(content));
        }else {
            this.saveSettings();
        }
    }

    saveSettings() {
        fs.writeFile(this.settingsFile, JSON.stringify(this.settings),(err) => {
        });
    }
}

const store = new Store();
export default store;