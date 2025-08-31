import { FacebookLogo, InstagramLogo, TwitterLogo, YoutubeLogo } from 'phosphor-react'
import React from 'react'

import logo_img from '../../assets/plant 2.png'

import './Footer.sass'

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="column">
                    <div className="footer-logo">
                        <img src={logo_img} alt="" />
                        <h2 className="title">Planto.</h2>
                    </div>

                    <div className="social-icons">
                        <FacebookLogo size={32} />
                        <InstagramLogo size={32} />
                        <TwitterLogo size={32} />
                        <YoutubeLogo size={32} />
                    </div>
                </div>

                <div className="column">
                    <h3 className="title">Address</h3>
                    <p>Oxford Ave, Cary, NC 27511</p>
                    <h3 className="title">Email</h3>
                    <p>nwiger@yahoo.com</p>
                    <h3 className="title">Phone</h3>
                    <p>+537 547-6401</p>
                </div>

                
                <div className="column">
                    <h3 className="title">Created by</h3>
                    <ul className="list">
                        <li className="list-item">Vojtěch Vítek</li>
                        <li className="list-item">Daniel Grisa</li>
                        <li className="list-item">Matěj Soukup</li>
                        <li className="list-item">Mikuláš Novák</li>
                        <li className="list-item">Jan Větříšek</li>
                        <li className="list-item">Frantisek Varga</li>
                    </ul>
                </div>
            </div>

            <p className="copyright">© Copyright Planto 2024. Design by Figma.guru</p>
        </footer>
    )
}

export default Footer
