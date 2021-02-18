import { Grid, Icon, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from "@material-ui/core";
import { observer } from "mobx-react";
import React from "react";
import FileSize from "../../../helpers/filesize";
import store from "../../../store/store";

export const ClipOptions = observer(class ClipOptions extends React.PureComponent {

    render() {
        return <>
            <h3>Clip Options</h3>

            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Video Bitrate"
                        type="number"
                        error={store.clip.bitrate === null ? false : isNaN(store.clip.bitrate.bits)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.clip.setBitrate(FileSize.fromKiloBits(e.target.valueAsNumber))}
                        value={store.clip.bitrate?.toKiloBits().round(2) || 0}
                        InputProps={{
                            inputProps: {
                                min: 1,
                                step: 0.25
                            },
                            startAdornment: <InputAdornment position="start"><IconButton onClick={() => store.clip.setBitrateLock(!store.clip.bitrateLock)}><Icon>{store.clip.bitrateLock ? "lock" : "lock_open"}</Icon></IconButton></InputAdornment>,
                            endAdornment: <InputAdornment position="end">Kbits/s</InputAdornment>
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Max Filesize"
                        type="number"
                        defaultValue={store.clip.maxFileSize?.toMegaBytes()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.clip.setMaxFileSize(FileSize.fromMegaBytes(e.target.valueAsNumber))}
                        InputProps={{
                            inputProps: {
                                step: 0.25
                            },
                            endAdornment: <InputAdornment position="end">MB</InputAdornment>
                        }} />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Framerate"
                        type="number"
                        error={isNaN(store.clip.framerate)}
                        defaultValue={store.clip.framerate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.clip.setFramerate(e.target.valueAsNumber)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">frames per second</InputAdornment>
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Speed"
                        helperText="1 = normal speed. 2 = twice as fast."
                        defaultValue={store.clip.speed}
                        error={isNaN(store.clip.speed)}
                        inputProps={{
                            min: 0.1,
                            max: 16,
                            step: 0.05
                        }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.clip.setSpeed(e.target.valueAsNumber)}
                    />

                </Grid>


                <Grid item xs={12}>
                    <InputLabel id="resolution-selection">Resolution</InputLabel>
                    <Select fullWidth labelId="resolution-selection" value={store.clip.resolution} onChange={(e) => store.clip.setResolution(e.target.value as string)}>
                        <MenuItem value="640x360">640x360</MenuItem>
                        <MenuItem value="854x480">854x480</MenuItem>
                        <MenuItem value="960x540">960x540</MenuItem>
                        <MenuItem value="1280x720">1280x720</MenuItem>
                        <MenuItem value="1366x768">1366x768</MenuItem>
                        <MenuItem value="1600x900">1600x900</MenuItem>
                        <MenuItem value="1920x1080">1920x1080</MenuItem>
                        <MenuItem value="2560x1440">2560x1440</MenuItem>
                        <MenuItem value="3200x1800">3200x1800</MenuItem>
                        <MenuItem value="3840x2160">3840x2160</MenuItem>
                        <MenuItem value="5120x2880">5120x2880</MenuItem>
                        <MenuItem value="7680x4320">7680x4320</MenuItem>
                    </Select>
                </Grid>

            </Grid>
        </>
    }
})