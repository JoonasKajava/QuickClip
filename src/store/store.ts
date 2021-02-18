import { makeAutoObservable } from "mobx";
import Clip from "./clip";
import Video from "./video";


class Store {
    video = new Video();
    clip = new Clip();
    constructor() {
        makeAutoObservable(this);
    }
}

const store = new Store();
export default store;