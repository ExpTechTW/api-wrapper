import type { Eew, Ntp, Report, Rts } from "./api";
import { EventEmitter } from "events";
export declare enum WebSocketEvent {
    Eew = "eew",
    Info = "info",
    Ntp = "ntp",
    Report = "report",
    Rts = "rts",
    Verify = "verify",
    Close = "close",
    Error = "error"
}
export declare enum SupportedService {
    RealtimeStation = "trem.rts",
    RealtimeWave = "trem.rtw",
    Eew = "websocket.eew",
    Report = "websocket.report",
    Tsunami = "websocket.tsunami",
    TremIntensity = "trem.intensity",
    CwaIntensity = "cwa.intensity"
}
export interface WebSocketConnectionConfig {
    type: "start";
    key?: string;
    service?: SupportedService[];
    config?: {};
}
export declare enum WebSocketCloseCode {
    InsufficientPermission = 4000
}
export declare class ExpTechWebsocket extends EventEmitter {
    #private;
    ws: WebSocket;
    websocketConfig: WebSocketConnectionConfig;
    constructor(key?: string, websocketConfig?: WebSocketConnectionConfig);
}
export declare interface ExpTechWebsocket extends EventEmitter {
    /**
     * 地動資料
     * @param {WebSocketEvent.Rts} event rts
     * @param {(rts: Rts) => void} listener
     */
    on(event: WebSocketEvent.Rts, listener: (rts: Rts) => void): this;
    /**
     * 地震速報資料
     * @param {WebSocketEvent.Eew} event eew
     * @param {(eew: Eew) => void} listener
     */
    on(event: WebSocketEvent.Eew, listener: (eew: Eew) => void): this;
    /**
     * 地震速報資料
     * @param {WebSocketEvent.Ntp} event ntp
     * @param {(ntp: Ntp) => void} listener
     */
    on(event: WebSocketEvent.Ntp, listener: (ntp: Ntp) => void): this;
    /**
     * 地震報告資料
     * @param {WebSocketEvent.Report} event ntp
     * @param {(report: Report) => void} listener
     */
    on(event: WebSocketEvent.Report, listener: (report: Report) => void): this;
    /**
     * 地震速報資料
     * @param {WebSocketEvent.Close} event close
     * @param {(ev: CloseEvent) => void} listener
     */
    on(event: WebSocketEvent.Close, listener: (ev: CloseEvent) => void): this;
}
