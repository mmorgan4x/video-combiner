import { Component } from '@angular/core';
import { FFmpeg } from 'node_modules/@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from 'node_modules/@ffmpeg/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  loaded = false;
  ffmpeg = new FFmpeg();
  message = '';
  src = '';

  async load() {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
    this.ffmpeg.on('log', ({ message }) => {
      this.message += (message + '\n');
      console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    this.loaded = true;
  }

  async transcode() {
    await this.ffmpeg.writeFile('input.webm', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'));
    await this.ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
    const data = await this.ffmpeg.readFile('output.mp4') as Uint8Array;
    this.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  }
}
