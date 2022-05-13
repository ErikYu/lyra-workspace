interface DividerProp {
  direction: 'vertical' | 'horizontal';
}

export function LyraSheetDivider(prop: DividerProp) {
  return <div className={'lyra-sheet-divider ' + prop.direction}></div>;
}
