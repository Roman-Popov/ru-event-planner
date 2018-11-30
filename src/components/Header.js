import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Header extends Component {

    historyBack = () => {
        const { history, location } = window;

        history.length > 2 ? history.back() : location.assign(process.env.PUBLIC_URL || '/')
    }

    render() {
        const { currentMonth, currentYear, updateLastSearch } = this.props,
            pathName = window.location.pathname,
            pages = [
                {
                    name: 'Add task',
                    here: pathName.includes('add-task'),
                    text: 'Добавление задачи',
                },
                {
                    name: 'Select month',
                    here: pathName.includes('select-month'),
                    text: 'Выбор месяца',
                },
                {
                    name: 'Day details',
                    here: pathName.includes('day-details'),
                    text: new Date(`${currentMonth} ${currentYear}`).toLocaleDateString('ru-RU', { month: 'long' }) + `, ${currentYear}`,
                },
                {
                    name: 'Edit task',
                    here: pathName.includes('edit-task'),
                    text: `Редактирование задачи`,
                },
                {
                    name: 'Search',
                    here: pathName.includes('search'),
                    text: 'Поиск по ключевым словам',
                },
                {
                    name: 'Storage management',
                    here: pathName.includes('storage-management'),
                    text: 'Управление хранилищем',
                },
                {
                    name: 'Statistics',
                    here: pathName.includes('statistics'),
                    text: 'Статистика',
                }
            ],
            currentPage = pages.find(elem => elem.here) || '',
            buttonText = currentPage ? currentPage.text : new Date(`${currentMonth} ${currentYear}`).toLocaleDateString('ru-RU', { month: 'long' }) + `, ${currentYear}`;

        return (
            <header className="control-panel">
                {currentPage.name === 'Add task' ?
                    <button
                        className='btn btn-add activated'
                        onClick={this.historyBack}
                        title="Вернуться к предыдущему экрану"
                    >
                        Назад к предыдущему экрану
                    </button> :
                    currentPage.name === 'Edit task' ?
                        <button
                            className='btn btn-edit-task activated'
                            onClick={this.historyBack}
                            title="Вернуться к предыдущему экрану"
                        >
                            Назад к предыдущему экрану
                        </button> :
                        <Link to="/add-task"
                            className='btn btn-add'
                            draggable="false"
                            title="Добавить новую задачу"
                        >
                            Добавить новую задачу
                        </Link>
                }

                {currentPage ? // !== Main page
                    <div className={`btn btn-select-month disabled ${currentPage.name === 'Day details' ? 'day-overview' : ''}`}>{buttonText}</div> :
                    <Link
                        to="/select-month"
                        className="btn btn-select-month"
                        draggable="false"
                        title="Выберите месяц"
                    >
                        {buttonText}
                    </Link>
                }

                {currentPage.name === 'Search' ?
                    <button
                        className="btn btn-open-search activated"
                        onClick={this.historyBack}
                        title="Вернуться к предыдущему экрану"
                    >
                        Назад к предыдущему экрану
                    </button> :
                    <Link
                        to="/search"
                        className="btn btn-open-search"
                        onClick={() => updateLastSearch('')}
                        draggable="false"
                        title="Поиск по ключевым словам"
                    >
                        Поиск по ключевым словам
                    </Link>
                }
            </header>
        )
    }
}

export default Header
