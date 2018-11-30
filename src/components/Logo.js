import React, { Component } from 'react'
import s from '../logo.css';

class Logo extends Component {
    render() {
        const { style, href, type } = this.props,
            logoStyle = style ? {
                '--initialColor': '#1d0066',
                '--width': style.width,
                '--bgColor': style.bgColor,
                '--logoColor': style.logoColor,
                '--shadowColor': style.shadowColor,
                'margin': style.margin
            } : {}

        return (
            <custom-div class={s['wrapper']} style={logoStyle}>
                <a href={href ? href : '/'} className={`${s['logo']} ${type ? s[type] : ''}`} draggable="false">
                    <custom-div class={`${s['hex-corner']} ${s['hex-pt1']}`}></custom-div>
                    <custom-div class={`${s['hex-corner']} ${s['hex-pt2']}`}></custom-div>

                    <custom-p class={s['letter']}>
                        R <custom-span class={s['name']}>OMAN</custom-span>
                    </custom-p>
                    <custom-p class={s['letter']}>
                        P <custom-span class={s['name']}>OPOV</custom-span>
                    </custom-p>
                </a>
            </custom-div>
        )
    }
}

export default Logo
