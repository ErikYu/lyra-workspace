import { COLOR_PALETTE } from '@lyra-sheet/core';

export function LyraSheetColorPalette(prop: {
  chosenColor: (color: string) => void;
}) {
  return (
    <div onMouseDown={(evt) => evt.preventDefault()}>
      <table>
        <tbody>
          {COLOR_PALETTE.map((cg) => (
            <tr>
              {cg.map((c) => (
                <td>
                  <div
                    className={'color-item'}
                    style={{ backgroundColor: c }}
                    onClick={() => prop.chosenColor(c)}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
