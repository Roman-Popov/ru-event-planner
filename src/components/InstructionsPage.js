import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class InstructionsPage extends Component {
    render() {

        return (
            <section className='instructions'>
                <p>Эта страница находится в разработке</p>
                <Link
                    to="/"
                    className="btn"
                    title="Вернуться на главную страницу"
                    style={{padding: '0 1em'}}
                >
                    Вернуться на главную страницу
                </Link>
            </section>
        )
    }
}

export default InstructionsPage
