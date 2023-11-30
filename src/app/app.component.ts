import { Component, ElementRef, ViewChild } from '@angular/core';
import { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types';
import { FFmpeg } from 'node_modules/@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from 'node_modules/@ffmpeg/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  videoUrl = 'https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'
  loading = true;
  ffmpeg = new FFmpeg();
  message = '';
  src = this.videoUrl;
  cmd = '-i input.webm -vf hue=s=0 output.mp4';
  @ViewChild('code') code: ElementRef<HTMLElement>;

  async ngOnInit() {
    this.ffmpeg.on('log', t => this.writeLine(t.message));
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    this.loading = false;
  }

  async execute() {
    // this.loading = true;
    this.writeLine('');
    this.writeLine(this.cmd);
    await this.ffmpeg.writeFile('input.webm', await fetchFile(this.videoUrl));
    await this.ffmpeg.exec(this.cmd.split(' '));
    const data = await this.ffmpeg.readFile('output.mp4') as Uint8Array;
    this.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    this.loading = false;
  }

  writeLine(msg: string) {
    this.message += (msg + '\n');
    console.log(msg);
    this.code.nativeElement.scrollTop = this.code?.nativeElement.scrollHeight;
  }
}
