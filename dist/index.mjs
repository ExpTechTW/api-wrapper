import { EventEmitter } from 'events';

class Route {
    version;
    key;
    constructor(options = {}) {
        this.version = options.version ?? 2;
        this.key = options.key ?? "";
    }
    randomServerUrl() {
        return `https://api-${Math.ceil(Math.random() * 2)}.exptech.com.tw`;
    }
    randomLoadBalancerUrl() {
        return `https://lb-${Math.ceil(Math.random() * 4)}.exptech.com.tw`;
    }
    randomServerBaseUrl() {
        return `${this.randomLoadBalancerUrl()}/api/v${this.version}`;
    }
    randomLoadBalancerBaseUrl() {
        return `${this.randomLoadBalancerUrl()}/api/v${this.version}`;
    }
    static websocket() {
        return `wss://lb-${Math.ceil(Math.random() * 4)}.exptech.com.tw/websocket`;
    }
    earthquakeReportList(limit = 50) {
        return `${this.randomServerBaseUrl()}/eq/report?limit=${limit}&key=${this.key}`;
    }
    earthquakeReport(id) {
        return `${this.randomServerBaseUrl()}/eq/report/${id}`;
    }
    rts(timestamp) {
        if (timestamp) {
            return `${this.randomLoadBalancerBaseUrl()}/trem/rts/${timestamp}`;
        }
        else {
            return `${this.randomLoadBalancerBaseUrl()}/trem/rts`;
        }
    }
    rtsImage(timestamp) {
        if (timestamp) {
            return `${this.randomLoadBalancerBaseUrl()}/trem/rts-image/${timestamp}`;
        }
        else {
            return `${this.randomLoadBalancerBaseUrl()}/trem/rts-image`;
        }
    }
    eew(timestamp, type) {
        if (timestamp) {
            if (type) {
                return `${this.randomLoadBalancerBaseUrl()}/eq/eew/${timestamp}?type=${type}`;
            }
            else {
                return `${this.randomLoadBalancerBaseUrl()}/eq/eew/${timestamp}`;
            }
        }
        else {
            if (type) {
                return `${this.randomLoadBalancerBaseUrl()}/eq/eew?type=${type}`;
            }
            else {
                return `${this.randomLoadBalancerBaseUrl()}/eq/eew`;
            }
        }
    }
    station() {
        return `${this.randomLoadBalancerUrl()}/file/resource/station.json`;
    }
}

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
/**
 * 地震速報來源機關
 */
var EewSource;
(function (EewSource) {
    /**
     * 交通部中央氣象署
     * @link https://www.cwa.gov.tw
     */
    EewSource["Cwa"] = "cwa";
    /**
     * 기상청 날씨누리
     * @link https://www.kma.go.kr
     */
    EewSource["Kma"] = "kma";
    /**
     * 気象庁
     * @link https://www.jma.go.jp
     */
    EewSource["Jma"] = "jma";
    /**
     * 防災科研
     * @link https://www.bosai.go.jp
     */
    EewSource["Nied"] = "nied";
    /**
     * 四川省地震局
     * @link https://www.scdzj.gov.cn
     */
    EewSource["Scdzj"] = "scdzj";
})(EewSource || (EewSource = {}));
/**
 * 地震速報狀態
 */
var EewStatus;
(function (EewStatus) {
    /**
     * 注意報
     */
    EewStatus[EewStatus["Warn"] = 0] = "Warn";
    /**
     * 警報
     */
    EewStatus[EewStatus["Alert"] = 1] = "Alert";
    /**
     * 取消報
     */
    EewStatus[EewStatus["Cancel"] = 2] = "Cancel";
    /**
     * 測試報
     */
    EewStatus[EewStatus["Test"] = 3] = "Test";
})(EewStatus || (EewStatus = {}));
const Intensity = [
    { value: 0, label: "0", text: "０級" },
    { value: 1, label: "1", text: "１級" },
    { value: 2, label: "2", text: "２級" },
    { value: 3, label: "3", text: "３級" },
    { value: 4, label: "4", text: "４級" },
    { value: 5, label: "5-", text: "５弱" },
    { value: 6, label: "5+", text: "５強" },
    { value: 7, label: "6-", text: "６弱" },
    { value: 8, label: "6+", text: "６強" },
    { value: 9, label: "7", text: "７級" },
];
class ExpTechApi extends EventEmitter {
    key;
    route;
    constructor(key) {
        super();
        this.key = key ?? "";
        this.route = new Route({ key: this.key });
    }
    setApiKey(apiKey) {
        this.key = apiKey;
        this.route.key = apiKey;
        return this;
    }
    /**
     * Inner get request wrapper
     * @param {string} url
     * @returns {Promise<any>}
     */
    async #get(url) {
        const request = new Request(url, {
            method: "GET",
            cache: "default",
            headers: {
                Accept: "application/json",
            },
        });
        const res = await fetch(request);
        if (!res.ok)
            throw new Error(`Server returned ${res.status}`);
        return res;
    }
    async getStations() {
        const url = this.route.station();
        return (await this.#get(url)).json();
    }
    /**
     * 獲取地震報告列表
     * @param {number} [limit]
     * @returns {Promise<PartialReport[]>}
     */
    async getReports(limit) {
        const url = this.route.earthquakeReportList(limit);
        const data = await (await this.#get(url)).json();
        for (const report of data)
            report.no = +report.id.split("-")[0];
        return data;
    }
    /**
     * 獲取指定地震報告
     * @param {string} id 地震報告 ID
     * @returns {Promise<Report>}
     */
    async getReport(id) {
        const url = this.route.earthquakeReport(`${id}`);
        const data = await (await this.#get(url)).json();
        data.no = +data.id.split("-")[0];
        data.int = Object.keys(data.list).reduce((acc, key) => (data.list[key].int > acc ? data.list[key].int : acc), 0);
        data.list = Object.keys(data.list)
            .map((key) => ({
            area: key,
            int: data.list[key].int,
            stations: Object.keys(data.list[key].town)
                .map((k) => ({
                ...data.list[key].town[k],
                station: k,
            }))
                .sort((a, b) => b.int - a.int),
        }))
            .sort((a, b) => b.int - a.int);
        return data;
    }
    /**
     * 獲取即時地動資料
     * @param {number} [time] 時間
     * @returns {Promise<Rts>}
     */
    async getRts(time) {
        const url = this.route.rts(time ? `${time}` : "");
        return (await this.#get(url)).json();
    }
    /**
     * 獲取即時地動圖片資料
     * @param {number} [time] 時間
     * @returns {Promise<Buffer>}
     */
    async getRtsImage(time) {
        const url = this.route.rtsImage(time ? `${time}` : "");
        return (await this.#get(url)).arrayBuffer();
    }
    /**
     * 獲取地震速報資料
     * @param {number} [time] 時間
     * @param {EewSource} [type] 地震速報來源機關
     * @returns {Promise<Eew[]>}
     */
    async getEew(time, type) {
        const url = this.route.eew(time ? `${time}` : "");
        return (await this.#get(url)).json();
    }
}

var WebSocketEvent;
(function (WebSocketEvent) {
    WebSocketEvent["Eew"] = "eew";
    WebSocketEvent["Info"] = "info";
    WebSocketEvent["Ntp"] = "ntp";
    WebSocketEvent["Report"] = "report";
    WebSocketEvent["Rts"] = "rts";
    WebSocketEvent["Verify"] = "verify";
    WebSocketEvent["Close"] = "close";
    WebSocketEvent["Error"] = "error";
})(WebSocketEvent || (WebSocketEvent = {}));
var SupportedService;
(function (SupportedService) {
    SupportedService["RealtimeStation"] = "trem.rts";
    SupportedService["RealtimeWave"] = "trem.rtw";
    SupportedService["Eew"] = "websocket.eew";
    SupportedService["Report"] = "websocket.report";
    SupportedService["Tsunami"] = "websocket.tsunami";
    SupportedService["TremIntensity"] = "trem.intensity";
    SupportedService["CwaIntensity"] = "cwa.intensity";
})(SupportedService || (SupportedService = {}));
var WebSocketCloseCode;
(function (WebSocketCloseCode) {
    WebSocketCloseCode[WebSocketCloseCode["InsufficientPermission"] = 4000] = "InsufficientPermission";
})(WebSocketCloseCode || (WebSocketCloseCode = {}));
class ExpTechWebsocket extends EventEmitter {
    ws;
    websocketConfig;
    constructor(key, websocketConfig) {
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
        if (this.ws && this.ws.readyState === WebSocket.OPEN)
            this.ws.close();
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
                                    window.setTimeout(() => this.ws.send(JSON.stringify(this.websocketConfig)), 5_000);
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
            }
            catch (error) {
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

export { EewSource, EewStatus, ExpTechApi, ExpTechWebsocket, Intensity, SupportedService, WebSocketCloseCode, WebSocketEvent };
