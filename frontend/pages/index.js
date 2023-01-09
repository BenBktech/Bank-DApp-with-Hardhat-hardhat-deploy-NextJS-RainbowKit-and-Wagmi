import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Header } from '../components/Header/Header'
import { Bank } from '../components/Bank/Bank'

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Bank />
    </>
  )
}
