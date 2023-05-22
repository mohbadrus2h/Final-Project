import { SerialPort } from 'serialport'
import { send,
         MavLinkProtocolV1,
         MavLinkPacketSplitter,
         MavLinkPacketParser,
         minimal, common } from 'node-mavlink'
import { io } from 'socket.io-client'

const REGISTRY = {
    ...minimal.REGISTRY,
    ...common.REGISTRY,
}

const port = new SerialPort({ path: 'COM6', baudRate: 57600 })

const reader = port.pipe(new MavLinkPacketSplitter())
                   .pipe(new MavLinkPacketParser())
// const socket = io('http://127.0.0.1:4000/')

reader.on('data', packet => {
    const msg = REGISTRY[packet.header.msgid]
    if (msg && msg.MSG_ID === 24) {
        const data = packet.protocol.data(packet.payload, msg)
        console.log({lat: (data.lat /10000000), lon: (data.lon / 10000000), alt: (data.alt / 10000000)})
        // socket.emit("telemetry-data", {
        //     lat: (data.lat /10000000), 
        //     lon: (data.lon / 10000000), 
        //     alt: (data.alt / 10000000)
        // })
    }

    // if (msg) {
    //     const data = packet.protocol.data(packet.payload, msg)
    //     console.log(data)
    //     // socket.emit("telemetry-data", {
    //     //     lat: (data.lat /10000000), 
    //     //     lon: (data.lon / 10000000), 
    //     //     alt: (data.alt / 10000000)
    //     // })
    // }
})

const sendMsg = new common.CommandInt()
sendMsg.command = common.MavCmd.REQUEST_PROTOCOL_VERSION
sendMsg.param1 = 1

port.on('open', async () => {
    await send(port, sendMsg, new MavLinkProtocolV1())
})