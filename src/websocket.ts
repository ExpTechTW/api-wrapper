import type { Eew, Ntp, Report, Rts } from "./api";
import { EventEmitter } from "events";
import Route from "./route";

export enum WebSocketEvent {
  Eew = "eew",
  Info = "info",
  Ntp = "ntp",
  Report = "report",
  Rts = "rts",
  Verify = "verify",
  Close = "close",
  Error = "error",
}

export enum SupportedService {
  RealtimeStation = "trem.rts",
  RealtimeWave = "trem.rtw",
  Eew = "websocket.eew",
  Report = "websocket.report",
  Tsunami = "websocket.tsunami",
  TremIntensity = "trem.intensity",
  CwaIntensity = "cwa.intensity",
}

export interface WebSocketConnectionConfig {
  type: "start";
  key?: string;
  service?: SupportedService[];
  config?: {};
}

export enum WebSocketCloseCode {
  InsufficientPermission = 4000,
}


export class ExpTechWebsocket extends EventEmitter {
  ws!: WebSocket;
  websocketConfig: WebSocketConnectionConfig;

  constructor(key?: string, websocketConfig?: WebSocketConnectionConfig) {
    super();
    this.websocketConfig = websocketConfig ?? {
      type: "start",
      key,
      service: [
        SupportedService.RealtimeStation,
        SupportedService.Eew,
        SupportedService.Report,
        SupportedService.Tsunami,
        SupportedService.CwaIntensity,
        SupportedService.TremIntensity,
      ]
    };
    this.#initWebSocket();
  }

  #initWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close();

    const url = Route.websocket();

    this.ws = new WebSocket(url);

    this.ws.addEventListener("open", () => {
      this.ws.send(JSON.stringify(this.websocketConfig));
    });

    this.ws.addEventListener("message", (raw) => {
      try {
        const data = JSON.parse(raw.data);

        if (data)
          switch (data.type) {
            case WebSocketEvent.Verify: {
              this.ws.send(JSON.stringify(this.websocketConfig));
              break;
            }

            case WebSocketEvent.Info: {
              switch (data.data.code) {
                case 200:
                  if (!data.data.list.length) {
                    this.ws.close(WebSocketCloseCode.InsufficientPermission);
                    break;
                  }

                  break;
                case 503:
                  window.setTimeout(
                    () => this.ws.send(JSON.stringify(this.websocketConfig)),
                    5_000
                  );
                  break;
              }
              break;
            }

            case "data": {
              switch (data.data.type) {
                case WebSocketEvent.Rts: {
                  this.emit(WebSocketEvent.Rts, data.data.data);
                  break;
                }
                case WebSocketEvent.Eew: {
                  this.emit(WebSocketEvent.Eew, data.data);
                  break;
                }
                case WebSocketEvent.Report: {
                  this.emit(WebSocketEvent.Report, data.data.data);
                  break;
                }
              }
              break;
            }

            case WebSocketEvent.Ntp: {
              this.emit(WebSocketEvent.Ntp, data);
              break;
            }
          }
      } catch (error) {
        this.emit(WebSocketEvent.Error, error);
      }
    });

    this.ws.addEventListener("close", (ev) => {
      console.log("[WebSocket] Socket closed");
      this.emit(WebSocketEvent.Close, ev);

      if (ev.code != WebSocketCloseCode.InsufficientPermission)
        window.setTimeout(this.#initWebSocket.bind(this), 5_000);
    });

    this.ws.addEventListener("error", (err) => {
      console.error("[WebSocket]", err);
    });
  }
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
