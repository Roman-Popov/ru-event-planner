import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class ManageTaskPage extends Component {

    state = {
        workingDay: window.location.pathname.includes('edit-task') && this.props.editData ?
                    this.props.editData.task.name !== 'Выходной' : true,
        editDate: (() => {
            if (this.props.editData) {
                const { currentMonth, currentYear, editData } = this.props,
                    taskFullDate = new Date(`${editData.dayData.day} ${currentMonth} ${currentYear} ${editData.task.time} `),
                    inputDateValue = taskFullDate.toLocaleDateString('en-GB').split('/').reverse().join('-'),
                    inputTimeValue = editData.task.time;

                return { date: inputDateValue, time: inputTimeValue }
            }
            return { date: null, time: null }
        })(),
        usedSpacePercentage: Number((this.props.getUsedSpace() / this.props.totalSpace * 100).toFixed(2)),
        showModal: false,
        editData: window.location.pathname.includes('edit-task') ? this.props.editData : null
    }

    componentDidMount() {
        window.scrollTo(0, 0);

        if (!this.props.editData && window.location.pathname.includes('edit-task')) {
            window.history.replaceState(null, null, '/add-task');
            this.props.appForceUpdate()
        }

        if (this.state.usedSpacePercentage > 95 && !this.state.showModal) setTimeout(() => this.setState({ showModal: true }), 1);
    }

    submitTask = (e) => {
        e.preventDefault();

        const { months, currentMonth, currentYear,
            editData, editDataToState,
            initLocalData, dateTimeValueToState } = this.props,
            { editDate, workingDay } = this.state,
            dayDataToChange = editData && editData.dayData,
            taskToDelete = editData && editData.task,
            taskDate = document.getElementById('task-date').value,
            taskYear = taskDate.split('-')[0],
            taskMonth = months[Number(taskDate.split('-')[1]) - 1],
            taskDay = Number(taskDate.split('-')[2]) - 1,
            taskName = document.getElementById('task-name').value.trim(),
            taskTime = document.getElementById('task-time').value,
            taskNotes = document.getElementById('task-notes').value.trim(),
            listOfDays = initLocalData(taskMonth, taskYear);

        // Delete existing task (old version) if it is being edited
        if (editData) {
            function deleteTask (storedDay) {
                if (taskToDelete.name === 'Выходной') storedDay.work = true;
                storedDay.tasks = dayDataToChange.tasks.filter(task => task !== taskToDelete)
            }

            // Same month-year as a new version (edited) task
            if (taskDate.slice(0, 7) === editDate.date.slice(0, 7)) {
                const storedDay = listOfDays[dayDataToChange.day - 1];
                deleteTask(storedDay);
            // Task moved to other month
            } else {
                const listOfDays = initLocalData(currentMonth, currentYear),
                    storedDay = listOfDays[dayDataToChange.day - 1];
                deleteTask(storedDay);
                localStorage.setItem(`${currentMonth}-${currentYear}`, JSON.stringify(listOfDays));
            }
        }

        // Do not add new "Day off" day if it's already exist
        if (workingDay || listOfDays[taskDay].work) {
            if (!workingDay) listOfDays[taskDay].work = false;

            const newTask = {
                time: workingDay ? taskTime : '',
                name: workingDay ? taskName : 'Выходной',
                notes: workingDay ? taskNotes : '',
            }

            if (editData) {
                taskToDelete.done && (newTask.done = taskToDelete.done)
                taskToDelete.res && (newTask.res = taskToDelete.res)
            }

            listOfDays[taskDay].tasks.push(newTask)

            listOfDays[taskDay].tasks.sort((a, b) => {
                // "Day off" task will always be on top position
                if (a.name === 'Выходной') { return -1 } else if (b.name === 'Выходной') { return 1 }
                if (a.time > b.time) { return 1 } else { return -1 }
            })
        }

        localStorage.setItem(`${taskMonth}-${taskYear}`, JSON.stringify(listOfDays));
        editDataToState(null);
        dateTimeValueToState(taskDate, taskTime);

        // Click on hidden link to return to the main page
        document.getElementById('submit-task').click();
    }

    render() {
        const { years, initialTaskDate, initialTaskTime } = this.props,
            { workingDay, editDate, showModal, usedSpacePercentage, editData } = this.state,
            // Used space can be more than 100% because of reserved space.
            usedPercentageText = usedSpacePercentage > 100 ? 100 : usedSpacePercentage;

        return (
            <section className="add-task">
                <form onSubmit={(e) => this.submitTask(e)}>
                    <label title="Дата задачи">
                        <span>Дата</span>
                        <input
                            type="date"
                            id="task-date"
                            required={true}
                            min={`${Math.min(...years)}-01-01`}
                            max={`${Math.max(...years)}-12-31`}
                            defaultValue={editDate.date || initialTaskDate}
                        />
                    </label>

                    <label title={`Нажмите здесь, чтобы отметить этот день как ${workingDay ? 'выходной' : 'рабочий день'}`}>
                        <span>Рабочий день</span>
                        <input
                            type="checkbox"
                            id="working-day"
                            defaultChecked={workingDay}
                            onChange={(e) => this.setState({workingDay: e.target.checked})}/>
                        <span className="checkmark"></span>
                    </label>

                    <label title={workingDay ? "Имя задачи (обязательное поле, максимум 50 символов)" : "Выходной"}>
                        <span>Имя задачи</span>
                        <input
                            type="text"
                            id="task-name"
                            required={workingDay}
                            placeholder={workingDay ? "Имя задачи (обязательно)" : "Выходной"}
                            defaultValue={!editData ? '' : editData.task.name !== 'Выходной' ? editData.task.name : '' }
                            autoComplete="off"
                            pattern=".*\S+.*"
                            title={workingDay ? "Имя задачи (обязательное поле, максимум 50 символов, как минимум 1 символ)" : "Выходной"}
                            maxLength="50"
                            disabled={!workingDay}
                        />
                    </label>

                    <label title={workingDay ? "Время задачи" : "Выходной"}>
                        <span>Время</span>
                        <input
                            type="time"
                            id="task-time"
                            defaultValue={editDate.time || initialTaskTime}
                            disabled={!workingDay}
                        />
                    </label>

                    <label title={workingDay ? "Пишите здесь Ваши заметки... (опционально, максимум 500 символов)" : "Выходной"}>
                        <span>Заметки</span>
                        <textarea
                            id="task-notes"
                            placeholder={workingDay ? "Пишите здесь Ваши заметки... (опционально, максимум 500 символов)" : "Выходной"}
                            defaultValue={editData ? editData.task.notes : ''}
                            maxLength="500"
                            disabled={!workingDay}>
                        </textarea>
                    </label>

                    {/* Fake hidden button to go back if task was added successfully */}
                    <Link to="/" id="submit-task" title={editData ? 'Применить изменения' : 'Добавить задачу'}>{editData ? 'Применить' : 'Добавить'}</Link>

                    <Link to="/" className="btn btn-cancel" draggable="false" title="Отменить">Отменить</Link>
                    <button
                        className={`btn btn-submit ${usedPercentageText < 100 ? '' : 'disabled'}`}
                        disabled={!(usedPercentageText < 100)}
                        title={editData ? 'Применить изменения' : 'Добавить задачу'}
                    >
                        <span className={usedPercentageText > 95 && usedPercentageText < 100 ? 'warning' : ''}>{editData ? 'Применить' : 'Добавить'}</span>
                    </button>
                </form>

                <div className={`modal-window ${showModal ? 'visible' : ''}`}>
                    <div className="message">
                        <h2><span className="modal-header">Внимание!</span></h2>
                        {usedPercentageText < 100 ?
                            <div>
                                <p>Память приложения почти заполнена</p>
                                <p>
                                    Текущее использование памяти: <span className="mem-percent">{usedPercentageText}%</span>
                                </p>
                                <p>Вскоре Вы не сможете добавлять новые задачи.</p>
                                <p>Вы можете освободить место в памяти на соответствующей странице.</p>
                            </div> :

                            <div>
                                <p>Память приложения заполнена!</p>
                                <p>
                                    Недостаточно памяти для добавления новой задачи.
                                </p>
                                <p>Вы можете освободить место в памяти на соответствующей странице.</p>
                            </div>
                        }
                        <div className="btn-wrapper">
                            <Link
                                to="/storage-management"
                                className="btn btn-no"
                                draggable="false"
                                title="Освободить сейчас"
                            >
                                Освободить сейчас
                            </Link>
                            <button
                                className="btn btn-yes"
                                title="Освободить позже"
                                onClick={() => {
                                    this.setState({ showModal: false });
                                    document.querySelector('body').classList.remove('modal-shown');
                                }}
                            >
                                Освободить позже
                            </button>
                        </div>
                    </div>
                </div>

            </section>
        )
    }
}

export default ManageTaskPage
