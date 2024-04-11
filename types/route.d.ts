interface RouteOptions {
    version?: 1 | 2;
    key?: string;
}
export default class Route {
    version: number;
    key: string;
    constructor(options?: RouteOptions);
    randomHostUrl(): `https://lb-${number}.exptech.com.tw`;
    randomBaseUrl(): `https://lb-${number}.exptech.com.tw/api/v${number}`;
    static websocket(): `wss://lb-${number}.exptech.com.tw/websocket`;
    earthquakeReportList(limit?: number): `https://lb-${number}.exptech.com.tw/api/v${number}/eq/report?limit=${number}&key=${string}`;
    earthquakeReport(id: string): `https://lb-${number}.exptech.com.tw/api/v${number}/eq/report/${string}`;
    rts(timestamp?: string): string;
    eew(timestamp?: string): `https://lb-${number}.exptech.com.tw/api/v${number}/eq/eew/${string}` | `https://lb-${number}.exptech.com.tw/api/v${number}/eq/eew`;
    station(): `https://lb-${number}.exptech.com.tw/file/resource/station.json`;
}
export {};
