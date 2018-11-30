import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class SelectMonthPage extends Component {

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    displayUserSelect() {
        document.querySelectorAll('.select-month label').forEach(elem => elem.classList.remove('radio-selected'));
        document.querySelectorAll('input:checked').forEach(elem => elem.parentElement.classList.add('radio-selected'))
    }

    render() {
        const { months, currentMonth, years, currentYear, submitMonth } = this.props;

        return (
            <section className="select-month">
                <form onChange={() => this.displayUserSelect()}>
                    <fieldset>
                        <legend>Месяц</legend>

                        {months.map(month => {
                            const ruMonth = new Date(`${month} ${currentYear}`).toLocaleDateString('ru-RU', { month: 'long' })

                            return (
                                <label
                                    key={month}
                                    className={month === currentMonth ? 'radio-selected' : ''}
                                    title={`Выбрать ${ruMonth}`}
                                >
                                    <input
                                        type="radio"
                                        id={`select-${month}`}
                                        name="radio-month"
                                        value={month}
                                        defaultChecked={month === currentMonth}
                                    />
                                    <span>{ruMonth}</span>
                                </label>
                        )})}
                    </fieldset>

                    <fieldset>
                        <legend>Год</legend>

                        {years.map(year => (
                            <label
                                key={year}
                                className={year.toString() === currentYear.toString() ? 'radio-selected' : ''}
                                title={`Выбрать ${year} год`}
                            >
                                <input
                                    type="radio"
                                    id={`select-${year}`}
                                    name="radio-year"
                                    value={year}
                                    defaultChecked={year.toString() === currentYear.toString()}
                                />
                                <span>{year}</span>
                            </label>
                        ))}

                    </fieldset>

                    <Link
                        to="/"
                        className="btn btn-cancel"
                        draggable="false"
                        title="Отмена"
                    >
                        Отмена
                    </Link>
                    <Link
                        to="/"
                        className="btn btn-submit"
                        onClick={() => submitMonth()}
                        draggable="false"
                        title="Применить"
                    >
                        Применить
                    </Link>
                </form>
            </section>

        )
    }
}

export default SelectMonthPage
