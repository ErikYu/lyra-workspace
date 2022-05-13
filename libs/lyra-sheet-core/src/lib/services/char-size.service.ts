import { TextStyle } from '../types';
import { Lifecycle, scoped } from 'tsyringe';

type SizeCondition = Required<
  Pick<TextStyle, 'bold' | 'fontSize' | 'fontName'>
>;

@scoped(Lifecycle.ContainerScoped)
export class CharSizeService {
  data: {
    [key: string]: {
      [fontName: string]: {
        [fontSize: string]: {
          [bold: string]: number; // isBold : true / false
        };
      };
    };
  } = {};

  private isChinese(char: string): boolean {
    const re = /[^\u4e00-\u9fa5]/;
    return !re.test(char);
  }

  cacheWith(
    char: string,
    width: number,
    { fontName, fontSize, bold }: SizeCondition,
  ): void {
    if (!this.data[char]) {
      this.data[char] = {
        [fontName]: {
          [`${fontSize}`]: {
            [`${bold}`]: width,
          },
        },
      };
    } else if (!this.data[char][fontName]) {
      this.data[char][fontName] = {
        [`${fontSize}`]: {
          [`${bold}`]: width,
        },
      };
    } else if (!this.data[char][fontName][`${fontSize}`]) {
      this.data[char][fontName][`${fontSize}`] = {
        [`${bold}`]: width,
      };
    } else {
      this.data[char][fontName][`${fontSize}`][`${bold}`] = width;
    }
  }

  getCachedWidth(
    char: string,
    { fontName, fontSize, bold }: SizeCondition,
  ): number {
    if (this.isChinese(char)) {
      return fontSize;
    }
    return (
      this.data[char] &&
      this.data[char][fontName] &&
      this.data[char][fontName][`${fontSize}`] &&
      this.data[char][fontName][`${fontSize}`][`${bold}`]
    );
  }
}
