/**
 * Типы для всего проекта
 */

// Структура событий
export interface EventInterface {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  progress: number; // 0-100
  imageUrl: string;
  description?: string;
  type?: 'DONATION' | 'FUNDRAISING' | 'JACKPOT';
  recipientId?: string | number;
}

// Структура условий окончания события
export interface EndCondition {
  parameterName: string;
  operator: string;
  value: string;
  comparisonOp?: string; // Оператор сравнения: gt, gte, lt, lte
}

export interface EventEndCondition {
  name?: string; // Имя группы условий
  conditions: EndCondition[];
}