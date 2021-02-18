import { Grid } from "@material-ui/core";
import { observer } from "mobx-react";
import prettyBytes from "pretty-bytes";
import React from "react";
import store from "../../../store/store";


export const ClipInfo = observer(() => {
    return <>
        <h3>Clip info</h3>
        <Grid container spacing={1}>
            <Grid item xs={6}>
                Duration:
            </Grid>
            <Grid item xs={6}>
                {Math.round(store.clip.duration)} seconds
            </Grid>
            <Grid item xs={6}>
                Estimated Size:
            </Grid>
            <Grid item xs={6}>
                {prettyBytes(store.clip.estimatedSize.bytes)}
            </Grid>
        </Grid>
    </>
});