import { motion } from 'framer-motion'
import React from 'react'
import './Home.sass'
import HomePageFeatures from './components/HomePageFeatures/HomePageFeatures'
import HomePageIntro from './components/HomePageIntro/HomePageIntro'
import TryContainer from './components/TryContainer/TryContainer'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <motion.div
                className="home-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}>
                <motion.div
                    variants={itemVariants}
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                    <HomePageIntro />
                </motion.div>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                    <HomePageFeatures />
                </motion.div>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                    <TryContainer />
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Home
