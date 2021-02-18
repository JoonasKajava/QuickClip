import React, { createRef, RefObject } from "react";
import { IVideoPlayerProps, IVideoPlayerState } from "./videoPlayerTypes";
import { ClipMarker } from "../clipMarker/clipMarker";
import store from "../../../store/store";
import { observer } from "mobx-react";
import Button from "@material-ui/core/Button";
import { createStyles, Grid, Icon, withStyles } from "@material-ui/core";

const styles = createStyles({
    videoPlayer: {}
})

export const VideoPlayer = observer(withStyles(styles)(class VideoPlayer extends React.PureComponent<IVideoPlayerProps<typeof styles>, IVideoPlayerState> {
    videoElement: RefObject<HTMLVideoElement>;

    constructor(props: IVideoPlayerProps<typeof styles>) {
        super(props);
        this.state = {
            currentTime: 0
        };
        this.videoElement = createRef<HTMLVideoElement>();
    }

    componentDidMount() {
        this.attachUpdater();
    }
    attachUpdater() {
        this.videoElement.current?.addEventListener('timeupdate', this.updateCurrentTime.bind(this))
    }

    componentDidUpdate(prevProps: IVideoPlayerProps<typeof styles>) {
        if (this.props.src !== prevProps.src) {
            this.attachUpdater();
        }
    }

    updateCurrentTime(ev: Event) {
        if (!this.videoElement.current) return;
        this.setState({
            currentTime: this.videoElement.current.currentTime
        });
    }

    stepFrame(amount: number) {
        if (!this.videoElement.current || store.video.framerate == null) return;
        this.videoElement.current.pause();
        this.videoElement.current.currentTime += (amount / store.video.framerate);
    }

    jumpTo(point: number) {
        if(!this.videoElement.current) return;
        this.videoElement.current.currentTime = point;
    }


    render() {
        if (this.videoElement.current) {
            this.videoElement.current.playbackRate = store.clip.speed;
        }
        return <>
        
            <video ref={this.videoElement} key={this.props.src} className={this.props.classes.videoPlayer} controls>
                <source src={this.props.src} />
            </video>
            <Grid container justify="space-between">
                <Button variant="outlined" onClick={() => this.stepFrame(-1)} startIcon={<Icon>keyboard_arrow_left</Icon>}>Previous Frame</Button>
                <Button variant="outlined" onClick={() => this.stepFrame(1)} endIcon={<Icon>keyboard_arrow_right</Icon>}>Next Frame</Button>
            </Grid>
            <ClipMarker onTimeChange={this.jumpTo.bind(this)} currentTime={this.state.currentTime} />
        </>
    }
}))