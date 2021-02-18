export interface IVideoBrowserState {
    thumbnails: IThumbnailCacheFilePair[] | null;
}


export interface IThumbnailCacheFilePair {
    file: string;
    thumbnail: string;
}

export interface IVideoCardProps {
    file: string;
    thumbnail: string;
    onClick:(file:string) => void;
}