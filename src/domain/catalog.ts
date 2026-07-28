import type { BottleDesign } from './types';

export const bottleCatalog: readonly BottleDesign[] = [
  {
    id: 'aqua',
    name: 'Чистый источник',
    description: 'Лёгкое голубое стекло',
    price: 0,
    colors: ['#6DE4F2', '#1AA9D0', '#D8FAFF'],
  },
  {
    id: 'violet',
    name: 'Лунный кристалл',
    description: 'Мягкое сиреневое сияние',
    price: 2,
    colors: ['#B9A7FF', '#715CD5', '#EFEAFF'],
  },
  {
    id: 'sunset',
    name: 'Розовый закат',
    description: 'Тёплый градиент рассвета',
    price: 3,
    colors: ['#FFB2A7', '#F071A5', '#FFE7D6'],
  },
  {
    id: 'forest',
    name: 'Мятный лес',
    description: 'Свежий оттенок природы',
    price: 4,
    colors: ['#83E2C0', '#2AAE91', '#E0FFF3'],
  },
] as const;
