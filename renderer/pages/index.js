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
import { IoWater } from 'react-icons/io5';
import { GiFertilizerBag, GiGreenhouse } from 'react-icons/gi';
import { FaLeaf } from 'react-icons/fa';
import { BiCctv } from 'react-icons/bi';
import { GoPrimitiveDot } from 'react-icons/go';
import { IconContext } from "react-icons";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import moment from 'moment'
import Water from './Water'
import Fertilizer from "./Fertilizer";
import Greenhouse from "./Greenhouse"
import Plant from "./Plant";
import Camera from "./Camera";
// const NumericInput = dynamic(() => import('numeric-keyboard'), {
//   ssr: false,
// })



const Clock = dynamic(() => import('react-live-clock'), {
  ssr: false,
})

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



const passwordAdmin = "123456"

export default function home() {

  const [iconName, setIconName] = useState("")

  const [clockValue, setClockValue] = useState()
  const [textTitle, setTextTitle] = useState("สวัสดี")
  const [weather, setWeather] = useState("")

  const [passwordModal, setPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordShow, setPasswordShow] = useState("")
  const [isPressEnter, setIsPressEnter] = useState(false)
  const [textErrorPassword, setTextErrorPassword] = useState("")
  const [isLock, setIsLock] = useState(true)

  const [selectContent, setSelectContent] = useState("greenhouse")



  const [timeCounterLock, setTimeCounterLock] = useState(moment())

  const [iconWeahter, setIconWeahter] = useState("http://openweathermap.org/img/wn/03n@2x.png")










  const [connectStatus, setConnectStatus] = useState()
  const [client, setClient] = useState(null);

  useEffect(() => {
    setClient(mqtt.connect(host, options));

  }, [])

  useEffect(() => {
    if (client) {
      // console.log(JSON.stringify(client))
      client.on('connect', () => {
        setConnectStatus('Connected');
        // client.subscribe(toppicSubControl, function (err) {
        //   if (!err) {
        //     // client.publish('presence', 'Hello mqtt')
        //   } else {
        //     console.log("error")
        //   }

        // })
      });

      client.on('error', (err) => {
        console.error('Connection error: ', err);
        client.end();
      });
      client.on('reconnect', () => {
        setConnectStatus('Reconnecting');
      });

      client.on('message', (topic, message) => {
        const payload = { topic, message: message.toString() };
        const msg = message.toString()


      });
    }
  }, [client]);

  function maskPassword(str) {
    return str.split("").map((e, i) => i ? "*" : "*").join("");
  }

  const onChange = (input) => {

    setPassword(input)
    setPasswordShow(maskPassword(input))
    // console.log("Input changed", password);
  }

  const onKeyPress = (button) => {
    if (button === "{enter}") {
      if (password === passwordAdmin) {
        setPasswordModal(false)
        setPassword("")
        setIsLock(!isLock)
        setTextErrorPassword("")
        addTimeLock()


      } else {
        setTextErrorPassword("รหัสผ่านไม่ถูกต้อง")
        // setPassword("")
        // setPasswordShow("")
      }

    } else {
      setTextErrorPassword("")
    }
    // console.log("Button pressed", button);
  }

  const clickLock = () => {
    // setIsLock(!isLock)
    if (isLock) {
      setPasswordModal(true)
    } else {
      setIsLock(true)
    }
  }

  const closeModealPassword = () => {
    setPassword("")
    setPasswordShow("")
    setTextErrorPassword("")
    setPasswordModal(false)
  }

  const clock = () => {
    var today = new Date()
    let hour = today.getHours()
    // console.log(today.getSeconds())
    // console.log(today.getMinutes() % 10 == 0 && today.getSeconds() ==0)
    if (today.getMinutes() % 10 == 0 && today.getSeconds() == 0) {
      fetchWeather()
    }

    if (hour >= 6 && hour <= 9) {
      setTextTitle("สวัสดีตอนเช้า")
    }

    if (hour >= 10 && hour <= 11) {
      setTextTitle("สวัสดีตอนสาย")
    }

    if (hour == 12) {
      setTextTitle("สวัสดีตอนเที่ยง")
    }

    if (hour >= 13 && hour <= 15) {
      setTextTitle("สวัสดีตอนบ่าย")
    }

    if (hour >= 16 && hour <= 18) {
      setTextTitle("สวัสดีตอนค่ำ")
    }

    if (hour >= 19 && hour <= 23 || hour >= 0 && hour <= 5) {
      setTextTitle("ราตรีสวัสดิ์")
    }


    // console.log(duration)

  }

  const addTimeLock = () => {
    let timeLock = moment(new Date()).add(10, 'minute')
    setTimeCounterLock(timeLock)
  }

  useEffect(() => {
    clock()
    fetchWeather()

  }, [])

  useEffect(() => {
    const interval = setInterval(() => {

      var now = moment()
      var duration = timeCounterLock.diff(now, "minute");
      // console.log(duration)
      if (duration <= 0) {
        setIsLock(true)
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [timeCounterLock]);

  async function fetchWeather() {
    const apiKey = "c47b4ef40e28071d7183e29e5822c006"
    const lat = "16.467145724058668"
    const long = "102.81201633929524"
    try {



      let response = await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&appid=" + apiKey, {
        method: 'GET',
        // body: JSON.stringify({ 'petLink': cardData.petLink }),
        // headers: { "Content-Type": "application/json", }
      })

      const data = await response.json()
      // console.log(JSON.stringify(data))

      // console.log(iconWeahter)

      // console.log(JSON.stringify(data.data))
      // if (data.cod == "200") {
      let icon = data.weather[0].icon
      let linkIcon = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
      // console.log(linkIcon)
      setIconName(icon)
      setIconWeahter(linkIcon)
      setWeather(data)
    } catch (e) {
      console.log(e)
    }
    //   setIconWeahter(data)
    // }
    // } else {

    // }
  }




  return (
    <>
      <Head>
        <title>หน้าแรก</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main  >
        <Grid.Container justify="center" alignItems="center" css={{ mt: 10, d: 'flex', flexDirection: "column" }}>
          <Text color="white" size={35} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>
            KKU Smart Farming
          </Text>

        </Grid.Container>
        <Grid.Container justify="flex-end" alignItems="center" css={{ mt: -30, pr: 25, d: 'flex', flexDirection: "row" }}>
          <IconContext.Provider value={{ color: "white" }}>
            <HiComputerDesktop size={15} />
          </IconContext.Provider>
          <Text color="white" size={15} css={{ ml: 3, mt: 3, fontFamily: 'NotoSansThai' }}>
            {connectStatus}
          </Text>

        </Grid.Container>
        <Grid.Container justify="center" css={{ mt: 2, pl: 20, pr: 20 }}>
          <Card css={{ backgroundColor: "#000B33", display: "flex", flexDirection: "row" }}>

            <Grid xs={5}>
              <Grid.Container justify="flex-start" alignItems="center" css={{ ml: 25, mt: 0 }}>
                <Text color="white" size={26} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>
                  {textTitle}
                </Text>
                <Text b color="#9E9E9E" size={26} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>
                  <Clock
                    format={'DD/MM/YYYY'}
                    style={{ marginLeft: 10, fontSize: '16px' }}
                    ticking={true}
                    timezone="Asia/Bangkok"
                  />
                </Text>

                <Grid.Container justify="flex-start" alignItems="center" css={{ mt: -25, pb: 10 }}>
                  <Image alt="" src='/images/placeholder.png' width={25} height={25} />
                  <Text color="white" size={18} css={{ ml: 5, fontFamily: 'NotoSansThai' }}>
                    ศูนย์การเรียนรู้เกษตรแก้จน มหาวิทยาลัยขอนแก่น
                  </Text>

                </Grid.Container>
              </Grid.Container>
            </Grid>



            <Grid xs={2} justify="center">
              <Card id="lock" onPress={() => clickLock()} isPressable css={{ width: 100, height: 100, backgroundColor: isLock ? "#FF5D5D" : "#88EF4D" }} >
                <Grid.Container alignItems="center" justify="space-around">

                  <Grid.Container alignItems="center" justify="space-around" css={{ mt: 2 }}>
                    <Text b size={12} color="#101C42" css={{ fontFamily: 'NotoSansThai' }}>{isLock ? "Lock" : "Unlock"}</Text>
                    <Switch size="xs" css={{ $$switchColor: "white", $$switchColorHover: "#D2D2D2" }} checked={isLock} />
                  </Grid.Container>
                  <Grid.Container css={{ mt: 5 }} alignItems="center" justify="space-around">
                    {/* <Image alt="" src='/images/valve.png' width={50} height={50} /> */}
                    {isLock ?
                      <IconContext.Provider value={{ color: "#101C42" }}>
                        <HiLockClosed size={65} />
                      </IconContext.Provider>
                      :
                      <IconContext.Provider value={{ color: "#101C42" }}>
                        <HiLockOpen size={65} />
                      </IconContext.Provider>
                    }

                  </Grid.Container>
                </Grid.Container>
              </Card>
            </Grid>


            <Grid xs={5} justify="flex-end">
              {iconName === "01d" ?
                <Grid css={{ mt: 0 }}>
                  <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                    <Image alt="" src="/images/sun.png" width={70} height={70} />
                    <Text color="white" size={18} css={{ mt: -10, fontFamily: 'NotoSansThai' }}>
                      {weather ? weather.weather[0].main : null}
                    </Text>
                  </Grid.Container>
                </Grid>
                :
                iconName === "01n" ?
                  <Grid css={{ mt: 10 }}>
                    <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                      <Image alt="" src="/images/moon.png" width={52} height={52} />
                      <Text color="white" size={18} css={{ mt: -3, fontFamily: 'NotoSansThai' }}>
                        {weather ? weather.weather[0].main : null}
                      </Text>
                    </Grid.Container>
                  </Grid>
                  :
                  <Grid css={{ mt: -25 }}>
                    <Grid.Container justify="center" alignItems="center" css={{ d: "flex", flexDirection: "column" }}>
                      <Image alt="" src={iconWeahter} width={110} height={110} />
                      <Text color="white" size={18} css={{ mt: -25, fontFamily: 'NotoSansThai' }}>
                        {weather ? weather.weather[0].main : null}
                      </Text>
                    </Grid.Container>
                  </Grid>
              }
              <Grid>
                <Grid.Container css={{ mt: 10, mr: 20 }}>
                  <Clock
                    format={'HH:mm:ss'}
                    style={{ marginLeft: 0, fontSize: '15px' }}
                    ticking={true}
                    onChange={() => clock()}
                  />
                  <Text color="white" size={15} css={{ ml: 10, fontFamily: 'NotoSansThai' }}>
                    น.
                  </Text>
                </Grid.Container>
                <Grid.Container css={{ mr: 20, d: 'flex', flexDirection: 'row' }}>
                  <Text color="white" size={45} css={{ mt: -9, fontFamily: 'NotoSansThai' }}>
                    {weather ? (weather.main.temp - 273.15).toFixed(1) : null}
                  </Text>
                  <Text color="white" size={12} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>
                    °C
                  </Text>
                </Grid.Container>
              </Grid>

              {/* <Grid>
                <Grid.Container justify="flex-end" css={{ mr: 25, }}>
                  <Text color="#747474" size={50} css={{ mt: 0, fontFamily: 'NotoSansThai' }}>
                    25
                  </Text>
                </Grid.Container>
              </Grid>  */}
            </Grid>
          </Card>


          {/* <Card> */}
          {selectContent === "water" ?
            <Water isLock={isLock} clickLock={clickLock} addTimeLock={addTimeLock} client={client} />
            : null}

          {selectContent === "fertilizer" ?
            <Fertilizer isLock={isLock} clickLock={clickLock} addTimeLock={addTimeLock} client={client} />
            : null}

          {selectContent === "greenhouse" ?
            <Greenhouse isLock={isLock} clickLock={clickLock} addTimeLock={addTimeLock} client={client} />
            : null}

          {selectContent === "plant" ?
            <Plant isLock={isLock} clickLock={clickLock} addTimeLock={addTimeLock} client={client} />
            : null}

          {selectContent === "camera" ?
            <Camera isLock={isLock} clickLock={clickLock} addTimeLock={addTimeLock} client={client} />
            : null}



          {/* </Card> */}
        </Grid.Container>
        <Grid.Container justify="center" css={{ mt: 45 }}>
          <Card variant="flat" css={{ width: 510, height: 110, borderRadius: 50, backgroundColor: "#033323" }}>
            <Grid.Container>
              <Card
                onPress={() => setSelectContent("water")}
                isPressable variant="flat"
                css={{
                  ml: 18,
                  mt: 14,
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  backgroundColor: selectContent === "water" ? "#4BA064" : "#033323"
                }}>
                <Grid.Container justify="center" >
                  <IconContext.Provider value={{ color: selectContent === "water" ? "white" : "#68877D" }}>
                    <IoWater style={{ marginTop: 5 }} size={65} />
                  </IconContext.Provider>
                </Grid.Container>
              </Card>

              <Card
                onPress={() => setSelectContent("fertilizer")}
                isPressable
                variant="flat"
                css={{
                  ml: 18,
                  mt: 15,
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  backgroundColor: selectContent === "fertilizer" ? "#4BA064" : "#033323"
                }}>
                <Grid.Container justify="center" >
                  <IconContext.Provider value={{ color: selectContent === "fertilizer" ? "white" : "#68877D" }}>
                    <GiFertilizerBag style={{ marginTop: 10 }} size={55} />
                  </IconContext.Provider>
                </Grid.Container>
              </Card>

              <Card
                onPress={() => setSelectContent("greenhouse")}
                isPressable
                variant="flat"
                css={{
                  ml: 18,
                  mt: 14,
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  backgroundColor: selectContent === "greenhouse" ? "#4BA064" : "#033323"
                }}>
                <Grid.Container justify="center" >
                  <IconContext.Provider
                    value={{ color: selectContent === "greenhouse" ? "white" : "#68877D" }}>
                    <GiGreenhouse style={{ marginTop: 10 }} size={55} />
                  </IconContext.Provider>
                </Grid.Container>
              </Card>

              <Card
                onPress={() => setSelectContent("plant")}
                isPressable
                variant="flat"
                css={{
                  ml: 18,
                  mt: 14,
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  backgroundColor: selectContent === "plant" ? "#4BA064" : "#033323"
                }}>
                <Grid.Container justify="center" >
                  <IconContext.Provider value={{ color: selectContent === "plant" ? "white" : "#68877D" }}>
                    <FaLeaf style={{ marginTop: 10 }} size={50} />
                  </IconContext.Provider>
                </Grid.Container>
              </Card>

              <Card
                onPress={() => setSelectContent("camera")}
                isPressable
                variant="flat"
                css={{
                  ml: 18,
                  mt: 14,
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  backgroundColor: selectContent === "camera" ? "#4BA064" : "#033323"
                }}>
                <Grid.Container justify="center" >
                  <IconContext.Provider value={{ color: selectContent === "camera" ? "white" : "#68877D" }}>
                    <BiCctv style={{ marginTop: 10 }} size={50} />
                  </IconContext.Provider>
                </Grid.Container>
              </Card>


            </Grid.Container>
            {/* <Text>test</Text> */}
          </Card>
        </Grid.Container>

        <Modal
          closeButton
          preventClose
          aria-labelledby="รหัสผ่าน"
          open={passwordModal}
          onClose={() => closeModealPassword()}
          width="600px"
          css={{ height: 500 }}
        >

          <Modal.Header>
            <Text css={{ fontFamily: 'NotoSansThai' }} color="black" size={18}>
              กรุุณากรอกรหัสผ่าน

            </Text>
          </Modal.Header>
          {/* <Modal.Body> */}
          <Grid.Container justify="center" alignItems="center" css={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
            {/* <Text size={15}>คุณต้องการลบการ์ดของ  เลขบัตรประจำตัวสัตว์เลี้ยง  หรือไม่ </Text> */}
            {/* <Text className={noto_sans_thai.className} size={14}>ในการเปลี่ยนเลขบัตรประจำตัวสัตว์</Text> */}
            {/* <Text className={noto_sans_thai.className} size={14}></Text> */}
            {password ? <Text b color="black" size={30} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{passwordShow}</Text>
              :
              <Text b color="white" size={30} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>******</Text>
            }
            {textErrorPassword ? <Text b color="red" size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>{textErrorPassword}</Text>
              :
              <Text b color="white" size={15} css={{ mt: 10, fontFamily: 'NotoSansThai' }}>******</Text>
            }

            <Grid.Container css={{ mt: 5 }}>


              <Keyboard
                layout={{
                  default: ["1 2 3", "4 5 6", "7 8 9", ". 0 {bksp}", "{enter}"],
                  // shift: ["! / #", "$ % ^", "& * (", "{shift} ) +", "{bksp}"]
                }}
                display={{
                  "{bksp}": "⌫",
                  "{enter}": "Enter",
                }}
                onChange={onChange}
                onKeyPress={onKeyPress}


                theme="hg-theme-default hg-layout-numeric numeric-theme"
              />
            </Grid.Container>
          </Grid.Container>


        </Modal>


      </main>



    </>
  )
}
