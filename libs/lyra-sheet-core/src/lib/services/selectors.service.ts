// import { ScrollingService } from './scrolling.service';
// import { ViewRangeService } from './view-range.service';
// import { ConfigService } from './config.service';
// import { Selector } from './selector.factory';
// import type { SelectorFactory } from './selector.factory';
// import { DataService } from './data.service';
// import type { Rect } from '../types';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { RenderProxyService } from './render-proxy.service';
// import { inject, Lifecycle, scoped } from 'tsyringe';
//
// // interface SelectorRect {
// //   left: number;
// //   top: number;
// //   width: number;
// //   height: number;
// // }
//
// @scoped(Lifecycle.ContainerScoped)
// export class SelectorsService {
//   private selectors$ = new BehaviorSubject<Selector[]>([]);
//   selectorChanged: Observable<Selector[]>;
//
//   get isEmpty(): boolean {
//     return this.selectors.length === 0;
//   }
//
//   get isNotEmpty(): boolean {
//     return this.selectors.length !== 0;
//   }
//
//   selectors: Selector[] = [];
//
//   get last(): Selector {
//     return this.selectors[this.selectors.length - 1];
//   }
//
//   constructor(
//     @inject(Selector) private selectorFactory: SelectorFactory,
//     private scrollingService: ScrollingService,
//     private dataService: DataService,
//     private viewRangeService: ViewRangeService,
//     private configService: ConfigService,
//     private renderProxyService: RenderProxyService,
//   ) {
//     this.selectorChanged = this.selectors$.asObservable();
//   }
//
//   addRange(sri: number, eri: number, sci: number, eci: number): void {
//     this.selectors.push(this.selectorFactory(sri, eri, sci, eci));
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
//
//   addOne(ri: number, ci: number): void {
//     this.selectors.push(this.selectorFactory(ri, ri, ci, ci));
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
//
//   addWholeRow(ri: number): void {
//     this.selectors.push(
//       this.selectorFactory(
//         ri,
//         ri,
//         0,
//         this.dataService.selectedSheet.getColCount(),
//       ),
//     );
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
//
//   addWholeColumn(ci: number): void {
//     this.selectors.push(
//       this.selectorFactory(
//         0,
//         this.dataService.selectedSheet.getRowCount(),
//         ci,
//         ci,
//       ),
//     );
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
//
//   addAll(): void {
//     this.selectors.push(
//       this.selectorFactory(
//         0,
//         this.dataService.selectedSheet.getRowCount(),
//         0,
//         this.dataService.selectedSheet.getColCount(),
//       ),
//     );
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
//
//   lastResizeTo(eri: number | undefined, eci: number | undefined): void {
//     const [lastStartCi, lastStartRi] = this.last.startCord;
//     if (eri !== undefined && eci !== undefined) {
//       // create a temp rect to find covered merges
//       const tempRect: Rect = {
//         sri: Math.min(eri, lastStartRi),
//         sci: Math.min(eci, lastStartCi),
//         eri: Math.max(eri, lastStartRi),
//         eci: Math.max(eci, lastStartCi),
//       };
//       // calc tempRect covered merge
//       const coveredMerges =
//         this.dataService.selectedSheet.merges.overlappedMergesBy(tempRect);
//       const targetRect = coveredMerges.reduce<Rect>((prev, item) => {
//         return {
//           sri: Math.min(prev.sri, item.sri),
//           sci: Math.min(prev.sci, item.sci),
//           eri: Math.max(prev.eri, item.eri),
//           eci: Math.max(prev.eci, item.eci),
//         };
//       }, tempRect);
//       this.last.resizeTo(targetRect);
//     } else if (eri !== undefined && eci === undefined) {
//       const maxColIndex = this.dataService.selectedSheet.getColCount();
//       this.last.resizeTo({
//         sri: Math.min(eri, lastStartRi),
//         sci: Math.min(maxColIndex, lastStartCi),
//         eri: Math.max(eri, lastStartRi),
//         eci: Math.max(maxColIndex, lastStartCi),
//       });
//     } else if (eri === undefined && eci !== undefined) {
//       const maxRowIndex = this.dataService.selectedSheet.getRowCount();
//       this.last.resizeTo({
//         sri: Math.min(maxRowIndex, lastStartRi),
//         sci: Math.min(eci, lastStartCi),
//         eri: Math.max(maxRowIndex, lastStartRi),
//         eci: Math.max(eci, lastStartCi),
//       });
//     }
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
//
//   removeAll(): void {
//     this.selectors = [];
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
//
//   selectCell(ri: number, ci: number): void {
//     this.selectors = [this.selectorFactory(ri, ri, ci, ci)];
//     this.selectors$.next(this.selectors);
//     this.renderProxyService.render('header');
//   }
// }
