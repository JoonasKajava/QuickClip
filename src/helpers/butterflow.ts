import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import moment from "moment";
import path from 'path';
import store from "../store/store";

export default class Butterflow {

    input: string | undefined;
    output: string | undefined;
    speed: number | undefined;
    framerate: number | undefined;
    start: number | null = null;
    end: number | null = null;

    setStart(start: number | null) {
        this.start = start;
    }

    setEnd(end: number | null) {
        this.end = end;
    }

    setInput(src: string) {
        this.input = src;
    }

    setOutput(out: string) {
        this.output = out;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    setFramerate(framerate: number) {
        this.framerate = framerate;
    }

    currentProcess: ChildProcessWithoutNullStreams | undefined;


    processVideo(onProgress?: (progress: number) => void): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            if (!this.input) return reject("Set input");
            if (!this.output) return reject("Set output");

            let params = ["-audio"];

            if (this.framerate) {
                params.push("-r", this.framerate.toString());
            }

            if (this.speed) {
                let startMoment, endMoment = null;
                if (this.start) startMoment = moment.utc(moment.duration(this.start, "seconds").asMilliseconds()).format("HH:mm:ss");
                if (this.end) endMoment = moment.utc(moment.duration(this.end, "seconds").asMilliseconds()).format("HH:mm:ss");
                params.push("-s", `a=${startMoment || "0"},b=${endMoment || "end"},spd=${this.speed}`);
            }

            params.push("-o", this.output, "-v", this.input);


            this.currentProcess = spawn("butterflow", params, { cwd: path.join(store.settings.resourcesFolder, 'butterflow') });
            this.currentProcess.stdout.on("data", data => {
                console.log(`stdout: ${data}`);
            });
            this.currentProcess.stderr.on("data", (data: Uint8Array) => {
                const re = /([\d\.]+)%/g;
                const matches = re.exec(data.toString());
                if (matches && matches.length >= 2 && onProgress) {
                    onProgress(parseFloat(matches[1]) / 100);
                }
                console.dir(re.exec(data.toString()));
                console.log(`stderr: ${data}`);
            })
            this.currentProcess.on("close", data => {
                console.log(`Closed: ${data}`);
            })
            this.currentProcess.on("exit", data => {
                data === 0 ? resolve(this.output) : reject("Generic error occured");
                console.log(`Exit: ${data}`);
            });
        });
    }

    static canUseHardwareAcceleration(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const d = spawn("butterflow", ["-d"], { cwd: path.join(store.settings.resourcesFolder, 'butterflow') });

            d.stdout.on("data", data => {
                resolve(new RegExp(/Compatible\s*\:\s*Yes/g).test(data));
            });
            d.stderr.on("data", data => {
                reject(false);
                console.log(`stderr: ${data}`)
            });
        })
    }
}

