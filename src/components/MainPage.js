import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Footer from '../components/Footer';

class MainPage extends Component {
    state = {
        openedDetails: []
    }

    componentWillMount() {
        this.props.initLocalData()
    }

    componentDidMount() {
        window.scrollTo(0, this.props.scrollY);
    }

    componentWillUnmount() {
        this.props.setInitialScroll(window.scrollY)
    }

    toggleDetails = (targetBtn) => {
        const details = targetBtn.parentNode.nextElementSibling;
        details.classList.toggle('shown')
        details.classList.contains('shown') ? targetBtn.classList.add('shown') : targetBtn.classList.remove('shown');
        this.showOnlyFewDetails(details)
    }

    showOnlyFewDetails = (detailItem) => {
        let openedDetails = this.state.openedDetails.map(detail => detail);

        if (detailItem.classList.contains('shown')) {
            if (openedDetails.includes(detailItem)) {
                // Delete detailItem from stack
                openedDetails = openedDetails.filter(item => item !== detailItem)
            } else if (openedDetails.length > 3) {
                const closedItem = openedDetails.splice(0, 1);
                closedItem[0].classList.remove('shown');
                closedItem[0].parentNode.querySelector('button').innerText = 'Show notes'
            }

            // Add detailItem to stack
            openedDetails.push(detailItem)
            this.setState({ openedDetails: openedDetails })
        }
    }

    createList = () => {
        const { currentMonth, currentYear, daysInMonth, dayDataToState } = this.props,
            listDays = [],
            weekend = ['Sat', 'Sun'],
            monthData = JSON.parse(localStorage.getItem(`${currentMonth}-${currentYear}`));


        for (let i = 0; i < daysInMonth; i++) {
            const dayData = monthData[i],
                day = dayData.day,
                weekdayName = dayData.wdName.slice(0,3),
                dateString = `${ day }-${ currentMonth }-${ currentYear }`,
                dayTasks = dayData.tasks;

            listDays.push(
                <li key={day} data-weekend={weekend.includes(weekdayName)}>
                    <Link
                        to={`/day-details/${ dateString }`}
                        className="business-day"
                        onClick={() => dayDataToState(dayData)}
                        draggable="false"
                        title={`Показать детальную информацию об этом дне (${new Date(dateString).toLocaleDateString('ru-RU')})`}
                        style={dayData.color ? { '--bgColor': dayData.color } : {}}
                        data-colored={dayData.color ? 'true' : 'false'}
                    >
                        <div>
                            <span className="day-of-week">{new Date(dateString).toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                            <span className="day-of-month">{day}</span>
                        </div>
                    </Link>

                    <div className={`day-data ${dayData.work ? '' : 'day-off'}`}>
                        {dayTasks.length ? dayTasks.map((task, index) => (
                            <section key={index} className={task.done ? 'done' : ''}>
                                {task.res && <aside className={`total ${task.res.tot === 0 ? '' : task.res.tot > 0 ? 'profit' : 'loss'}`}>
                                    {Math.abs(task.res.tot)}
                                </aside>}

                                <div className="main-info">
                                    <time>{task.time}</time>
                                    {task.name === 'Выходной' ?
                                        <h4 data-tasks={dayTasks.length > 1} title="Внимание! У Вас есть задачи на выходной!">{task.name}</h4> :
                                        <h4>{task.name}</h4>
                                    }
                                    {task.notes &&
                                    <button
                                        className="summary"
                                        onClick={e => this.toggleDetails(e.target)}
                                        title="Показать/скрыть заметки"
                                    >
                                        <span className="summary-triangle"></span>
                                        Заметки
                                    </button>}
                                </div>
                                <div className="details">
                                    <p>{task.notes}</p>
                                </div>
                            </section>
                        )) : <span className="no-tasks">Пока нет задач</span>}
                    </div>
                </li>
            )
        }
        return listDays
    }

    render() {
        return (
            <section className="month-page">

                <nav className="list-days">
                    <ul>
                        {this.createList()}
                    </ul>
                </nav>

                <Footer />
            </section>
        )
    }
}

export default MainPage
