import { remote } from "electron";
import React from "react";
import fs from 'fs';
import store from "../../../store/store";
import { observer } from "mobx-react";
import { Button, CircularProgress, Grid, Icon, TextField } from "@material-ui/core";
import { glob } from "glob";
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { IThumbnailCacheFilePair, IVideoBrowserState } from "./videoBrowserTypes";
import VideoCard from "./videoCard";

export const VideoBrowser = observer(class VideoBrowser extends React.PureComponent<any, IVideoBrowserState> {
    constructor(props: any) {
        super(props);
        this.state = {
            thumbnails: null
        }
    }

    openFileDialog() {
        let browser = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: "Select video",
            defaultPath: remote.app.getPath("videos"),
            buttonLabel: "Select this video",
            properties: ["openFile"]
        });

        browser.then((returnValue) => {
            if (returnValue.canceled || !returnValue.filePaths[0]) return;
            store.video.loadFile(returnValue.filePaths[0]);
        });
    }

    componentDidMount() {
        var fileReg = remote.app.getPath("videos") + "/**/*.mp4";
        var thumbnailLoadStatus: Promise<IThumbnailCacheFilePair>[] = [];
        glob(fileReg, {
            "ignore": [store.settings.clipSaveLocation + "/**/*.mp4"]
        }, (err, matches) => {
            matches.sort((a, b) => {
                return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
            })
            var prevFiles = matches.slice(0, 3);

            prevFiles.forEach((file) => {
                thumbnailLoadStatus.push(this.getThumbnail(file));
            })
            Promise.all(thumbnailLoadStatus).then((thumbnails) => {
                this.setState({
                    thumbnails: thumbnails
                })
            })
        });
    }

    getThumbnail(filepath: string): Promise<IThumbnailCacheFilePair> {
        return new Promise((resolve, reject) => {
            var cacheFile = path.basename(filepath) + "_cache.jpg";
            var cacheFolder = store.settings.cacheLocation.replaceAll("\\", "/");
            var cachePath = cacheFolder + "/" + cacheFile;
            if (fs.existsSync(cacheFolder + "/" + cacheFile)) {
                resolve({
                    file: filepath,
                    thumbnail: cachePath
                });
            } else {
                ffmpeg(filepath)
                    .screenshot({
                        count: 1,
                        timestamps: ['99%'],
                        filename: cacheFile,
                        folder: cacheFolder,
                        size: '250x141'
                    })
                    .on("error", (err) => {
                        reject(err);
                    }).on("end", () => {
                        resolve({
                            file: filepath,
                            thumbnail: cachePath
                        })
                    })
            }
        });
    }

    onTextChange(event: React.ChangeEvent<HTMLInputElement>) {
        store.video.loadFile(event.target.value);
    }

    render() {
        return <Grid container spacing={5} style={{ margin: 0, width: "100%" }} justify="center">
            <Grid container item xs={6} spacing={3} justify="center" alignItems="flex-end">
                <Grid item xs={12}>
                    <h1 style={{ textAlign: "center" }}>Select video</h1>
                </Grid>

                <Grid item>
                    <TextField label="File location" onChange={this.onTextChange.bind(this)} value={store.video.location ?? ""} />
                </Grid>

                <Grid item>
                    <Button variant="outlined" onClick={this.openFileDialog.bind(this)} startIcon={<Icon>folder_open</Icon>}>Select</Button>
                </Grid>
            </Grid>
            {this.state.thumbnails != null ?
                <Grid container item spacing={4} justify="center" style={{ margin: 0, width: "100%" }}>
                    {this.state.thumbnails.map((thumbnail) => {
                        return <Grid key={thumbnail.thumbnail} item>
                            <VideoCard onClick={(file) => store.video.loadFile(file)} file={thumbnail.file} thumbnail={thumbnail.thumbnail} />
                        </Grid>
                    })}
                </Grid> :
                <Grid container item spacing={2} justify="center" style={{ margin: 0, width: "100%" }}>
                    <Grid item>
                        <CircularProgress />
                    </Grid>
                    <Grid item>
                        Loading latest videos...
                    </Grid>
                </Grid>
            }
        </Grid>
    }
})