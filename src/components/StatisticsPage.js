import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class StatisticsPage extends Component {
    state = {
        monthStatsInfo: [],
        openedDetails: []
    }

    componentWillMount() {
        this.setState({ monthStatsInfo: this.getMonthStatsInfo() })
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    getMonthStatsInfo = () => {
        const monthDataKeys = Object.keys(localStorage).filter(key => /^[A-Z]+-20\d\d$/i.test(key));

        const tmp = monthDataKeys.reduce((acc, curr) => {
            const month = curr.split('-')[0],
                year = curr.split('-')[1],
                monthData = JSON.parse(localStorage.getItem(curr)),
                statsTemplate = {
                    totalTasksCount: 0,
                    doneTasksCount: 0,
                    profitableTasksCount: 0,
                    expensiveTasksCount: 0,
                    mostProfitableTask: { day: 0, task: { res: { tot: 0 } } },
                    mostExpensiveTask: { day: 0, task: { res: { tot: 0 } } },
                    avgResultPerDay: 0,
                    totalRevenue: 0,
                    totalExpense: 0,
                    totalResult: 0
                }

            const stats = monthData.reduce((acc, curr) => {
                const dayTasks = curr.tasks.filter(task => task.name !== 'Выходной'),
                    dayTasksCount = dayTasks.length,
                    doneDayTasks = dayTasks.filter(task => task.done),
                    doneDayTasksCount = doneDayTasks.length;

                const dayFinResults = doneDayTasks.reduce((acc, curr) => {
                    if (curr.res) {
                        if (curr.res.tot > 0) {
                            acc.profitableTasksCount++;
                        } else if (curr.res.tot < 0) {
                            acc.expensiveTasksCount++;
                        }

                        acc.mostProfitableTask = (curr.res.tot > 0) && (curr.res.tot > acc.mostProfitableTask.res.tot) ? curr : acc.mostProfitableTask;
                        acc.mostExpensiveTask = (curr.res.tot < 0) && (curr.res.tot < acc.mostExpensiveTask.res.tot) ? curr : acc.mostExpensiveTask;
                        acc.totalRevenue += curr.res.rev;
                        acc.totalExpense += curr.res.exp;
                    }

                    return acc
                },
                {
                    profitableTasksCount: 0,
                    expensiveTasksCount: 0,
                    mostProfitableTask: { res: { tot: 0 } },
                    mostExpensiveTask: { res: { tot: 0 } },
                    totalRevenue: 0,
                    totalExpense: 0
                })

                acc.totalTasksCount += dayTasksCount;
                acc.doneTasksCount += doneDayTasksCount;
                acc.profitableTasksCount += dayFinResults.profitableTasksCount;
                acc.expensiveTasksCount += dayFinResults.expensiveTasksCount;

                if (dayFinResults.mostProfitableTask.res.tot > acc.mostProfitableTask.task.res.tot) {
                    acc.mostProfitableTask.day = curr.day;
                    acc.mostProfitableTask.unixTime = Date.parse(`${year} ${month} ${curr.day} ${dayFinResults.mostProfitableTask.time || ''}`);
                    acc.mostProfitableTask.task = dayFinResults.mostProfitableTask;
                }

                if (dayFinResults.mostExpensiveTask.res.tot < acc.mostExpensiveTask.task.res.tot) {
                    acc.mostExpensiveTask.day = curr.day;
                    acc.mostExpensiveTask.unixTime = Date.parse(`${year} ${month} ${curr.day} ${dayFinResults.mostExpensiveTask.time || ''}`);
                    acc.mostExpensiveTask.task = dayFinResults.mostExpensiveTask;
                }

                acc.totalRevenue += dayFinResults.totalRevenue;
                acc.totalExpense += dayFinResults.totalExpense;

                return acc
            }, JSON.parse(JSON.stringify(statsTemplate)))

            stats.totalResult = Number((stats.totalRevenue - stats.totalExpense).toFixed(2));
            stats.avgResultPerDay = Number((stats.totalResult / monthData.length).toFixed(2));
            stats.totalRevenue = Number(stats.totalRevenue.toFixed(2));
            stats.totalExpense = Number(stats.totalExpense.toFixed(2));

            let yearInstance = acc[year];

            if (yearInstance === undefined) {
                acc[year] = yearInstance = {};
                yearInstance.year = Number(year);
                yearInstance.months = [];
                yearInstance.yearStats = JSON.parse(JSON.stringify(statsTemplate));
            };

            yearInstance.months.push({
                name: month,
                monthNum: new Date(curr).getMonth(),
                stats: stats
            });

            const yearStats = yearInstance.yearStats;

            yearStats.totalTasksCount += stats.totalTasksCount;
            yearStats.doneTasksCount += stats.doneTasksCount;
            yearStats.profitableTasksCount += stats.profitableTasksCount;
            yearStats.expensiveTasksCount += stats.expensiveTasksCount;

            if (stats.mostProfitableTask.task.res.tot > yearStats.mostProfitableTask.task.res.tot) {
                yearStats.mostProfitableTask.day = stats.mostProfitableTask.day;
                yearStats.mostProfitableTask.month = month;
                yearStats.mostProfitableTask.unixTime = stats.mostProfitableTask.unixTime;
                yearStats.mostProfitableTask.task = stats.mostProfitableTask.task;
            }

            if (stats.mostExpensiveTask.task.res.tot < yearStats.mostExpensiveTask.task.res.tot) {
                yearStats.mostExpensiveTask.day = stats.mostExpensiveTask.day;
                yearStats.mostExpensiveTask.month = month;
                yearStats.mostExpensiveTask.unixTime = stats.mostExpensiveTask.unixTime;
                yearStats.mostExpensiveTask.task = stats.mostExpensiveTask.task;
            }

            yearStats.totalRevenue += stats.totalRevenue;
            yearStats.totalExpense += stats.totalExpense;
            yearStats.totalResult += stats.totalResult;

            return acc;
        }, {});

        const result = Object.keys(tmp).map(key => {
            tmp[key].months.sort((a, b) => a.monthNum - b.monthNum)

            return tmp[key]
        });

        return result.sort((a, b) => a.year - b.year)
    }

    getClassName = (res) => {
        return res > 0 ? 'profit' : res < 0 ? 'loss' : ''
    }

    generateTaskInfo = (task, month, year) => {
        const name = task.task.name,
            result = task.task.res.tot,
            unixTime = task.unixTime,
            time = task.task.time,
            resultString = result > 0 ? 'Самая прибыльная задача:' : result < 0 ? 'Самая убыточная задача:' : 'Задача:'

        return (
            <li>
                {resultString} <b>"{name}", <span className={this.getClassName(result)}>{Math.abs(result)} </span></b>
                <time>
                    ({new Date(unixTime).toLocaleDateString('ru-RU')}
                    {time ? ` в ${new Date(unixTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : ''})
                </time>
                <Link
                    to={`/day-details/${task.day}-${month}-${year}`}
                    className="show-day"
                    draggable="false"
                    title={`Перейти к ${new Date(unixTime).toLocaleDateString('ru-RU')}`}
                    onClick={() => this.props.dayDataToState(null)}
                >
                    Показать день
                </Link>
            </li>
        )
    }

    toggleDetails = (targetBtn) => {
        const details = targetBtn.parentNode.nextElementSibling,
            shortDetails = targetBtn.previousElementSibling;

        shortDetails.classList.toggle('shown')
        details.classList.toggle('shown')
        details.classList.contains('shown') ? targetBtn.innerText = 'Скрыть детальную статистику' : targetBtn.innerText = 'Показать детальную статистику';

        this.showOnlyFewDetails(details)
    }

    showOnlyFewDetails = (detailItem) => {
        let openedDetails = this.state.openedDetails.map(detail => detail);

        if (detailItem.classList.contains('shown')) {
            if (openedDetails.includes(detailItem)) {
                // Delete detailItem from stack
                openedDetails = openedDetails.filter(item => item !== detailItem)
            } else if (openedDetails.length > 1) {
                const closedItem = openedDetails.splice(0, 1)[0];
                closedItem.classList.remove('shown');
                closedItem.parentNode.querySelector('.short-stats').classList.add('shown');
                closedItem.parentNode.querySelector('button').innerText = 'Показать детальную статистику'
            }

            // Add detailItem to stack
            openedDetails.push(detailItem)
            this.setState({ openedDetails: openedDetails })
        }
    }

    render() {
        const { monthStatsInfo } = this.state,
            { currentMonth, currentYear, updateDate } = this.props,
            currStats = monthStatsInfo
                .find(elem => elem.year === currentYear).months
                .find(month => month.name === currentMonth).stats;

        return (
            <section className='statistics'>
                <div className="header-wrapper">
                    <header>
                        <Link to="/" className="btn btn-back" title="Вернуться к обзору месяца" draggable="false">Вернуться к обзору месяца</Link>
                        <div className="current-info">
                            <h3>{new Date(`${currentMonth}-${currentYear}`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h3>
                            <div className="current-stats">
                                <div>
                                    Доход: <b>{currStats.totalRevenue}</b><br/>
                                    Расход: <b>{currStats.totalExpense}</b>
                                </div>
                                <div>
                                    Задачи: <b>{currStats.doneTasksCount} / {currStats.totalTasksCount}</b><br/>
                                    Итого: <b><span className={this.getClassName(currStats.totalResult)}>{Math.abs(currStats.totalResult)}</span></b>
                                </div>
                            </div>
                        </div>
                    </header>
                </div>

                {monthStatsInfo.map(elem => (
                    <section key={elem.year} className="group-year">
                        <div className="year-info">
                            {<time className="year-name">{elem.year}</time>}
                        </div>

                        <ul className="year-data">
                            {elem.months.map(month => {
                                const { totalTasksCount, doneTasksCount, profitableTasksCount,
                                    expensiveTasksCount, mostProfitableTask, mostExpensiveTask,
                                    avgResultPerDay, totalRevenue, totalExpense, totalResult } = month.stats;

                                return (<li key={month.name} className="month-stats-info">
                                    <div className="month-link-wrapper">
                                        <Link
                                            to="/"
                                            className="month-link"
                                            title={`Показать ${new Date(`${month.name}-${elem.year}`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`}
                                            onClick={() => updateDate(month.name, elem.year)}
                                            draggable="false"
                                        >
                                            <h3 className="month">{new Date(`${month.name}-${elem.year}`).toLocaleDateString('ru-RU', { month: 'long' })}</h3>
                                        </Link>
                                        {(elem.year === currentYear && month.name === currentMonth) && <div className="current" title="Текущий отображаемый месяц"></div>}
                                    </div>

                                    {totalTasksCount ? <section>
                                        <div className="short-stats-wrapper">
                                            <div className="short-stats shown">
                                                <ul>
                                                    <li>
                                                        Задачи: <b>{doneTasksCount} / {totalTasksCount}</b>
                                                    </li>
                                                    <li>
                                                        Финансовый результат: {totalRevenue} − {totalExpense} = <b><span className={this.getClassName(totalResult)}>
                                                            {Math.abs(totalResult)}</span></b>
                                                    </li>
                                                </ul>
                                            </div>
                                            <button className="summary" title="Показать/скрыть детальную статистику" onClick={e => this.toggleDetails(e.target)}>
                                                Показать детальную статистику
                                        </button>
                                        </div>

                                        <div className="stats-wrapper">
                                            <ol tabIndex="-1">
                                                <li>
                                                    Общее число задач: <b>{totalTasksCount}</b>
                                                </li>
                                                <li>
                                                    Общее число завершенных задач: <b>{doneTasksCount}</b> <span className="done-percent">
                                                    ({Number((doneTasksCount / totalTasksCount * 100).toFixed(2)) || 0}%)</span>
                                                    <ul>
                                                        <li>
                                                            Число прибыльных: <b>{profitableTasksCount}</b>
                                                        </li>
                                                        {profitableTasksCount > 0 && this.generateTaskInfo(mostProfitableTask, month.name, elem.year)}
                                                        <li>
                                                            Число убыточных: <b>{expensiveTasksCount}</b>
                                                        </li>
                                                        {expensiveTasksCount > 0 && this.generateTaskInfo(mostExpensiveTask, month.name, elem.year)}
                                                    </ul>
                                                </li>
                                                <li>
                                                    Доход за месяц: <b>{totalRevenue}</b>
                                                </li>
                                                <li>
                                                    Расход за месяц: <b>{totalExpense}</b>
                                                </li>
                                                <li>
                                                    Средний фин. результат за день: <b><span className={this.getClassName(avgResultPerDay)}>{Math.abs(avgResultPerDay)}</span></b>
                                                </li>
                                                <li>
                                                    Общий фин. результат за месяц: <b><span className={this.getClassName(totalResult)}>{Math.abs(totalResult)}</span></b>
                                                </li>
                                            </ol>
                                        </div>
                                    </section> :
                                    <span className="no-results">За этот месяц не было задач</span>
                                    }
                                </li>)
                            })}
                            <li className="month-stats-info">
                                <h3>Сводная статистика за {elem.year} г.</h3>

                                {elem.yearStats.totalTasksCount ? <section>
                                    <div className="stats-wrapper shown annual">
                                        <ol>
                                            <li>
                                                Общее число задач: <b>{elem.yearStats.totalTasksCount}</b>
                                            </li>
                                            <li>
                                                Общее число завершенных задач: <b>{elem.yearStats.doneTasksCount}</b> <span className="done-percent">
                                                ({Number((elem.yearStats.doneTasksCount / elem.yearStats.totalTasksCount * 100).toFixed(2)) || 0}%)</span>
                                            <ul>
                                                    <li>
                                                        Число прибыльных: <b>{elem.yearStats.profitableTasksCount}</b>
                                                    </li>
                                                    {elem.yearStats.profitableTasksCount > 0 && this.generateTaskInfo(elem.yearStats.mostProfitableTask, elem.yearStats.mostProfitableTask.month, elem.year)}
                                                    <li>
                                                        Число убыточных: <b>{elem.yearStats.expensiveTasksCount}</b>
                                                    </li>
                                                    {elem.yearStats.expensiveTasksCount > 0 && this.generateTaskInfo(elem.yearStats.mostExpensiveTask, elem.yearStats.mostExpensiveTask.month, elem.year)}
                                                </ul>
                                            </li>
                                            <li>
                                                Доход за год: <b>{elem.yearStats.totalRevenue}</b>
                                            </li>
                                            <li>
                                                Расход за год: <b>{elem.yearStats.totalExpense}</b>
                                            </li>
                                            {(() => {
                                                const avgResultPerDay = Number(((elem.yearStats.totalRevenue - elem.yearStats.totalExpense) * 86400000 / (new Date(elem.year, 11, 31) - new Date(elem.year, 0, 0))).toFixed(2));

                                                return (
                                                    <li>
                                                        Общий фин. результат за день: <b><span className={this.getClassName(avgResultPerDay)}>{Math.abs(avgResultPerDay)}</span></b>
                                                    </li>
                                                )
                                            })()}
                                            {(() => {
                                                const avgResultPerMonth = Number(((elem.yearStats.totalRevenue - elem.yearStats.totalExpense) / 12).toFixed(2));

                                                return (
                                                    <li>
                                                        Средний фин. результат за месяц: <b><span className={this.getClassName(avgResultPerMonth)}>{Math.abs(avgResultPerMonth)}</span></b>
                                                    </li>
                                                )
                                            })()}
                                            <li>
                                                Общий фин. результат за год: <b><span className={this.getClassName(elem.yearStats.totalResult)}>{Math.abs(elem.yearStats.totalResult)}</span></b>
                                            </li>
                                        </ol>
                                    </div>
                                </section> :
                                <span className="no-results">За этот год не было задач</span>
                            }
                            </li>
                        </ul>
                    </section>
                ))}

                <span className="end-of-stats">Больше нет сохраненных элементов</span>

            </section>
        )
    }
}

export default StatisticsPage
