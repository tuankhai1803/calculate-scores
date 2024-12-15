export const columnsConfig = [
  { key: 'TC2', max: 1.0, range: [0.4, 1] },
  { key: 'TC3', max: 1.0, range: [0.4, 1] },
  { key: 'TC4', max: 1.0, range: [0.4, 1] },
  { key: 'TC5', max: 1.0, range: [0.4, 1] },
  { key: 'TC6', max: 2.0, range: [0.8, 2] },
  { key: 'TC7', max: 1.0, range: [0.4, 1] },
  { key: 'TC8', max: 1.0, range: [0.4, 1] },
];

export const min = columnsConfig.reduce((total, item) => item.range[0] + total, 0);
export const max = columnsConfig.reduce((total, item) => item.range[1] + total, 0);
