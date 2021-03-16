import { autorun } from "mobx";
import { observer } from "mobx-react";
import { ProviderContext, SnackbarKey, withSnackbar } from "notistack";
import { Component } from "react";
import store from "../../../store/store";

class Notifier extends Component<ProviderContext,any> {
    displayed: SnackbarKey[] = [];

    componentDidMount() {
        autorun(() => {
            store.notifications.forEach((notification) => {
                if(this.displayed.includes(notification.key)) return;
                this.props.enqueueSnackbar(notification.message, notification.options);
                this.displayed.push(notification.key);
                store.removeSnackbar(notification.key);
            });
        })
    }
    render() {
        return null;
    }
}

export default withSnackbar(observer(Notifier));