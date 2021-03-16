import { createMuiTheme, Grid, makeStyles, Slide, ThemeProvider, Zoom } from '@material-ui/core';
import { observer } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import Butterflow from '../helpers/butterflow';
import store from '../store/store';
import { ClipInfo } from './components/clipInfo/clipInfo';
import { ClipOptions } from './components/clipOptions/clipOptions';
import { CreateClip } from './components/createClip/createClip';
import Notifier from './components/notifier/notifier';
import { ProgressInfo } from './components/progressInfo/progressInfo';
import { SettingsDialog } from './components/settingsDialog/settingsDialog';
import { TitleBar } from './components/titleBar/titleBar';
import { VideoBrowser } from './components/videoBrowser/videoBrowser';
import { VideoPlayer } from './components/videoPlayer/videoPlayer';


const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: "#82b1ff",
      light: "#b6e3ff",
      dark: "#4d82cb"
    },
    background: {
      default: "#1B1F27"
    }
  }
})


const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%"
  }
})

const App = observer(() => {
  const [videoSelectorVisible, setVideoSelectorVisible] = useState(true);
  const [editorVisible, setEditorVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const classes = useStyles();

  const openSettings = () => {
    setSettingsOpen(true);
  }

  return <div className={classes.root}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <TitleBar onSettingsOpen={openSettings} />
        <Notifier />
        <Slide in={!store.video.isValid && !editorVisible} onEntered={() => setVideoSelectorVisible(true)} onExited={() => setVideoSelectorVisible(false)} mountOnEnter unmountOnExit>
          <VideoBrowser />
        </Slide>
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
        {store.settings && <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />}
      </SnackbarProvider>
    </ThemeProvider>
  </div>
})

ReactDOM.render(<App />, document.getElementById("root"));