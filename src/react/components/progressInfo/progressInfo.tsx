import { Box, Button, Icon, LinearProgress, makeStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import React from "react";
import store from "../../../store/store";

const useStyles = makeStyles({
    root: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        width: "50%"
    }
});

export const ProgressInfo = observer(() => {
    const classes = useStyles();
    return <div className={classes.root}>
        <div className={classes.container}>
            <h1>Creating clip!</h1>
            <LinearProgress variant="determinate" value={store.clip.progress.percent * 100} />

            <Box display="flex" justifyContent="center" marginTop={1}>
                <Button onClick={() => store.clip.cancel()} variant="outlined" color="secondary" startIcon={<Icon>cancel</Icon>}>Cancel</Button>
            </Box>

        </div>

    </div>
})