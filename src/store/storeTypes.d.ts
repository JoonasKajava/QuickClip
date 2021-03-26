import { SnackbarMessage, OptionsObject, SnackbarKey } from "notistack";

export interface INotification {
    key: SnackbarKey;
    message: SnackbarMessage;
    options?: OptionsObject;
}