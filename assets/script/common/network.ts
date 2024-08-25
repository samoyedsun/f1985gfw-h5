import { EventTarget } from 'cc';

enum ENetStatus {
    Unconnect,
    Waiting,
    Connected
}

class Socket {
    private ws: WebSocket;
    private eventTarget: EventTarget;
    private static instance: Socket;
    private status: number;
    private constructor() {
        this.eventTarget = new EventTarget();
        this.status = ENetStatus.Unconnect;
    }
    public static getInstance(): Socket {
        if (!this.instance) {
            this.instance = new Socket();
        }
        return this.instance;
    }
    public connect(addr: string, next: any) {
        if (this.status != ENetStatus.Unconnect) {
            return;
        }
        next();
        this.ws = new WebSocket(addr);
        this.ws.binaryType = "arraybuffer";
        this.ws.addEventListener("open", function (event) {
            this.status = ENetStatus.Connected
            console.log("WebSocket open: ", event);
            this.eventTarget.emit("onOpen", event);
        }.bind(this));
        this.ws.addEventListener("close", function (event) {
            this.status = ENetStatus.Unconnect;
            console.log("WebSocket close: ", event);
            this.eventTarget.emit("onClose", event);
        }.bind(this));
        this.ws.addEventListener("error", function (event) {
            this.status = ENetStatus.Unconnect;
            console.log("WebSocket error: ", event);
            this.eventTarget.emit("onError", event);
        }.bind(this));
        this.ws.addEventListener("message", function (event) {
            let buffer = new Uint8Array(event.data)
            const msgId = (buffer[1] << 8) | buffer[0];
            const msgSize = (buffer[3] << 8) | buffer[2];
            let msgBuf = buffer.slice(4); 
            this.eventTarget.emit("message" + msgId, msgBuf);
        }.bind(this));
    }
    public on(type: string, handle: any) {
        if (this.eventTarget.hasEventListener(type)) {
            return;
        }
        this.eventTarget.on(type, handle);
    }
    public send(msgId: number, msgBuf: Uint8Array) {
        function toUint8Array(value: number): Uint8Array {
            const buf = new Uint8Array(2);
            buf[0] = value & 0xFF;          // 存放低位字节
            buf[1] = (value >> 8) & 0xFF;   // 存放高位字节
            return buf;
        }
        let msgSize = msgBuf.byteLength;
        let buffer = new Uint8Array(4 + msgSize);
        buffer.set(toUint8Array(msgId));
        buffer.set(toUint8Array(msgSize), 2);
        buffer.set(msgBuf, 4);
        this.ws.send(buffer);
    }
}

export { Socket }