import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Card, Modal, Grid, Button, Text, Container, Spacer, Switch, } from "@nextui-org/react";
import fertilizerTank from "../fertilizerTank";
// require("v8-compile-cache");
import mqtt from 'mqtt'
import { GoPrimitiveDot } from 'react-icons/go';
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
        "name": "ปั้มปุ๋ย",
        "id": "30",
        "animation": 0,
        "value": false,
        "endAnchor": "left",
        "topicControl": mainSystem + "/" + "device/" + "30" + "/" + "control",
        "topicData": mainSystem + "/" + "device/" + "30" + "/" + "data"
    },
    {
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


fertilizerTank.map((topic) => {
    topic.topicControl = mainSystem + "/" + "device/" + topic.id + "/" + "control"
    topic.topicData = mainSystem + "/" + "device/" + topic.id + "/" + "data"
    topic.topicAlive = mainSystem + "/" + "device/" + topic.id + "/" + "alive"
})

export default function Fertilizer({ isLock, clickLock, addTimeLock, client }) {

 

    const [fertilizerControl, setFertilizerControl] = useState(fertilizerTank)
    const [inputAndPump, setInputAndPump] = useState(initInputAndPump)
    const [mixfertilizerWaterLevel, setMixfertilizerWaterLevel] = useState("0")





    const toppicSub = []
    fertilizerTank.map((topic) => {
        toppicSub.push(topic.topicControl)
        toppicSub.push(topic.topicData)
        toppicSub.push(topic.topicAlive)
    })

    toppicSub.push(inputAndPump[0].topicControl)
    toppicSub.push(inputAndPump[0].topicData)
    toppicSub.push(inputAndPump[1].topicControl)
    toppicSub.push(inputAndPump[1].topicData)


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


                if (topic === inputAndPump[0].topicControl) {
                    initInputAndPump[0].value = msg === "on" ? true : false
                    initInputAndPump[0].animation = msg === "on" ? 1 : 0
                    setInputAndPump(initInputAndPump)
                    // setPumpFertilizer(msg === "on" ? true : false)
                }
                 
                 if (topic === inputAndPump[1].topicData) {
        
                    try {
                        const data = JSON.parse(msg)
                        setMixfertilizerWaterLevel( data.waterLevel)
                  

                    } catch (e) {
                        console.log(e)
                    }

                    // setPumpFertilizer(msg === "on" ? true : false)
                }

                const setValue = fertilizerControl.map((item, val) => {
                    // console.log(val)
                    if (item.topicControl == topic) {
                        item.value = msg === "on" ? true : false
                        item.animation = item.value ? 1 : 0
                        // client.publish(item.topic, item.value ? "on" : "off")
                        // console.log("132")
                    }

                    if (item.topicAlive === topic) {
                        item.alive = msg

                    }

                    if (item.topicData === topic) {
                        try {
                            const data = JSON.parse(msg)
                            item.flowRate = data.flowRate
                            item.volume = data.volume
                            item.waterLevel = data.waterLevel
                        } catch (e) {
                            console.log(e)
                        }

                    }

                    return item

                })
                setFertilizerControl(setValue)

            
            });
        }
    }, [client]);



    const clickFertilizer = (id) => {
        if (isLock) {
            clickLock()
        }
        else {
            // const result = valueControl.find(x => x.id == id);
            const setValue = fertilizerControl.map((item, val) => {
                // console.log(val)
                if (item.id == id) {
                    item.value = !item.value
                    item.animation = item.value ? 1 : 0
                    client.publish(item.topicControl, item.value ? "on" : "off")
                    // console.log("132")
                }
                return item
            })
            addTimeLock()
        }


    }


    const clickPumpFertilizer = () => {
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

    useEffect(() => {

        if (inputAndPump[0].value) {
            initInputAndPump[0].animation = 1
            setInputAndPump(initInputAndPump)
        } else {

            initInputAndPump[0].animation = 0
            setInputAndPump(initInputAndPump)
        }


    }, [inputAndPump])



    return (
        <Grid.Container css={{ mt: -25, height: 750 }}>
            {/* <div style={{ height: '100%' }}> */}
            {/* <ReactFlow> */}
            {/* <Background /> */}
            {/* <Controls /> */}

            {/* <Grid xs={1.5}>
          
            </Grid> */}

            <Grid xs={6}>
                <Grid.Container css={{ mt: 30 }}>

                    {fertilizerControl.map((item) => (
                        <>
 
                            <Grid xs={4} css={{ mt: 35, zIndex: 1 }}>
                                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                    <Card id={item.id} onPress={() => clickFertilizer(item.id)} isPressable css={{ width: 210, height: 150, backgroundColor: item.value ? "#88EF4D" : "#31406D" }} >
                                        <Grid.Container alignItems="center" justify="space-around">
                                            <Grid.Container alignItems="center" justify="space-between" css={{ ml: 10, mr: 10 }}>
                                                <Text color={item.value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{item.value ? "เปิด" : "ปิด"}</Text>
                                                <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={item.value} />
                                            </Grid.Container>

                                            <Grid css={{ d: "flex", flexDirection: "row" }}>
                                                <Grid.Container justify="center" css={{ mt: 0 }} >
                                                    <Image alt="" src='/images/compost.png' width={150} height={150} />
                                                    <IconContext.Provider value={{ color: item.alive === "online" ? "green" : "red" }}>
                                                        <GoPrimitiveDot style={{}} size={20} />
                                                    </IconContext.Provider>
                                                </Grid.Container>
                                                <Grid.Container justify="center" alignItems="start" css={{ ml: 10, mr: 10, d: "flex", flexDirection: "column" }}>
                                                    <Text color={item.value ? "#101C42" : ""} size={19} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>{item.flowRate} L/min </Text>
                                                    <Text color={item.value ? "#101C42" : ""} size={19} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>{item.volume} L </Text>
                                                </Grid.Container>
                                            </Grid>
                                        </Grid.Container>

                                    </Card>
                                    <Text size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{item.name}</Text>
                                </Grid.Container>
                            </Grid>

                            {item.value ?
                                <Xarrow
                                    start={item.id}
                                    end="pumpFertilizer"
                                    startAnchor={"right"}
                                    endAnchor={item.endAnchor}
                                    path="smooth"
                                    showHead={false}
                                    showTail={false}
                                    curveness={0.8}
                                    dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[0].animation }}
                                    //  color={"white"}
                                    zIndex={0}
                                // showXarrow={item.value}
                                />
                                : null}
                        </>
                    ))}

                </Grid.Container>

            </Grid>

            <Grid xs={6} justify="center" alignItems="center" css={{ d: 'flex', flexDirection: 'row', mt: 30 }}>

                <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                    <Card id="pumpFertilizer" onPress={() => clickPumpFertilizer()} isPressable css={{ mt: 30, width: 110, height: 110, backgroundColor: inputAndPump[0].value ? "#88EF4D" : "#31406D" }} >
                        <Grid.Container alignItems="center" justify="space-around">

                            <Grid.Container alignItems="center" justify="space-around">
                                <Text color={inputAndPump[0].value ? "#101C42" : ""} css={{ fontFamily: 'NotoSansThai' }}>{inputAndPump[0].value ? "เปิด" : "ปิด"}</Text>
                                <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={inputAndPump[0].value} />
                            </Grid.Container>
                            <Grid.Container css={{ mt: 2 }} alignItems="center" justify="space-around">
                                <Image alt="" src='/images/water-pump.png' width={80} height={80} />
                            </Grid.Container>
                        </Grid.Container>
                    </Card>
                    <Text size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>ปั้มปุ๋ย</Text>
                </Grid.Container>

                <Grid.Container alignItems="center" css={{ d: 'flex', flexDirection: 'column' }}>
                    <Text size={18} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>ถังผสมปุ๋ย</Text>
                    <Card id="fertilizerTank2" isPressable css={{ width: 250, height: 300, backgroundColor: "#31406D" }} >
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

                <Xarrow
                    start="pumpFertilizer"
                    end="fertilizerTank2"
                    startAnchor={"right"}
                    endAnchor={"left"}
                    path="smooth"
                    showHead={false}
                    showTail={false}
                    curveness={0.8}
                    dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: inputAndPump[0].animation }}
                    // color={"white"}
                    zIndex={0}
                />

            </Grid>
            {/* </ReactFlow> */}
            {/* </div> */}
        </Grid.Container>
    )
}
