import React from "react";
import { IClipMakerProps } from "./clipMarkerTypes";
import store from "../../../store/store";
import { observer } from "mobx-react";
import { Box, Button, ButtonGroup, Icon, makeStyles, Mark, Slider, Tooltip } from "@material-ui/core";

const useStyles = makeStyles({
    indicator: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        userSelect: "none",
        flexWrap: "wrap",
        position: "absolute",
        transform: "translate(-50%, 0px)"
    }
})


export const ClipMarker = observer((props: IClipMakerProps) => {

    const classes = useStyles();

    let point = props.currentTime / store.video.duration * 100;
    let marks: Mark[] = [];

    if (store.clip.start) {
        marks.push({
            value: store.clip.start,
            label: store.clip.start
        })
    }
    if (store.clip.end) {
        marks.push({
            value: store.clip.end,
            label: store.clip.end
        })
    }

    return <Box width="calc(100% - 200px)" position="relative" margin="0 auto">
        <Slider onChange={(e, value) => props.onTimeChange(value as number)} step={0.1} min={0} marks={marks} value={props.currentTime} valueLabelFormat={(value) => value.toFixed(1)} max={store.video.duration} valueLabelDisplay="auto" />
        <div style={{ left: point + "%" }} className={classes.indicator}>
            <Icon>keyboard_capslock</Icon>
            <ButtonGroup variant="outlined" size="small">
                    <Button onClick={() => store.clip.setStart(props.currentTime)} startIcon={<Icon>first_page</Icon>}></Button>
                    <Button onClick={() => store.clip.setEnd(props.currentTime)} endIcon={<Icon>last_page</Icon>}></Button>
            </ButtonGroup>
        </div>
    </Box>

})