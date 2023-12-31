import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { CssBaseline } from '@nextui-org/react';

class MyDocument extends Document {


  render() {
    return (
      <Html lang="en">
        <Head>
          {CssBaseline.flush()} 
        
        
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

// export const getStaticProps(ctx) {

// }

export async function  getStaticProps (ctx) {

  const initialProps = await Document.getStaticProps(ctx)

  return {
    ...initialProps,
    styles: React.Children.toArray([initialProps.styles])
  }

 
}
