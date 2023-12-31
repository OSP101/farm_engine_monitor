import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Card, Modal, Grid, Button, Text, Container, Spacer, Switch, } from "@nextui-org/react";
import camera from "../camera"
// require("v8-compile-cache");
import mqtt from 'mqtt'

import { BiCctv } from 'react-icons/bi';
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



camera.map((topic) => {
    topic.topicControl = mainSystem + "/" + "device/" + topic.id + "/" + "control"
    topic.topicData = mainSystem + "/" + "device/" + topic.id + "/" + "data"
    topic.topicAlive = mainSystem + "/" + "device/" + topic.id + "/" + "alive"
})



export default function Camera({ isLock, clickLock, addTimeLock, client }) {



    const [cameraControl, setCameraControl] = useState(camera)
    const [cameraLink, setCameraLink] = useState(camera["0"].camera)
    const [selectedCamera, setSelectedCamera] = useState(camera["0"].id)




    const toppicSub = []
    cameraControl.map((topic) => {
        toppicSub.push(topic.topicControl)
        toppicSub.push(topic.topicData)
        toppicSub.push(topic.topicAlive)
    })




    useEffect(() => {
        if (client) {
            // console.log(JSON.stringify(client))
            // client.on('connect', () => {
            //     // setConnectStatus('Connected');
            client.subscribe(toppicSub, function (err) {
                if (!err) {
           
                } else {
                    console.log("error")
                }

            })


            client.on('message', (topic, message) => {
                const payload = { topic, message: message.toString() };
                const msg = message.toString()



            });
        }
    }, [client]);



    const clickCamera = (id, value) => {
        if (isLock) {
            clickLock()
        }
        else {

            const setValue = cameraControl.map((item, val) => {

                if (item.id == id) {
                    setCameraLink(item.camera)
                    setSelectedCamera(item.id)

                }
                return item
            })
            addTimeLock()
        }


    }









    return (
        <Grid.Container  css={{ mt: -25, height: 750 }}>
            {/* <div style={{ height: '100%' }}> */}
            {/* <ReactFlow> */}
            {/* <Background /> */}
            {/* <Controls /> */}

            {/* <Grid xs={1.5}>
          
            </Grid> */}
            <Grid justify="center" xs={12} css={{ mt: 50 }}>
                <Card variant="flat" css={{ mt: 0, width: 900, height: 506, backgroundColor: "#08123A", borderRadius: 20 }} >

                    <ReactHlsPlayer
                        src={cameraLink}
                        autoPlay={true}
                        controls={false}
                        muted
                        width="100%"
                        height="auto"
                        hlsConfig={{

                        }}
                    />
                </Card>
            </Grid>

            <Grid xs={12} css={{ mt: 0 }}>
                <Grid.Container >


                    {cameraControl.map((item) => (
                        <>
                            <Grid  justify="center" xs={2} css={{ mt: 0, zIndex: 1 }}>
                                <Card variant="flat" isPressable onPress={() => clickCamera(item.id)}
                                    css={{
                                        mt: 60,
                                        width: 150,
                                        height: 150,
                                        backgroundColor: "#08123A",
                                        borderRadius: 40,
                                        border: selectedCamera === item.id? "3px solid #73AD21": null
                                    }} >
                                    <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                                        <Text size={20} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{item.name}</Text>
                                        <IconContext.Provider value={{ color: "white" }}>
                                            <BiCctv style={{ marginTop: 10 }} size={50} />
                                        </IconContext.Provider>
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
