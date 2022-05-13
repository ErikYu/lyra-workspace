// import { TestBed } from '@angular/core/testing';
//
// import { LineWrapService } from './line-wrap.service';
// import { CanvasService } from './canvas.service';
// import { ConfigService } from './config.service';
// import { RichTextLine } from './types';
//
// describe('LineWrapService', () => {
//   let service: LineWrapService;
//   let configService: ConfigService;
//   let canvasService: CanvasService;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [CanvasService, ConfigService, LineWrapService],
//     });
//     configService = TestBed.inject(ConfigService);
//     const container = document.createElement('div');
//     container.style.width = '1000px';
//     container.style.height = '1000px';
//     configService.setConfig(
//       {
//         width: () => 1000,
//         height: () => 1000,
//         row: {
//           count: 30,
//           height: 25,
//           indexHeight: 25,
//         },
//         col: {
//           count: 26,
//           width: 100,
//           indexWidth: 60,
//         },
//       },
//       {
//         getBoundingClientRect: () => ({
//           width: 1000,
//           height: 1000,
//         }),
//       } as HTMLElement
//     );
//     canvasService = TestBed.inject(CanvasService);
//     canvasService.init(
//       document.createElement('canvas'),
//       document.createElement('div')
//     );
//
//     service = TestBed.inject(LineWrapService);
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   it('should calc', () => {
//     const lines: RichTextLine[] = [
//       [
//         { text: 'i am a hero', style: { fontSize: 20 } },
//         { text: ' whose name is erik', style: { fontSize: 12 } },
//       ],
//     ];
//     console.log(service.lineWrapBuilder(lines, 60));
//   });
//
//   it('should calc - 2', () => {
//     const lines: RichTextLine[] = [
//       [{ text: 'i am a hero', style: { fontSize: 12 } }],
//     ];
//     console.log(service.lineWrapBuilder(lines, 60));
//   });
//
//   it('should calc - 3', () => {
//     const lines: RichTextLine[] = [
//       [
//         {
//           text: 'i am a legthhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhyyyyyyyy haha',
//           style: { fontSize: 12 },
//         },
//         { text: ' jixu wrap yaya', style: { fontSize: 12 } },
//       ],
//     ];
//     console.log(service.lineWrapBuilder(lines, 60));
//   });
// });
