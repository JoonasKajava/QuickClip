import { Box, Button, Icon, LinearProgress, makeStyles, Step, StepLabel, Stepper } from "@material-ui/core";
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

const stepperStyles = makeStyles({
    root: {
        backgroundColor: "transparent"
    }
})

export const ProgressInfo = observer(() => {
    const classes = useStyles();
    const stepperClasses = stepperStyles();
    return <div className={classes.root}>
        <div className={classes.container}>
            <h1>Creating clip!</h1>

            <Stepper classes={stepperClasses} activeStep={store.clip.progress.stage}>
                <Step key={0}>
                    <StepLabel optional="Slow motion and frame interpolation">Butterflow processing</StepLabel>
                </Step>
                <Step key={1}>
                    <StepLabel optional="Cutting and rescaling">FFmpeg processing</StepLabel>
                </Step>
            </Stepper>
            <LinearProgress variant="determinate" value={store.clip.progress.percent * 100} />

            <Box display="flex" justifyContent="center" marginTop={1}>
                <Button onClick={() => store.clip.cancel()} variant="outlined" color="secondary" startIcon={<Icon>cancel</Icon>}>Cancel</Button>
            </Box>

        </div>

    </div>
})