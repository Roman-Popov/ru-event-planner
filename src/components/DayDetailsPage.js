
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class DayDetailsPage extends Component {

    state = {
        dayData: null,
        currentMonth: this.props.currentMonth,
        currentYear: this.props.currentYear,
        showModal: false,
        deleteObject: '',
    }

    componentWillMount() {
        this.getDayData();
    }

    componentWillUnmount() {
        document.querySelector('body').classList.remove('modal-shown');
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    getDayData = () => {
        const { dayData, updateDate, dayDataToState } = this.props;

        if (dayData) {
            // Day Data is in props
            this.setState({ dayData: dayData })
        } else {
            // Get info from URL (in case of page reload)
            const dateFromURL = document.location.pathname.split('/day-details/').pop().split('-'),
                monthURL = dateFromURL[1],
                yearURL = dateFromURL[2],
                storedData = localStorage.getItem(`${monthURL}-${yearURL}`),
                storedDay = dateFromURL[0] - 1;

            if (storedData) {
                const parsedData = JSON.parse(storedData)[storedDay];

                updateDate(monthURL, yearURL);
                dayDataToState(parsedData);
                this.setState({ dayData: parsedData })
            }
        }
    }

    changeDayColor = (color) => {
        const { dayDataToState } = this.props,
            { dayData, currentMonth, currentYear } = this.state,
            dayName = dayData.wdName,
            weekend = ['Saturday', 'Sunday'],
            listOfDays = JSON.parse(localStorage.getItem(`${currentMonth}-${currentYear}`)),
            storedDay = listOfDays[dayData.day - 1],
            colorPicker = document.getElementById('color-picker');

        if (color) {
            storedDay.color = color;
        } else {
            delete storedDay.color;
            colorPicker.value = weekend.includes(dayName) ? '#f8c6c6' : '#add8e6';
        }

        this.setState({ dayData: storedDay });
        dayDataToState(storedDay);
        localStorage.setItem(`${currentMonth}-${currentYear}`, JSON.stringify(listOfDays));
    }

    confirmDeletion = (task) => {
        document.querySelector('body').classList.add('modal-shown');

        this.setState({
            showModal: true,
            deleteObject: task || '',
        })
    }

    clearData = (task) => {
        const { dayDataToState } = this.props,
            { dayData, currentMonth, currentYear } = this.state,
            storedMonthData = JSON.parse(localStorage.getItem(`${currentMonth}-${currentYear}`)),
            storedDayData = storedMonthData[dayData.day - 1];

        if (task) {
            storedDayData.tasks = dayData.tasks.filter(storedTask => storedTask !== task)
            if (task.name === 'Выходной') storedDayData.work = true;
        } else {
            storedDayData.tasks = [];
            storedDayData.work = true;
        }

        localStorage.setItem(`${currentMonth}-${currentYear}`, JSON.stringify(storedMonthData));
        dayDataToState(storedDayData);

        this.setState({
            dayData: storedDayData,
            showModal: false
        })
    }

    taskDoneCheckmark = (checkmark, task, index) => {
        const { dayDataToState } = this.props,
                { dayData, currentMonth, currentYear } = this.state,
                storedMonthData = JSON.parse(localStorage.getItem(`${currentMonth}-${currentYear}`)),
                storedDayData = storedMonthData[dayData.day - 1];

        if (checkmark.checked) {
            task.done = true;
        } else {
            task.done = false;
            document.querySelector(`.result[data-task="${index}"] .result-form`).classList.remove('visible');
            delete task.res
        }

        storedDayData.tasks = dayData.tasks;
        localStorage.setItem(`${currentMonth}-${currentYear}`, JSON.stringify(storedMonthData));
        dayDataToState(storedDayData);
    }

    submitResult = (e, task, index) => {
        function calc(str) {
            // Delete spaces, duplicate '+' signs, '+' signs at the beginning and at the end of the string
            const formatStr = str.replace(/[\s+]+/g, '+').replace(/(?:^\+)|(?:\+$)/g, '');
            // Summation of all numbers of the string
            return formatStr.split('+').reduce((a, b) => parseFloat(a) + parseFloat(b), 0) || 0;
        }

        e.preventDefault();

        const form = e.target;

        let revenue = calc(form.querySelector(`#revenue-task-${index}`).value),
            expenses = calc(form.querySelector(`#expenses-task-${index}`).value);

        if (revenue === 0 && expenses === 0) {
            form.parentElement.querySelector('.btn-add-fin-result').classList.add('visible');
        } else {
            const { dayDataToState } = this.props,
                { dayData, currentMonth, currentYear } = this.state,
                storedMonthData = JSON.parse(localStorage.getItem(`${currentMonth}-${currentYear}`)),
                storedDayData = storedMonthData[dayData.day - 1];

            task.res = {
                rev: Number(revenue.toFixed(2)) || 0,
                exp: Number(expenses.toFixed(2)) || 0,
                tot: Number((revenue - expenses).toFixed(2))
            }

            storedDayData.tasks = dayData.tasks;
            localStorage.setItem(`${currentMonth}-${currentYear}`, JSON.stringify(storedMonthData));
            dayDataToState(storedDayData);

            form.parentElement.querySelector('.summary').classList.add('visible');
        }

        form.classList.remove('visible');
    }

    clearResult = (task, index) => {
        const { dayDataToState } = this.props,
                { dayData, currentMonth, currentYear } = this.state,
                storedMonthData = JSON.parse(localStorage.getItem(`${currentMonth}-${currentYear}`)),
                storedDayData = storedMonthData[dayData.day - 1];

        document.querySelector(`.result[data-task="${index}"] .summary`).classList.remove('visible');
        delete task.res;

        storedDayData.tasks = dayData.tasks;
        localStorage.setItem(`${currentMonth}-${currentYear}`, JSON.stringify(storedMonthData));
        dayDataToState(storedDayData, () => {
            document.querySelector(`.result[data-task="${index}"] .btn-add-fin-result`).classList.remove('initial')
        });
    }

    render() {
        const { editDataToState } = this.props,
            { dayData, showModal, deleteObject, currentMonth, currentYear } = this.state,
            dayTasks = dayData.tasks,
            dayName = dayData.wdName,
            ruDayName = new Date(`${dayData.day} ${currentMonth} ${currentYear}`).toLocaleDateString('ru-RU', {weekday: 'long'}),
            weekend = ['Saturday', 'Sunday'];

        return (
            <section className='day-details' >
                <div className="header-wrapper" data-weekend={weekend.includes(dayName)}>
                    <header style={dayData.color ? { '--bgColor': dayData.color } : {}}>
                        <Link to="/" className="btn btn-back" title="Вернуться к обзору месяца" draggable="false">Вернуться к обзору месяца</Link>
                        <div>
                            <h1>{dayData.day}</h1>
                            <span className="day-of-week">{ruDayName}</span>

                            <button
                                className="day-color"
                                onClick={() => document.getElementById('color-picker').click()}
                                title="Установить цвет дня"
                            >
                                Установить цвет дня
                            </button>

                            <button
                                className="clear-day-color"
                                onClick={() => this.changeDayColor()}
                                title="Сбросить цвет дня"
                            >
                                Сбросить цвет дня
                            </button>

                            {/* Hidden color-picker element */}
                            <input
                                id="color-picker"
                                style={{ display: 'none' }}
                                type="color"
                                defaultValue={dayData.color ? dayData.color : weekend.includes(dayName) ? '#f8c6c6' : '#add8e6'}
                                onChange={(e) => this.changeDayColor(e.target.value)}
                            />

                        </div>
                        <button
                            className={`btn btn-delete-day ${dayTasks.length ? 'visible' : ''}`}
                            onClick={() => this.confirmDeletion()}
                            title="Удалить все задачи за этот день"
                        >
                            Удалить все задачи за этот день
                        </button>
                    </header>
                </div>

                {dayTasks.length ? dayTasks.map((task, index) => (
                    <div key={index} className={`task ${task.time ? '' : 'no-time'}`}>
                        {task.time && <time className="task-time">{task.time}</time>}
                        <article className={`task-info ${task.done ? 'done' : ''} ${task.name === 'Выходной' ? 'day-off' : ''}`}>
                            <Link
                                to={`/edit-task/${dayData.day}-${currentMonth}-${currentYear}/${task.name}~${task.time.replace(':', '-')}`}
                                className="btn btn-edit-task"
                                title="Редактировать задачу"
                                onClick={() => { editDataToState(dayData, task) }}
                            >
                                {`Редактировать задачу «${task.name}»`}
                            </Link>
                            <button
                                className="btn btn-delete-task"
                                title="Удалить задачу"
                                onClick={() => this.confirmDeletion(task)}
                            >
                                {`Удалить задачу «${task.name}»`}
                            </button>

                            <h2>{task.name}</h2>
                            {task.notes && <p className="details">{task.notes}</p>}

                            {task.name !== 'Выходной' && <section className="result" data-task={index}>
                                <header className="result-header">
                                    <label title={`Нажмите, чтобы пометить эту задачу как ${task.done ? "невыполненную" : "выполненную"}`}>
                                        <span>Задача<span className='cmplt' data-cmplt={task.done}> не</span> завершена</span>
                                        <input
                                            type="checkbox"
                                            className="task-done"
                                            checked={task.done || false}
                                            onChange={(e) => this.taskDoneCheckmark(e.target, task, index)}
                                        />
                                        <span className="checkmark"></span>
                                    </label>

                                    <button
                                        className={`btn btn-add-fin-result ${task.done && !task.res ? 'visible initial' : ''}`}
                                        title="Добавить финансовый результат"
                                        onClick={(e) => {
                                            const openedForm = document.querySelector('.result-form.visible');

                                            if (openedForm) {
                                                openedForm.classList.remove('visible');
                                                openedForm.parentElement.querySelector('.btn-add-fin-result').classList.add('visible');
                                            }
                                            e.target.classList.remove('visible', 'initial');
                                            document.querySelector(`.result[data-task="${index}"] .result-form`).classList.add('visible');
                                        }}
                                    >
                                        Добавить результат
                                    </button>
                                </header>

                                <form
                                    className="result-form"
                                    onSubmit={(e) => this.submitResult(e, task, index)}
                                >
                                    <h3>Результаты</h3>
                                    <label>
                                        Доходы:
                                        <input
                                            type="tel"
                                            id={`revenue-task-${index}`}
                                            autoComplete="off"
                                            pattern="[\s\+]*(?:\d+(?:\.\d)?(?:\s*\++\s*)*)+\s*"
                                            placeholder="0"
                                            title='Допустимые символы: «+» (плюс), «.» (точка), « » (пробел), а так же цифры'
                                        />
                                    </label>
                                    <label>
                                        Расходы:
                                        <input
                                            type="tel"
                                            id={`expenses-task-${index}`}
                                            autoComplete="off"
                                            pattern="[\s\+]*(?:\d+(?:\.\d)?(?:\s*\++\s*)*)+\s*"
                                            placeholder="0"
                                            title='Допустимые символы: «+» (плюс), «.» (точка), « » (пробел), а так же цифры'
                                        />
                                    </label>

                                    <div className="btn-wrapper">
                                        <button
                                            className="btn btn-yes"
                                            type="button"
                                            title="Отменить"
                                            onClick={() => {
                                                document.querySelector(`.result[data-task="${index}"] .result-form`).classList.remove('visible');
                                                document.querySelector(`.result[data-task="${index}"] .btn-add-fin-result`).classList.add('visible')
                                            }}
                                        >
                                            Отменить <i></i><i></i>
                                        </button>
                                        <button
                                            className="btn btn-no"
                                            type="submit"
                                            title="Принять"
                                        >
                                            Принять <i></i><i></i>
                                        </button>
                                    </div>
                                </form>

                                <div className={`summary ${task.res && task.done ? 'visible' : ''}`}>
                                <button
                                    className="btn btn-clear-fin-res"
                                    title="Очистить финансовый результат"
                                    onClick={() => this.clearResult(task, index)}
                                >
                                    {`Очистить финансовый результат задачи «${task.name}»`}
                                </button>
                                    <ul>
                                        <li>Доход: <span>{task.res ? task.res.rev : 0}</span></li>
                                        <li>Расход: <span>{task.res ? task.res.exp : 0}</span></li>
                                        <li className="total">
                                            Итого:
                                            <span
                                                className={!task.res || (task.res && task.res.tot === 0) ? '' :
                                                    task.res.tot > 0 ? 'profit' : 'loss'}
                                            >
                                                {task.res ? Math.abs(task.res.tot) : 0}
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                            </section>}
                        </article>
                    </div>
                )) : ''}

                <span className="end-of-tasks">
                    {dayTasks.length ? 'На этот день больше нет задач' :
                        'Пока что нет задач'}
                </span>

                <div className={`modal-window ${showModal ? 'visible' : ''}`}>
                    <div className="message">
                        <h2><span className="modal-header">Внимание!</span></h2>
                        <p>Удаленные данные не могут быть восстановлены без файла резервной копии</p>
                        <p>
                            Вы действительно хотите удалить
                            { deleteObject ? ` задачу «${ deleteObject.name }»${ deleteObject.time ? ` (в ${ deleteObject.time })` : '' }` :
                                ' все задачи за этот день' }?
                        </p>
                        <div className="btn-wrapper">
                            <button
                                className="btn btn-no"
                                onClick={() => {
                                    this.setState({ showModal: false });
                                    document.querySelector('body').classList.remove('modal-shown');
                                }}
                            >
                                Нет
                            </button>

                            <button
                                className="btn btn-yes"
                                onClick={() => {
                                    this.clearData(deleteObject)
                                    document.querySelector('body').classList.remove('modal-shown');
                                }}
                            >
                                Да
                            </button>
                        </div>
                    </div>
                </div>

            </section>
        )
    }
}

export default DayDetailsPage
