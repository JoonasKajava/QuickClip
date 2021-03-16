import { SnackbarMessage, OptionsObject, SnackbarKey } from "notistack";

export interface IClipProgress {
    currentFps: number;
    currentKbps: number;
    frames: number;
    percent: number;
    targetSize: number;
    timemark: string;
}

export interface INotification {
    key: SnackbarKey;
    message: SnackbarMessage;
    options?: OptionsObject;
}