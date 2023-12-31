import "../styles/globals.css";
import "../styles/styles.css";


import { createTheme, NextUIProvider } from '@nextui-org/react';

const myLightTheme = createTheme({
  type: 'light',
  theme: {
    colors: {
      // brand colors
      background: '#101C42',
      text: 'white',
      bgColor: '#FBBF4A',
      bgColorGradient: 'linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)',
      white: 'white',
      blue: '#392D4E',
      orange: '#FBBF4A',
      orange2: '#FFCF52',
      gray: '#F1F3F5',
      gray2: '#8D8D8D',
      success: '#17C964'
    },
    space: {},
    fonts: {}
  }
})



function MyApp({ Component, pageProps }) {
  return (

    <NextUIProvider theme={myLightTheme}>
      <Component  {...pageProps} />
    </NextUIProvider>
  );
}

export default MyApp;
