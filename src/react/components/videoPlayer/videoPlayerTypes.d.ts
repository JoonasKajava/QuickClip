
import {WithStyles} from '@material-ui/core/styles';

export interface IVideoPlayerProps<S> extends WithStyles<S> {
    src: string;
}

export interface IVideoPlayerState {
    currentTime: number;
}