import { makeStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import moment from "moment";
import prettyBytes from "pretty-bytes";
import React from "react";
import store from "../../../store/store";


const useStyles = makeStyles({
    table: {
    }
});

export const VideoInfo = observer(() => {
    const styles = useStyles();
    return <>
        <h3>Video info</h3>
        <table className={styles.table}>
            <tbody>
                <tr>
                    <td>Name:</td>
                    <td>{store.video.name}</td>
                </tr>
                <tr>
                    <td>Size:</td>
                    <td>{prettyBytes(store.video.size.bytes)}</td>
                </tr>
                <tr>
                    <td>Duration:</td>
                    <td>{moment.duration(store.video.duration, 'seconds').humanize()}</td>
                </tr>
                <tr>
                    <td>Video Bitrate:</td>
                    <td>{prettyBytes(store.video.videoBitrate.bytes)}</td>
                </tr>
                <tr>
                    <td>Audio Bitrate:</td>
                    <td>{prettyBytes(store.video.audioBitrate.bytes)}</td>
                </tr>
                <tr>
                    <td>Resolution:</td>
                    <td>{store.video.resolution}</td>
                </tr>
                <tr>
                    <td>Framerate:</td>
                    <td>{store.video.framerate}fps</td>
                </tr>
            </tbody>
        </table>
    </>
})