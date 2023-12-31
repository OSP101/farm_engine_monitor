import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Card, Modal, Grid, Button, Text, Container, Spacer, Switch, } from "@nextui-org/react";
import zoneValve from "../zoneValve";
// require("v8-compile-cache");
import mqtt from 'mqtt'
import { HiLockClosed, HiLockOpen } from 'react-icons/hi';
import { HiComputerDesktop } from 'react-icons/hi2';
import { IconContext } from "react-icons";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import moment from 'moment'

// const NumericInput = dynamic(() => import('numeric-keyboard'), {
//   ssr: false,
// })

const Clock = dynamic(() => import('react-live-clock'), {
    ssr: false,
})

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
        "name": "วา์ลวน้ำเข้า",
        "id": "1",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topic": mainSystem + "/" + "device/" + "1" + "/" + "control"

    },
    {
        "name": "วา์ลวปุ๋ย",
        "id": "2",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topic": mainSystem + "/" + "device/" + "2" + "/" + "control"

    },
    {
        "name": "ปั้มน้ำ",
        "id": "3",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topic": mainSystem + "/" + "device/" + "3" + "/" + "control"

    },  

]

const sensor = [
    {
        "name": "เซนเซอร์วัดการไหล",
        "id": "4",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topic": mainSystem + "/" + "device/" + "4" + "/" + "control"

    },
    {
        "name": "เซนเซอร์วัดแรงดัน",
        "id": "5",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topic": mainSystem + "/" + "device/" + "5" + "/" + "control"

    }, {
        "name": "ถังปสมปุ๋ย",
        "id": "38",
        "animation": 0,
        "value": false,
        "endAnchor": "bottom",
        "topicControl": "",
        "topicData": "",
        "topicAlive": "",
        "alive": "",
        "flowRate": "",
        "volume": "",
        "waterLevel": "",
        "topicControl": mainSystem + "/" + "device/" + "38" + "/" + "control",
        "topicData": mainSystem + "/" + "device/" + "38" + "/" + "data"
    },

]



zoneValve.map((topic) => {
    topic.topic = mainSystem + "/" + "device/" + topic.id + "/" + "control"
})

export default function Water({ isLock, clickLock, addTimeLock, client }) {
    // const [valveInput1, setValveInput1] = useState(false)
    // const [valveInput2, setValveInput2] = useState(false)
    // const [pump, setPump] = useState(false)

    // const [animationVale1, setAnimationVale1] = useState(0)
    // const [animationVale2, setAnimationVale2] = useState(0)
    // const [animationPump, setAnimationPump] = useState(0)
    const [inputAndPump, setInputAndPump] = useState(initInputAndPump)
    const [mixfertilizerWaterLevel, setMixfertilizerWaterLevel] = useState("0")


    const [valueControl, setValveControl] = useState(zoneValve)

    const [flowrate, setFlowrate] = useState("0")
    const [pressure, setPressure] = useState("0")

    const toppicSubControl = zoneValve.map((topic) => {
        return topic.topic
    })

    toppicSubControl.push(inputAndPump[0].topic)
    toppicSubControl.push(inputAndPump[1].topic)
    toppicSubControl.push(inputAndPump[2].topic)
    toppicSubControl.push(sensor[0].topic)
    toppicSubControl.push(mainSystem + "/" + "device/" + "4" + "/" + "data")
    toppicSubControl.push(mainSystem + "/" + "device/" + "5" + "/" + "data")
    toppicSubControl.push(sensor[2].topicControl)
    toppicSubControl.push(sensor[2].topicData)

    // console.log(toppicSubControl)

    // const [connectStatus, setConnectStatus] = useState()
    // const [client, setClient] = useState(null);

    // useEffect(() => {
    //     setClient(mqtt.connect(host, options));

    // }, [])


    useEffect(() => {
        if (client) {
            // console.log(JSON.stringify(client))
            // client.on('connect', () => {
            //     // setConnectStatus('Connected');
            client.subscribe(toppicSubControl, function (err) {
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
                // console.log(payload)


                const setValue = valueControl.map((item, val) => {
                    // console.log(val)
                    if (item.topic == topic) {
                        item.value = msg == "on" ? true : false
                        item.animation = item.value ? 1 : 0
                        // client.publish(item.topic, item.value ? "on" : "off")
                        // console.log("132")
                    }
                    return item

                })

                setValveControl(setValue)

                if (topic === inputAndPump[0].topic) {
                    // setValveInput1(msg === "on" ? true : false)
                    initInputAndPump[0].animation = msg === "on" ? 1 : 0
                    initInputAndPump[0].value = msg === "on" ? true : false
                    setInputAndPump(initInputAndPump)
               
                    // msg === "off" ? setAnimationVale(0) : setAnimationVale(3)
                }
                if (topic === inputAndPump[1].topic) {
                    // setValveInput2(msg === "on" ? true : false)
                    // msg === "off" ? setAnimationVale(0) : setAnimationVale(3)
                    initInputAndPump[1].animation = msg === "on" ? 1 : 0
                    initInputAndPump[1].value = msg === "on" ? true : false
                    setInputAndPump(initInputAndPump)
                }

                if (topic === inputAndPump[2].topic) {
                    // setPump(msg === "on" ? true : false)
                    initInputAndPump[2].animation = msg === "on" ? 1 : 0
                    initInputAndPump[2].value = msg === "on" ? true : false
                    setInputAndPump(initInputAndPump)
                    // console.log(inputAndPump[2].animation)

                }

                if (topic === mainSystem + "/" + "device/" + "5" + "/" + "data") {
                    console.log(msg)
                    const data = JSON.parse(msg)
                    const flowrate = data.flowRate
                    console.log(flowrate)
                    setFlowrate(flowrate)
                }

                if (topic === mainSystem + "/" + "device/" + "4" + "/" + "data") {
                    console.log(msg)
                    const data = JSON.parse(msg)
                    const pressure = data.pressure
                    console.log(pressure)
                    setPressure(pressure)
                }

                if (topic === sensor[2].topicData) {
        
                    try {
                        const data = JSON.parse(msg)
                        setMixfertilizerWaterLevel( data.waterLevel)
                  

                    } catch (e) {
                        console.log(e)
                    }

                    // setPumpFertilizer(msg === "on" ? true : false)
                }


            });
        }
    }, [client]);

    useEffect(() => {
        if (inputAndPump[0].value) {
            // setAnimationVale1(1)
            initInputAndPump[0].animation = 1
            setInputAndPump(initInputAndPump)

        } else {
            initInputAndPump[0].animation = 0
            setInputAndPump(initInputAndPump)

        }

        if (inputAndPump[1].value) {
            initInputAndPump[1].animation = 1
            setInputAndPump(initInputAndPump)

        } else {
            initInputAndPump[1].animation = 0
            setInputAndPump(initInputAndPump)

        }

        if (inputAndPump[2].value) {

            initInputAndPump[2].animation = 1
            setInputAndPump(initInputAndPump)
        } else {
            initInputAndPump[2].animation = 0
            setInputAndPump(initInputAndPump)
        }

        console.log(initInputAndPump[2].animation)
    }, [inputAndPump,initInputAndPump])


    const clickValveInput1 = () => {
        // setValveInput(!valveInput)
        // valveInput ? setAnimationVale(0) : setAnimationVale(3)
        if (isLock) {
            clickLock()
        }
        else {
            client.publish(inputAndPump[0].topic, inputAndPump[0].value ? "off" : "on")
            addTimeLock()
        }
    }

    const clickValveInput2 = () => {
        // setValveInput(!valveInput)
        // valveInput ? setAnimationVale(0) : setAnimationVale(3)
        if (isLock) {
            clickLock()
        }
        else {
            client.publish(inputAndPump[1].topic, inputAndPump[1].value ? "off" : "on")
            addTimeLock()
        }
    }

    const clickPump = () => {
        // setPump(!pump)
        // pump ? setAnimationPump(0) : setAnimationPump(3)
        if (isLock) {
            clickLock()
        }
        else {
            client.publish(inputAndPump[2].topic, inputAndPump[2].value ? "off" : "on")
            addTimeLock()
        }
    }


    const clickValve = (id) => {
        if (isLock) {
            clickLock()
        }
        else {
            // const result = valueControl.find(x => x.id == id);
            const setValue = valueControl.map((item, val) => {
                // console.log(val)
                if (item.id == id) {
                    item.value = !item.value
                    item.animation = item.value ? 1 : 0
                    client.publish(item.topic, item.value ? "on" : "off")
                    // console.log("132")
                }
                return item
            })
            addTimeLock()
        }

        // setValveControl(setValue)
    }

    return (
        <Grid.Container css={{ mt: -25, height: 750 }}>
            {/* <div style={{ height: '100%' }}> */}
            {/* <ReactFlow> */}
            {/* <Background /> */}
            {/* <Controls /> */}

            {/* <Grid xs={1.5}>
          
            </Grid> */}
            <Grid xs={4} >
                <Grid.Container css={{}} >
                    <Grid.Container alignItems="center" css={{ zIndex: 1, mt: 30, mr: 0, d: 'flex', flexDirection: 'column' }}>
                        <Grid css={{ d: 'flex', flexDirection: 'row' }}>
                            <Grid xs={6} css={{ d: 'flex', flexDirection: 'column' }}>
                                <Grid.Container alignItems="center" css={{ d: 'flex', flexDirection: 'column' }}>
                                    <Text size={18} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>ถังน้ำ</Text>
                                    <Card id="waterTank" isPressable css={{ width: 200, height: 250, backgroundColor: "#31406D" }} >
                                        {/* <Image id="" alt="" src='/images/water-tank.png' width={120} height={120} /> */}

                                        <Grid.Container css={{}} alignItems="center" justify="space-around">
                                            <Image alt="" priority src='/images/water-tank.png' width={250} height={250} />
                                        </Grid.Container>

                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Text color="" css={{ fontFamily: 'NotoSansThai' }}>100%</Text>

                                            {/* <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={valveInput} /> */}
                                        </Grid.Container>
                                    </Card>
                                </Grid.Container>

                                <Spacer y={2} />
                                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                    <Card id="valve1" onPress={() => clickValveInput1()} isPressable css={{ width: 110, height: 110, backgroundColor: inputAndPump[0].value ? "#88EF4D" : "#31406D" }} >
                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Grid.Container alignItems="center" justify="space-around">
                                                <Text color={inputAndPump[0].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{inputAndPump[0].value ? "เปิด" : "ปิด"}</Text>
                                                <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={inputAndPump[0].value} />
                                            </Grid.Container>
                                            <Grid.Container css={{ mt: 10 }} alignItems="center" justify="space-around">
                                                <Image alt="" src='/images/valve.png' width={40} height={40} />
                                            </Grid.Container>
                                            <Text size={15} css={{ mt: 5, fontFamily: 'NotoSansThai' }}>วาล์วน้ำเข้า</Text>
                                        </Grid.Container>
                                    </Card>

                                </Grid.Container>
                            </Grid>
                            <Spacer x={3} />
                            <Grid xs={6} css={{ d: 'flex', flexDirection: 'column' }}>
                                <Grid.Container alignItems="center" css={{ d: 'flex', flexDirection: 'column' }}>
                                    <Text size={18} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>ถังปุ๋ย</Text>
                                    <Card id="fertilizerTank" isPressable css={{ width: 200, height: 250, backgroundColor: "#31406D" }} >
                                        {/* <Image id="" alt="" src='/images/water-tank.png' width={120} height={120} /> */}

                                        <Grid.Container css={{}} alignItems="center" justify="space-around">
                                            <Image alt="" priority src='/images/fertilizer-tank.png' width={250} height={250} />
                                        </Grid.Container>

                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Text color="" css={{ fontFamily: 'NotoSansThai' }}>{mixfertilizerWaterLevel}%</Text>

                                            {/* <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={valveInput} /> */}
                                        </Grid.Container>
                                    </Card>
                                </Grid.Container>
                                <Spacer y={2} />
                                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                    <Card id="valve2" onPress={() => clickValveInput2()} isPressable css={{ width: 110, height: 110, backgroundColor: inputAndPump[1].value ? "#88EF4D" : "#31406D" }} >
                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Grid.Container alignItems="center" justify="space-around">
                                                <Text color={inputAndPump[1].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{inputAndPump[1].value ? "เปิด" : "ปิด"}</Text>
                                                <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={inputAndPump[1].value} />
                                            </Grid.Container>
                                            <Grid.Container css={{ mt: 10 }} alignItems="center" justify="space-around">
                                                <Image alt="" src='/images/valve.png' width={40} height={40} />
                                            </Grid.Container>
                                            <Text size={15} css={{ zIndex: 1, mt: 5, fontFamily: 'NotoSansThai' }}>วาล์วปุ๋ย</Text>
                                        </Grid.Container>

                                    </Card>

                                </Grid.Container>

                            </Grid>
                        </Grid>

                    </Grid.Container>


                    <Grid.Container css={{ mt: 30 }}>
                        <Grid xs={4} css={{}} >
                            <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                <Card id="pressure" isPressable css={{ width: 80, height: 80, backgroundColor: inputAndPump[2].value ? "#88EF4D" : "#31406D" }} >
                                    <Grid.Container alignItems="center" justify="space-around">

                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Text color={inputAndPump[2].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{pressure}</Text>
                                            <Text size={12} color={inputAndPump[2].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>bar</Text>
                                            {/* <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={valveInput} /> */}
                                        </Grid.Container>
                                        <Grid.Container css={{ mt: 10 }} alignItems="center" justify="space-around">
                                            <Image alt="" src='/images/pressure-gauge.png' width={40} height={40} />
                                        </Grid.Container>
                                    </Grid.Container>
                                </Card>
                                <Text size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>แรงดันน้ำ</Text>
                            </Grid.Container>
                        </Grid>

                        <Grid xs={4}>
                            <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                <Card id="pump" onPress={() => clickPump()} isPressable css={{ width: 110, height: 110, backgroundColor: inputAndPump[2].value ? "#88EF4D" : "#31406D" }} >
                                    <Grid.Container alignItems="center" justify="space-around">

                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Text color={inputAndPump[2].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{inputAndPump[2].value ? "เปิด" : "ปิด"}</Text>
                                            <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={inputAndPump[2].value} />
                                        </Grid.Container>
                                        <Grid.Container css={{ mt: 2 }} alignItems="center" justify="space-around">
                                            <Image alt="" src='/images/water-pump.png' width={80} height={80} />
                                        </Grid.Container>
                                    </Grid.Container>
                                </Card>
                                <Text size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>ปั้มน้ำ</Text>
                            </Grid.Container>
                        </Grid>


                        <Grid xs={4}>
                            <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                <Card id="flowMeter" isPressable css={{ width: 80, height: 80, backgroundColor: inputAndPump[2].value ? "#88EF4D" : "#31406D" }} >
                                    <Grid.Container alignItems="center" justify="space-around">

                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Text color={inputAndPump[2].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{flowrate}</Text>
                                            <Text size={12} color={inputAndPump[2].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>L/min</Text>
                                            {/* <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={valveInput} /> */}
                                        </Grid.Container>
                                        <Grid.Container css={{ mt: 10 }} alignItems="center" justify="space-around">
                                            <Image alt="" src='/images/water-meter.png' width={40} height={40} />
                                        </Grid.Container>
                                    </Grid.Container>
                                </Card>
                                <Text size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>อัตราการไหล</Text>
                            </Grid.Container>
                        </Grid>
                    </Grid.Container>

                </Grid.Container>
            </Grid>

            <Xarrow
                start="waterTank"
                end="valve1"
                startAnchor={"bottom"}
                endAnchor={"top"}
                path="smooth"
                showHead={false}
                showTail={false}
                curveness={0.8}
                dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[0].animation }}
                // color={"white"}
                zIndex={0}
            />

            <Xarrow
                start="fertilizerTank"
                end="valve2"
                startAnchor={"bottom"}
                endAnchor={"top"}
                path="smooth"
                showHead={false}
                showTail={false}
                curveness={0.8}
                dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[1].animation }}
                // color={"white"}
                zIndex={0}
            />

            <Xarrow
                start="valve1"
                end="pump"
                path="smooth"
                startAnchor={"bottom"}
                endAnchor={{ position: "top", offset: { x: -10 } }}
                showHead={false}
                showTail={false}
                curveness={0.8}
                dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[0].animation }}
                // color={"white"}
                zIndex={0}

            />

            <Xarrow
                start="valve2"
                end="pump"
                path="smooth"
                startAnchor={"bottom"}
                endAnchor={{ position: "top", offset: { x: 10 } }}
                showHead={false}
                showTail={false}
                curveness={0.8}
                dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[1].animation }}
                // color={"white"}
                zIndex={1}

            />

            <Xarrow
                start="pump"
                end="flowMeter"
                path="smooth"
                showHead={false}
                showTail={false}
                curveness={0.8}
                dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[2].animation }}
                // color={"white"}
                zIndex={1}
            />

            <Xarrow
                start="pump"
                end="pressure"
                path="smooth"
                showHead={false}
                showTail={false}
                curveness={0.8}
                dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[2].animation }}
                // color={"white"}
                zIndex={1}
            />

            <Grid xs={8}>
                <Grid.Container css={{ mt: 30 }}>

                    {valueControl.map((item) => (
                        <>

                            <Grid xs={2} css={{ mt: 35, zIndex: 1 }}>
                                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                    <Card id={item.id} onPress={() => clickValve(item.id)} isPressable css={{ width: 110, height: 110, backgroundColor: item.value ? "#88EF4D" : "#31406D" }} >
                                        <Grid.Container alignItems="center" justify="space-around">

                                            <Grid.Container alignItems="center" justify="space-around">
                                                <Text color={item.value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{item.value ? "เปิด" : "ปิด"}</Text>
                                                <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={item.value} />
                                            </Grid.Container>
                                            <Grid.Container css={{ mt: 20 }} alignItems="center" justify="space-around">
                                                <Image alt="" src='/images/valve.png' width={50} height={50} />
                                            </Grid.Container>
                                        </Grid.Container>
                                    </Card>
                                    <Text size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{item.name}</Text>
                                </Grid.Container>
                            </Grid>

                            {item.value ?
                                <Xarrow
                                    start="flowMeter"
                                    end={item.id}
                                    startAnchor={"right"}
                                    endAnchor={item.endAnchor}
                                    path="smooth"
                                    showHead={false}
                                    showTail={false}
                                    curveness={0.8}
                                    dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[2].animation }}
                                    //  color={"white"}
                                    zIndex={0}
                                // showXarrow={item.value}
                                />
                                : null}
                        </>
                    ))}

                </Grid.Container>

            </Grid>
            {/* </ReactFlow> */}
            {/* </div> */}
        </Grid.Container>
    )
}
