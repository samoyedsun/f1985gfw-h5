import { _decorator, Component, Node, SpriteFrame, resources, director } from 'cc';
import { Socket } from './Common/network';
import message from 'protobufjs/message.js';
const { ccclass, property } = _decorator;

@ccclass('SceneLogin')
export class SceneLogin extends Component {
    start() {
        console.info("hello world");
        let btnLogin = this.node.getChildByName("Login");
        console.info("btnLogin:", btnLogin);
        console.log(btnLogin.getRotation());
    }

    update(deltaTime: number) {
        //console.info("deltaTime:" + deltaTime);
        /*
        let btnLogin = this.node.getChildByName("Login");
        let rotation = btnLogin.getRotation()
        console.info()
        if (Math.random() * 100 >= 50) {
            rotation.z += 0.1;
        } else {
            rotation.z -= 0.1;
        }
        console.log(rotation)
        btnLogin.setRotation(rotation);
        */
    }

    onLogin(event: Event, customEventData: string) {
        let socket = Socket.getInstance();
        socket.connect("ws://127.0.0.1:55890", function() {
            socket.on("onOpen", this.onOpen.bind(this));
            socket.on("message" + message.EnumDefine.EMsgCmd.EMC_S2C_Enter, function(msgBuf: Uint8Array) {
                let msgObj = message.Common.S2C_Enter.decode(msgBuf);
                if (msgObj.result != message.EnumDefine.EErrorCode.EEC_Success) {
                    //console.info("验证失败")
                    //return
                }
                director.loadScene("lobby");
                console.log("验证成功")
                console.log("msgObj.result:", msgObj.result)
            });
        }.bind(this));
    }

    onOpen(event: Event) {
        const msg = Object.create(null);
        msg.uid = 23;
        msg.token = "abc";
        let socket = Socket.getInstance();
        let msgObj = message.Common.C2S_Enter.create(msg);
        console.log("msgObj.id:", msgObj.uid)
        let msgBuf = message.Common.C2S_Enter.encode(msgObj).finish();
        socket.send(message.EnumDefine.EMsgCmd.EMC_C2S_Enter, msgBuf);
    }
}
