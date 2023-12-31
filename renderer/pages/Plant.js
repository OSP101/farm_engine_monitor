import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Card, Modal, Grid, Button, Text, Container, Spacer, Switch, } from "@nextui-org/react";
import plot from "../plot";
// require("v8-compile-cache");
import mqtt from 'mqtt'
import { RiTempColdLine } from 'react-icons/ri';
import { SlSpeedometer } from 'react-icons/sl';
import { GoPrimitiveDot } from 'react-icons/go';

import { IoWater } from 'react-icons/io5';

import { GiElectric } from 'react-icons/gi';
import { BiWater } from 'react-icons/bi';
import { IconContext } from "react-icons";
// import ReactHlsPlayer from '@gumlet/react-hls-player';



const ReactHlsPlayer = dynamic(() => import('@gumlet/react-hls-player'), {
    ssr: false
});

var options = {}
var host = ""



if (process.env.NODE_ENV === 'production') {

    options = {
        // Clean session
        // clean: true,
        // connectTimeout: 4000,
        // Authentication
        clientId: 'water_system_dashboard_2' + Math.random().toString(16),
        username: 'smartfarm',
        password: '123456788',
    }

    host = "ws://localhost:8080/mqtt"
} else {
    options = {
        // Clean session
        // clean: true,
        // connectTimeout: 4000,
        // Authentication
        clientId: 'water_system_dashboard_2' + Math.random().toString(16),
        username: 'tets"',
        password: 'test',
    }

    host = "wss://test.test:8083/mqtt"

}


const mainSystem = "environment"

const initInputAndPump = [
    {
        "name": "พัดลม",
        "id": "44",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topicControl": mainSystem + "/" + "device/" + "44" + "/" + "control",
        "topicData": mainSystem + "/" + "device/" + "44" + "/" + "data",
        "temperature": "",
        "humidity": "",
        "light": ""
    },
]


plot.map((topic) => {
    topic.topicControl = mainSystem + "/" + "device/" + topic.id + "/" + "control"
    topic.topicData = mainSystem + "/" + "device/" + topic.id + "/" + "data"
    topic.topicAlive = mainSystem + "/" + "device/" + topic.id + "/" + "alive"
})




export default function Plant({ isLock, clickLock, addTimeLock, client }) {

    // const [pumpFertilizer, setPumpFertilizer] = useState(false)


    // const [animationPumpFertilizer, setAnimationPumpFertilizer] = useState(0)

    const [plotControl, setPlotControl] = useState(plot)
    // const [lightControl, setLightControl] = useState(light)
    const [inputAndPump, setInputAndPump] = useState(initInputAndPump)


    const username = 'root';
    const password = 'ismart12';
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = `Basic ${encodedCredentials}`;


    const toppicSub = []
    plotControl.map((topic) => {
        toppicSub.push(topic.topicControl)
        toppicSub.push(topic.topicData)
        toppicSub.push(topic.topicAlive)
    })


    toppicSub.push(inputAndPump[0].topicControl)
    toppicSub.push(inputAndPump[0].topicData)


    useEffect(() => {
        if (client) {
            // console.log(JSON.stringify(client))
            // client.on('connect', () => {
            //     // setConnectStatus('Connected');
            client.subscribe(toppicSub, function (err) {
                if (!err) {
                    // client.publish('presence', 'Hello mqtt')
                } else {
                    console.log("error")
                }

            })

            // });
            // client.on('error', (err) => {
            //     console.error('Connection error: ', err);
            //     client.end();
            // });
            // client.on('reconnect', () => {
            //     setConnectStatus('Reconnecting');
            // });
            client.on('message', (topic, message) => {
                const payload = { topic, message: message.toString() };
                const msg = message.toString()
                // setPayload(payload);
                // console.log(msg)


                // if (topic === inputAndPump[0].topicControl) {
                //     initInputAndPump[0].value = msg === "on" ? true : false
                //     setInputAndPump(initInputAndPump)
                //     // setPumpFertilizer(msg === "on" ? true : false)
                // }

                const setValue = plotControl.map((item, val) => {

                    if (item.topicData == topic) {
                        msg = JSON.parse(msg)
                        // console.log(msg)
                        item.ph = msg.ph
                        item.ec = msg.ec
                        item.waterTemperature = msg.waterTemperature
                        item.waterLevel = msg.waterLevel
                        item.flowRate = msg.flowRate

                        // client.publish(item.topic, item.value ? "on" : "off")
                        // console.log("132")
                    }

                    if (item.topicAlive === topic) {
                        item.alive = msg
                    }
                    return item

                })
                setPlotControl(setValue)






            });
        }
    }, [client]);



    const clickGrennhouseControl = (id, value) => {
        if (isLock) {
            clickLock()
        }
        else {
            // const result = valueControl.find(x => x.id == id);
            const setValue = greenhouseControl.map((item, val) => {
                // console.log(val)
                if (item.id == id) {
                    item.value = !item.value
                    item.animation = item.value ? 1 : 0
                    client.publish(item.topicControl, value)
                    // console.log("132")
                }
                return item
            })
            addTimeLock()
        }


    }









    return (
        <Grid.Container css={{ mt: -25, height: 750 }}>
            {/* <div style={{ height: '100%' }}> */}
            {/* <ReactFlow> */}
            {/* <Background /> */}
            {/* <Controls /> */}

            {/* <Grid xs={1.5}>
          
            </Grid> */}



            <Grid xs={12} css={{ mr: 0 }}>
                <Grid.Container >
                    {plotControl.map((item) => (
                        <>
                            <Grid xs={3.9} css={{ mr: 15, zIndex: 1 }}>
                                <Card variant="flat" css={{ mt: 60, width: 1800, height: 610, backgroundColor: "#08123A", borderRadius: 40 }} >
                                    <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                        <Text size={20} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{item.name}</Text>
                                        <IconContext.Provider value={{ color: item.alive === "online" ? "green" : "red" }}>
                                            <GoPrimitiveDot style={{}} size={20} />
                                        </IconContext.Provider>
                                    </Grid.Container>

                                    <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                        <Card variant="flat" css={{ mt: 0, width: 600, height: 337, backgroundColor: "#101C42", borderRadius: 20 }} >

                                            {/* <ReactHlsPlayer
                                            src={item.cameara}
                                            autoPlay={true}
                                            controls={false}
                                            muted
                                            width="100%"
                                            height="auto"
                                            hlsConfig={{
                                               
                                              }}
                                        /> */}
                                            {/* <Image src={item.cameara} width={900} height={500}/> */}
                                            {/* <div>
                                                {item.camera}
                                                <img src={item.camera} alt={item.name} />
                                            </div> */}

                                            {/* <div>
                                                <img src={item.camera} alt={item.name}
                                                    headers={{
                                                        Authorization: authHeader
                                                    }}
                                                />
                                            </div> */}

                                            <Image
                                                src={item.camera} alt={item.name}
                                                loader={({ src }) => `${src}?authorization=${authHeader}`}
                                            />



                                        </Card>
                                    </Grid.Container>

                                    <Grid.Container justify="space-around" css={{ mt: 20 }} >
                                        <div>
                                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                                <div>
                                                    <Card variant="flat" css={{ mt: 0, width: 60, height: 60, backgroundColor: "white", borderRadius: 20 }} >
                                                        <Grid.Container justify="center" alignItems="center">
                                                            <IconContext.Provider value={{ color: "#8BBF52" }}>
                                                                <SlSpeedometer style={{ marginTop: 6 }} size={40} />
                                                            </IconContext.Provider>
                                                        </Grid.Container>
                                                    </Card>
                                                </div>
                                                <div>
                                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                                        <Text size={18} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>pH</Text>
                                                        <Grid.Container alignItems="center">
                                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{item.ph}</Text>
                                                            {/* <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>lux</Text> */}
                                                        </Grid.Container>
                                                    </Grid.Container>
                                                </div>

                                            </Grid.Container>
                                        </div>

                                        <div>
                                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                                <div>
                                                    <Card variant="flat" css={{ mt: 0, width: 60, height: 60, backgroundColor: "white", borderRadius: 20 }} >
                                                        <Grid.Container justify="center" alignItems="center">
                                                            <IconContext.Provider value={{ color: "#FF8C09" }}>
                                                                <GiElectric style={{ marginTop: 5 }} size={45} />
                                                            </IconContext.Provider>
                                                        </Grid.Container>
                                                    </Card>
                                                </div>
                                                <div>
                                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                                        <Text size={18} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>EC</Text>
                                                        <Grid.Container alignItems="center">
                                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{item.ec}</Text>
                                                            {/* <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>lux</Text> */}
                                                        </Grid.Container>
                                                    </Grid.Container>
                                                </div>

                                            </Grid.Container>
                                        </div>

                                        <div>
                                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                                <div>
                                                    <Card variant="flat" css={{ mt: 0, width: 60, height: 60, backgroundColor: "white", borderRadius: 20 }} >
                                                        <Grid.Container justify="center" alignItems="center">
                                                            <IconContext.Provider value={{ color: "#F10A5E" }}>
                                                                <RiTempColdLine style={{ marginTop: 5 }} size={45} />
                                                            </IconContext.Provider>
                                                        </Grid.Container>
                                                    </Card>
                                                </div>
                                                <div>
                                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                                        <Text size={18} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>อุณหภูมิน้ำ</Text>
                                                        <Grid.Container alignItems="center">
                                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{item.waterTemperature}</Text>
                                                            <Text size={18} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>°C</Text>
                                                        </Grid.Container>
                                                    </Grid.Container>
                                                </div>

                                            </Grid.Container>
                                        </div>

                                    </Grid.Container>

                                    <Grid.Container justify="space-around" css={{ mt: 20 }} >


                                        <div>
                                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                                <div>
                                                    <Card variant="flat" css={{ mt: 0, width: 60, height: 60, backgroundColor: "white", borderRadius: 20 }} >
                                                        <Grid.Container justify="center" alignItems="center">
                                                            <IconContext.Provider value={{ color: "#09A3FF" }}>
                                                                <BiWater style={{ marginTop: 5 }} size={45} />
                                                            </IconContext.Provider>
                                                        </Grid.Container>
                                                    </Card>
                                                </div>
                                                <div>
                                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                                        <Text size={18} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>อัตราการไหล</Text>
                                                        <Grid.Container alignItems="center">
                                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{item.flowRate}</Text>
                                                            <Text size={18} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>L/min</Text>
                                                        </Grid.Container>
                                                    </Grid.Container>
                                                </div>

                                            </Grid.Container>
                                        </div>

                                        <div>
                                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                                <div>
                                                    <Card variant="flat" css={{ mt: 0, width: 60, height: 60, backgroundColor: "white", borderRadius: 20 }} >
                                                        <Grid.Container justify="center" alignItems="center">
                                                            <IconContext.Provider value={{ color: "#7D05CC" }}>
                                                                <IoWater style={{ marginTop: 5 }} size={45} />
                                                            </IconContext.Provider>
                                                        </Grid.Container>
                                                    </Card>
                                                </div>
                                                <div>
                                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                                        <Text size={18} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>ระดับน้ำ</Text>
                                                        <Grid.Container alignItems="center">
                                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{item.waterLevel}</Text>
                                                            <Text size={18} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>%</Text>
                                                        </Grid.Container>
                                                    </Grid.Container>
                                                </div>

                                            </Grid.Container>
                                        </div>


                                    </Grid.Container>
                                </Card>
                            </Grid>






                        </>
                    ))}

                </Grid.Container>

            </Grid>





            {/* </ReactFlow> */}
            {/* </div> */}
        </Grid.Container>
    )
}
