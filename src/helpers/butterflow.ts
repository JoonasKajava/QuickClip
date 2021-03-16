import { spawn } from "child_process";
import moment from "moment";

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


    processVideo(onProgress?: (progress: number) => void): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            if (!this.input) return reject("Set input");
            if(!this.output) return reject("Set output");
            if (!this.speed) return reject("Set speed");
            if (!this.framerate) return reject("Set framerate");

            let startMoment, endMoment = null;
            if (this.start) startMoment = moment.utc(moment.duration(this.start, "seconds").asMilliseconds()).format("HH:mm:ss");
            if (this.end) endMoment = moment.utc(moment.duration(this.end, "seconds").asMilliseconds()).format("HH:mm:ss");

            const process = spawn("butterflow", [
                "-audio",
                "-r",
                this.framerate.toString(),
                "-s",
                `a=${startMoment || "0"},b=${endMoment || "end"},spd=${this.speed}`,
                "-o",
                this.output,
                `-v`,
                `${this.input}`
            ], { cwd: "./butterflow/" });
            process.stdout.on("data", data => {
                console.log(`stdout: ${data}`);
            });
            process.stderr.on("data", (data: Uint8Array) => {
                const re = /([\d\.]+)%/g;
                const matches = re.exec(data.toString());
                if(matches && matches.length >= 2 && onProgress) {
                    onProgress(parseFloat(matches[1]));
                }
                console.dir(re.exec(data.toString()));
                console.log(`stderr: ${data}`);
            })
            process.on("close", data => {
                console.log(`Closed: ${data}`);
            })
            process.on("exit", data => {
                data === 0 ? resolve(this.output) : reject("Generic error occured");
                console.log(`Exit: ${data}`);
            });
        });
    }

    static canUseHardwareAcceleration() {
        return new Promise((resolve, reject) => {
            const d = spawn("butterflow", ["-d"], { cwd: "./butterflow/" });

            d.stdout.on("data", data => {
                resolve(new RegExp(/Compatible\s*\:\s*Yes/g).test(data));
            });
            d.stderr.on("data", data => {
                reject(data);
                console.log(`stderr: ${data}`)
            });
        })
    }
}

