export interface GroupData {
    name: string;
    conditions: Array<{
        parameterName: string;
        operator: string;
        value: string;
        comparisonOp?: string;
    }>;
}

export type EventType = 'DONATION' | 'FUNDRAISING' | 'CHALLENGE'; 