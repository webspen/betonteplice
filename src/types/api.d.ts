export interface OrderDate {
    date: string;
    status: string;
    // add other properties that your API returns
}

export interface DatePickerMarker {
    date: Date | string;
    type: 'line';
    color: string;
    tooltip: Array<{
        text: string;
    }>;
}

export declare function getOrderDates(): Promise<OrderDate[]>; 