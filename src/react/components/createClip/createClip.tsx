import { Button, Grid, Icon, TextField } from "@material-ui/core";
import { observer } from "mobx-react";
import React from "react";
import store from "../../../store/store";

export const CreateClip = observer(() => {
    return <>
        <h1>Create Clip</h1>
        <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs>
                <TextField required error={store.clip.name === ""} fullWidth label="Clip name" value={store.clip.name} onChange={(e) => store.clip.setName(e.target.value)} />
            </Grid>
            <Grid item>
                <Button variant="outlined" onClick={() => store.clip.create()} startIcon={<Icon>movie</Icon>}>Create Clip</Button>
            </Grid>
        </Grid>
    </>
});