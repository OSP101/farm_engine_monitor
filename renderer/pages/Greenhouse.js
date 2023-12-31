import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Card, Modal, Grid, Button, Text, Container, Spacer, Switch, } from "@nextui-org/react";
import greenhouse from "../greenhouse";
import light from "../light";
// require("v8-compile-cache");
import mqtt from 'mqtt'
import { RiTempColdLine } from 'react-icons/ri';
import { WiHumidity } from 'react-icons/wi';
import { CiLight } from 'react-icons/ci';
import { GiComputerFan } from 'react-icons/gi';

import { GoPrimitiveDot } from 'react-icons/go';
import { MdLightbulb } from 'react-icons/md';
import { IconContext } from "react-icons";

import 'react-simple-keyboard/build/css/index.css';


const Xarrow = dynamic(() => import('react-xarrows'), {
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

    },
    {
        "name": "เซนเซอร์สภาพแวดล้อม",
        "id": "45",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topicControl": mainSystem + "/" + "device/" + "45" + "/" + "control",
        "topicData": mainSystem + "/" + "device/" + "45" + "/" + "data",
        "topicAlive": mainSystem + "/" + "device/" + "45" + "/" + "alive",
        "temperature": "",
        "humidity": "",
        "light": ""
    },
]


greenhouse.map((topic) => {
    topic.topicControl = mainSystem + "/" + "device/" + topic.id + "/" + "control"
    topic.topicData = mainSystem + "/" + "device/" + topic.id + "/" + "data"
    topic.topicAlive = mainSystem + "/" + "device/" + topic.id + "/" + "alive"
})

light.map((topic) => {
    topic.topicControl = mainSystem + "/" + "device/" + topic.id + "/" + "control"
    topic.topicData = mainSystem + "/" + "device/" + topic.id + "/" + "data"
    topic.topicAlive = mainSystem + "/" + "device/" + topic.id + "/" + "alive"
})

export default function Greenhouse({ isLock, clickLock, addTimeLock, client }) {

    // const [pumpFertilizer, setPumpFertilizer] = useState(false)


    // const [animationPumpFertilizer, setAnimationPumpFertilizer] = useState(0)

    const [greenhouseControl, setGreenhouseControl] = useState(greenhouse)
    const [lightControl, setLightControl] = useState(light)
    const [inputAndPump, setInputAndPump] = useState(initInputAndPump)
    const [envSensorAlive, setEnvSensorAlive] = useState()




    const toppicSub = []
    greenhouse.map((topic) => {
        toppicSub.push(topic.topicControl)
        toppicSub.push(topic.topicData)
        toppicSub.push(topic.topicAlive)
    })
    light.map((topic) => {
        toppicSub.push(topic.topicControl)
        toppicSub.push(topic.topicData)
        toppicSub.push(topic.topicAlive)
    })

    toppicSub.push(inputAndPump[0].topicControl)
    toppicSub.push(inputAndPump[0].topicData)
    toppicSub.push(inputAndPump[1].topicControl)
    toppicSub.push(inputAndPump[1].topicData)
    toppicSub.push(inputAndPump[1].topicAlive)


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

                if (topic === inputAndPump[1].topicData) {
                    const data = JSON.parse(msg)
                    initInputAndPump[1].light = data.light
                    initInputAndPump[1].temperature = data.temperature
                    initInputAndPump[1].humidity = data.humidity
                    setInputAndPump(initInputAndPump)

                }
                if (topic === inputAndPump[1].topicAlive) {
                    // const data = JSON.parse(msg)
                    setEnvSensorAlive(msg)
                }


                if (topic === inputAndPump[0].topicControl) {
                    initInputAndPump[0].value = msg === "on" ? true : false
                    setInputAndPump(initInputAndPump)
                    // setPumpFertilizer(msg === "on" ? true : false)
                }

                const setValue = greenhouseControl.map((item, val) => {
                    // console.log(val)
                    if (item.topicControl == topic) {
                        item.value = msg

                        // client.publish(item.topic, item.value ? "on" : "off")
                        // console.log("132")
                    }

                    if (item.topicAlive === topic) {
                        item.alive = msg
                    }
                    return item

                })
                setGreenhouseControl(setValue)

                const setLight = lightControl.map((item, val) => {
                    // console.log(val)
                    if (item.topicControl == topic) {
                        if (msg === "increase" || msg === "reduce") {

                        } else {
                            item.value = msg
                        }


                        // client.publish(item.topic, item.value ? "on" : "off")
                        // console.log("132")
                    }

                    if (item.topicAlive === topic) {
                        item.alive = msg
                    }
                    return item

                })
                setLightControl(setLight)





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

    const clickLightControl = (id, value) => {
        if (isLock) {
            clickLock()
        }
        else {
            // const result = valueControl.find(x => x.id == id);
            const setValue = lightControl.map((item, val) => {
                // console.log(val)
                if (item.id == id) {
                    // item.value = !item.value
                    // item.animation = item.value ? 1 : 0
                    client.publish(item.topicControl, value)
                    // console.log("132")
                }
                return item
            })
            addTimeLock()
        }


    }

    const clickFan = () => {
        // setPump(!pump)
        // pump ? setAnimationPump(0) : setAnimationPump(3)
        if (isLock) {
            clickLock()
        }
        else {
            client.publish(inputAndPump[0].topicControl, inputAndPump[0].value ? "off" : "on")
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

            <Grid xs={12} justify="center">
                <Card variant="flat" css={{ mt: 60, width: 1800, height: 190, backgroundColor: "#08123A", borderRadius: 40 }} >
                    <Grid.Container justify="center" alignItems="center">
                        <Text size={20} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>ภายในโรงเรือน</Text>
                        <IconContext.Provider value={{ color: envSensorAlive === "online" ? "green" : "red" }}>
                            <GoPrimitiveDot style={{marginTop: 10}} size={20} />
                        </IconContext.Provider>
                        {/* <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                     
                        </Grid.Container> */}
                    </Grid.Container>
                    <Grid.Container justify="space-around" css={{ mt: 12 }}>
                        <div>
                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                <div>
                                    <Card variant="flat" css={{ mt: 0, width: 100, height: 100, backgroundColor: "white", borderRadius: 30 }} >
                                        <Grid.Container justify="center" alignItems="center">
                                            <IconContext.Provider value={{ color: "#FF5409" }}>
                                                <RiTempColdLine style={{ marginTop: 15 }} size={65} />
                                            </IconContext.Provider>
                                        </Grid.Container>
                                    </Card>
                                </div>
                                <div>
                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                        <Text size={20} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>อุณหภูมิ</Text>
                                        <Grid.Container>
                                            <Text size={35} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{inputAndPump[1].temperature}</Text>
                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>°C</Text>
                                        </Grid.Container>

                                    </Grid.Container>
                                </div>

                            </Grid.Container>
                        </div>

                        <div>
                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                <div>
                                    <Card variant="flat" css={{ mt: 0, width: 100, height: 100, backgroundColor: "white", borderRadius: 30 }} >
                                        <Grid.Container justify="center" alignItems="center">
                                            <IconContext.Provider value={{ color: "#09A3FF" }}>
                                                <WiHumidity style={{ marginTop: 10 }} size={75} />
                                            </IconContext.Provider>
                                        </Grid.Container>
                                    </Card>
                                </div>
                                <div>
                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                        <Text size={20} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>ความชื้น</Text>
                                        <Grid.Container alignItems="center">
                                            <Text size={35} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{inputAndPump[1].humidity}</Text>
                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>%</Text>
                                        </Grid.Container>
                                    </Grid.Container>
                                </div>

                            </Grid.Container>
                        </div>

                        <div>
                            <Grid.Container css={{ d: "flex", flexDirection: "row" }}>
                                <div>
                                    <Card variant="flat" css={{ mt: 0, width: 100, height: 100, backgroundColor: "white", borderRadius: 30 }} >
                                        <Grid.Container justify="center" alignItems="center">
                                            <IconContext.Provider value={{ color: "#FF8C09" }}>
                                                <CiLight style={{ marginTop: 10 }} size={75} />
                                            </IconContext.Provider>
                                        </Grid.Container>
                                    </Card>
                                </div>
                                <div>
                                    <Grid.Container css={{ d: "flex", flexDirection: "column" }}>
                                        <Text size={20} css={{ ml: 15, mt: 5, fontFamily: 'NotoSansThai' }}>แสง</Text>
                                        <Grid.Container alignItems="center">
                                            <Text size={35} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>{inputAndPump[1].light}</Text>
                                            <Text size={20} css={{ ml: 15, fontFamily: 'NotoSansThai' }}>lux</Text>
                                        </Grid.Container>
                                    </Grid.Container>
                                </div>

                            </Grid.Container>
                        </div>
                    </Grid.Container>

                </Card>
            </Grid>

            <Grid xs={12} css={{ mt: 0 }}>
                <Grid.Container >
                    {greenhouseControl.map((item) => (
                        <>

                            <Grid xs={2.5} css={{ mt: 0, zIndex: 1 }}>
                                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                    {/* <Card id={item.id} onPress={() => clickFertilizer(item.id)} isPressable css={{ width: 300, height: 160, backgroundColor: "#31406D" }} > */}
                                    <Grid.Container alignItems="center" justify="space-around">
                                        <Grid.Container justify="center" css={{ mt: 0 }} >
                                            <Image alt="" src={'/images/' + item.image} width={80} height={80} />
                                        </Grid.Container>

                                        <Button.Group size="xl" color="success">
                                            <Button onPress={() => clickGrennhouseControl(item.id, "open")} css={{ backgroundColor: item.value === "open" ? "success" : "#31406D" }}> <Text size={25} css={{ color: item.value === "open" ? "white" : "white", fontFamily: 'NotoSansThai' }}>เปิด</Text></Button>
                                            <Button onPress={() => clickGrennhouseControl(item.id, "stop")} css={{ backgroundColor: item.value === "stop" ? "success" : "#31406D" }}> <Text size={25} css={{ color: item.value === "stop" ? "white" : "white", fontFamily: 'NotoSansThai' }}>หยุด</Text></Button>
                                            <Button onPress={() => clickGrennhouseControl(item.id, "close")} css={{ backgroundColor: item.value === "close" ? "success" : "#31406D" }}> <Text size={25} css={{ color: item.value === "close" ? "white" : "white", fontFamily: 'NotoSansThai' }}>ปิด</Text></Button>
                                        </Button.Group>

                                    </Grid.Container>

                                    {/* </Card> */}
                                    <Text size={20} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{item.name}</Text>
                                </Grid.Container>
                            </Grid>




                        </>
                    ))}

                    <Grid xs={2}>
                        <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                            <Card id="fan" onPress={() => clickFan()} isPressable css={{ mt: 75, width: 140, height: 140, backgroundColor: inputAndPump[0].value ? "#88EF4D" : "#31406D" }} >
                                <Grid.Container alignItems="center" justify="space-around">

                                    <Grid.Container alignItems="center" justify="space-between" css={{ ml: 10, mr: 10 }}>
                                        <Text color={inputAndPump[0].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{inputAndPump[0].value ? "เปิด" : "ปิด"}</Text>
                                        <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={inputAndPump[0].value} />
                                    </Grid.Container>
                                    <Grid.Container css={{ mt: 2 }} alignItems="center" justify="space-around">
                                        <IconContext.Provider value={{ color: inputAndPump[0].value ? "#101C42" : "white" }}>
                                            <GiComputerFan style={{ marginTop: 10 }} size={75} />
                                        </IconContext.Provider>
                                    </Grid.Container>
                                </Grid.Container>
                            </Card>
                            <Text size={20} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>พัดลม</Text>
                        </Grid.Container>
                    </Grid>

                </Grid.Container>

            </Grid>

            <Grid xs={12} css={{ mt: 3 }}>
                <Grid.Container justify="center" >
                    {lightControl.map((item) => (
                        <>
                            <Grid xs={3} css={{ mt: 0, zIndex: 1 }}>
                                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                    <Card variant="flat" id={item.id} css={{ width: 450, height: 280, backgroundColor: "#101C42", borderRadius: 20 }} >
                                        <Grid.Container alignItems="center" justify="center">
                                            <Text size={20} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{item.name}</Text>
                                            <Grid.Container justify="center" css={{ mt: 10 }} >
                                                <div>
                                                    <Grid.Container justify="center" css={{ d: "flex", flexDirection: "row" }}>
                                                        <div>

                                                            <Card variant="flat" css={{ mt: 0, width: 90, height: 90, borderRadius: 30, backgroundColor: "#08123A" }} >
                                                                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                                                    <IconContext.Provider value={{ color: "#F8AE03" }}>
                                                                        <MdLightbulb style={{ marginTop: 10 }} size={55} />
                                                                    </IconContext.Provider>
                                                                    <IconContext.Provider value={{ color: item.alive === "online" ? "green" : "red" }}>
                                                                        <GoPrimitiveDot style={{}} size={20} />
                                                                    </IconContext.Provider>
                                                                </Grid.Container>
                                                            </Card>

                                                        </div>
                                                        <Spacer x={1} />
                                                        <div>
                                                            <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>

                                                                <Button.Group size="xl" color="success">
                                                                    <Button onPress={() => clickLightControl(item.id, "increase")} css={{ backgroundColor: "#31406D" }}>
                                                                        <Text size={25} css={{ fontFamily: 'NotoSansThai' }}>
                                                                            -
                                                                        </Text>
                                                                    </Button>
                                                                    <Button onPress={() => clickLightControl(item.id, "reduce")} css={{ backgroundColor: "#31406D" }}>
                                                                        <Text size={25} css={{ fontFamily: 'NotoSansThai' }}>
                                                                            +
                                                                        </Text>
                                                                    </Button>
                                                                </Button.Group>
                                                                <Text size={18} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>ความสว่าง</Text>

                                                            </Grid.Container>
                                                        </div>

                                                    </Grid.Container>
                                                </div>
                                            </Grid.Container>

                                            <Button.Group size="md" color="success" css={{ mt: 10 }}>
                                                <Button onPress={() => clickLightControl(item.id, "off")} css={{ backgroundColor: item.value === "off" ? "#88EF4D" : "#31406D" }}>
                                                    <Text size={18} css={{ color: item.value === "off" ? "#31406D" : "white", fontFamily: 'NotoSansThai' }}>
                                                        ปิด
                                                    </Text>
                                                </Button>
                                                <Button onPress={() => clickLightControl(item.id, "red")} css={{ backgroundColor: item.value === "red" ? "#88EF4D" : "#31406D" }}>
                                                    <Card variant="flat" css={{ width: 25, height: 25, backgroundColor: "#FF0E60", borderRadius: 5 }} >
                                                    </Card>
                                                </Button>
                                                <Button onPress={() => clickLightControl(item.id, "green")} css={{ backgroundColor: item.value === "green" ? "#88EF4D" : "#31406D" }}>
                                                    <Card variant="flat" css={{ width: 25, height: 25, backgroundColor: "#0A7E55", borderRadius: 5 }} >
                                                    </Card>
                                                </Button>
                                                <Button onPress={() => clickLightControl(item.id, "blue")} css={{ backgroundColor: item.value === "blue" ? "#88EF4D" : "#31406D" }}>
                                                    <Card variant="flat" css={{ width: 25, height: 25, backgroundColor: "#2477F3", borderRadius: 5 }} >
                                                    </Card>
                                                </Button>
                                                <Button onPress={() => clickLightControl(item.id, "white")} css={{ backgroundColor: item.value === "white" ? "#88EF4D" : "#31406D" }}>
                                                    <Card variant="flat" css={{ width: 25, height: 25, backgroundColor: "white", borderRadius: 5 }} >
                                                    </Card>

                                                </Button>

                                            </Button.Group>

                                            <Button.Group size="md" color="success" css={{ mt: 10 }}>
                                                <Button onPress={() => clickLightControl(item.id, "violet")} css={{ backgroundColor: item.value === "violet" ? "#88EF4D" : "#31406D" }}>
                                                    <Card variant="flat" css={{ width: 25, height: 25, backgroundColor: "#9F03F8", borderRadius: 5 }} >
                                                    </Card>
                                                </Button>

                                                <Button onPress={() => clickLightControl(item.id, "yellow")} css={{ backgroundColor: item.value === "yellow" ? "#88EF4D" : "#31406D" }}>
                                                    <Card variant="flat" css={{ width: 25, height: 25, backgroundColor: "#EBDB00", borderRadius: 5 }} >
                                                    </Card>
                                                </Button>

                                                <Button onPress={() => clickLightControl(item.id, "sky")} css={{ backgroundColor: item.value === "sky" ? "#88EF4D" : "#31406D" }}>
                                                    <Card variant="flat" css={{ width: 25, height: 25, backgroundColor: "#00C3EB", borderRadius: 5 }} >
                                                    </Card>
                                                </Button>
                                            </Button.Group>

                                        </Grid.Container>

                                    </Card>

                                </Grid.Container>
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
