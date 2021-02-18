import { createMuiTheme, createStyles, Grid, Grow, Slide, ThemeProvider, WithStyles, withStyles, Zoom } from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import store from '../store/store';
import { ClipInfo } from './components/clipInfo/clipInfo';
import { ClipOptions } from './components/clipOptions/clipOptions';
import { CreateClip } from './components/createClip/createClip';
import { ProgressInfo } from './components/progressInfo/progressInfo';
import { TitleBar } from './components/titleBar/titleBar';
import { VideoBrowser } from './components/videoBrowser/videoBrowser';
import { VideoPlayer } from './components/videoPlayer/videoPlayer';


const theme = createMuiTheme({
  palette: {
    type: 'dark'
  }
})

const styles = createStyles({
  root: {
    width: "100%",
    height: "100%"
  }
})


const App = observer(withStyles(styles)((props: WithStyles<typeof styles>) => {
  const [videoSelectorVisible, setVideoSelectorVisible] = useState(true);
  const [editorVisible, setEditorVisible] = useState(false);


  return <div className={props.classes.root}>
    <ThemeProvider theme={theme}>
      <TitleBar />
      <Grow in={!store.video.isValid && !editorVisible} onEntered={() => setVideoSelectorVisible(true)} onExited={() => setVideoSelectorVisible(false)} mountOnEnter unmountOnExit>
        <VideoBrowser />
      </Grow>
      <Slide in={!videoSelectorVisible && !store.clip.progress.currentlyProgressing && store.video.isValid} onEntered={() => setEditorVisible(true)} onExited={() => setEditorVisible(false)} mountOnEnter unmountOnExit>
        <Grid container spacing={5} style={{ width: "100%", margin: 0 }}>
          <Grid item xs>
            <VideoPlayer src={store.video.location ?? ""} />
          </Grid>
          <Grid item xs={6} md={5} lg={3}>
            <CreateClip />
            <ClipInfo />
            <ClipOptions />
          </Grid>
        </Grid>
      </Slide>

      <Zoom mountOnEnter unmountOnExit in={store.clip.progress.currentlyProgressing && !editorVisible}>
        <ProgressInfo />
      </Zoom>

    </ThemeProvider>
  </div>
}))

ReactDOM.render(<App />, document.body);