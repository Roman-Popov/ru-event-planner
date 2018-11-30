import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import RestorationUtility from './RestorationUtility';

class StoragePage extends Component {
    state = {
        usedSpace: this.props.getUsedSpace(),
        monthSizeInfo: [],
        storedKeys: Object.keys(localStorage).filter(key => /^[A-Z]+-20\d\d$/i.test(key)),
        showModal: false,
        deleteObject: '',
        confirmed: false,
    }

    componentWillMount() {
        this.getMonthSizeInfo()
    }

    componentWillUnmount() {
        document.querySelector('body').classList.remove('modal-shown');
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    getMonthSizeInfo = () => {
        const { getUsedSpace, totalSpace } = this.props,
            localStorageSpaceInfo = JSON.parse(localStorage.getItem('localStorageSpaceInfo')) || {},
            monthDataKeys = Object.keys(localStorage).filter(key => /^[A-Z]+-20\d\d$/i.test(key));

        localStorageSpaceInfo.used = getUsedSpace();
        // Information in the LocalStorage exists, so refresh it
        if (localStorageSpaceInfo.total) {
            localStorage.setItem('localStorageSpaceInfo', JSON.stringify(localStorageSpaceInfo));
        }

        const tmp = monthDataKeys.reduce((acc, curr) => {
            const month = curr.split('-')[0],
                year = curr.split('-')[1],
                monthDataSize = getUsedSpace(localStorage.getItem(curr)),
                monthDataSizePercentage = (monthDataSize / totalSpace * 100);

            let yearInstance = acc[year];

            if (yearInstance === undefined) {
                acc[year] = yearInstance = {};
                yearInstance.year = Number(year);
                yearInstance.months = [];
                yearInstance.size = 0;
                yearInstance.sizePercentage = 0;
            };

            yearInstance.size += monthDataSize;
            yearInstance.sizePercentage = Number((yearInstance.sizePercentage + monthDataSizePercentage).toFixed(2))

            yearInstance.months.push({
                name: month,
                monthNum: new Date(curr).getMonth(),
                size: monthDataSize,
                sizePercentage: Number(monthDataSizePercentage.toFixed(2))
            });

            return acc;
        }, {});

        const result = Object.keys(tmp).map(key => {
            tmp[key].months.sort((a, b) => a.monthNum - b.monthNum)

            return tmp[key]
        });

        result.sort((a, b) => a.year - b.year)

        this.setState({
            monthSizeInfo: result,
            storedKeys: monthDataKeys,
            usedSpace: localStorageSpaceInfo.used
        })
    }

    confirmDeletion = (obj) => {
        const inputField = document.getElementById('confirm-deletion');

        document.querySelector('body').classList.add('modal-shown');

        inputField.value = '';

        this.setState({
            showModal: true,
            confirmed: false,
            deleteObject: obj || '',
        })

        setTimeout(() => {
            inputField.focus()
        }, 500);
    }

    clearData = (e, obj) => {
        e.preventDefault();

        const { storedKeys } = this.state;

        let arrayToRemove = [];

        if (obj) {
            if (obj.month) {
                arrayToRemove.push(`${obj.month}-${obj.year}`);
            } else {
                arrayToRemove = storedKeys.filter(key => key.includes(obj.year));
            }
        }

        arrayToRemove.forEach(key => localStorage.removeItem(key));

        this.getMonthSizeInfo();

        this.setState({
            showModal: false,
            confirmed: false
        })
    }

    appReset = (hard) => {
        const monthDataKeys = hard === true ? Object.keys(localStorage).filter(key => /^[A-Z]+-20\d\d$/i.test(key)) : [],
            serviceInfoKeys = ['localStorageSpaceInfo'];

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations()
                .then(registrations => {
                    for (let registration of registrations) {
                        if (registration.scope.includes(process.env.PUBLIC_URL || '/')) registration.unregister()
                    }
                })
                .catch(() => alert('ServiceWorker error'))
                .then(() => [...monthDataKeys, ...serviceInfoKeys].forEach(key => localStorage.removeItem(key)))
                .catch(() => alert('Reset error'))
                .then(() => window.location.replace(process.env.PUBLIC_URL || '/'))
        } else {
            [...monthDataKeys, ...serviceInfoKeys].forEach(key => localStorage.removeItem(key));
            window.location.replace(process.env.PUBLIC_URL || '/');
        }
    }

    getDelText = (obj) => {
        let text = 'Удалить';

        if (obj === 'soft reset') {
            text += ' служебные данные'
        } else if (obj) {
            text += obj.month ? ` ${new Date(`${obj.month} ${obj.year}`).toLocaleDateString('ru-RU', {month: 'long'})} ${obj.year}` : ` ${obj.year} год`
        } else {
            text += ' все данные приложения'
        }

        return text
    }

    getBackupData = (name, type) => {
        const a = document.getElementById('backup-link'),
            text = JSON.stringify(localStorage),
            file = new Blob([text], { type: type });
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
    }

    render() {
        const { usedSpace, monthSizeInfo, showModal,
            deleteObject, confirmed, storedKeys } = this.state,
            { currentMonth, currentYear, updateDate,
            getUsedSpace, totalSpace, appSetLoading, isLoading } = this.props,
            usedPercentage = Number((usedSpace / totalSpace * 100).toFixed(2)),
            usedPercentageText = usedPercentage > 100 ? 100 : usedPercentage,
            serviceInfoPercentage = usedPercentageText - monthSizeInfo.reduce((acc, curr) => acc + curr.sizePercentage, 0)

        return (
            <section className='storage-management'>
                <div className="header-wrapper">
                    <header>
                        <Link to="/" className="btn btn-back" title="Вернуться к обзору месяца" draggable="false">Вернуться к обзору месяца</Link>
                        <div className="progress-bar">
                            <span className="progress-bar-title">
                                Использовано: {usedPercentageText}%
                            </span>
                            <div className="filler" style={{ '--usedSpace': usedPercentageText + '%'}}></div>
                            {[...Array(5).keys()].map(i =>
                                <div key={i} className="tick" data-percent={i * 25 + '%'} style={{ left: i * 25 + '%'}}></div>
                            )}
                        </div>

                        <a href="" id="backup-link" hidden={true}>Нажмите, чтобы загрузить резервную копию</a>
                        <button
                            className="btn btn-backup"
                            title="Загрузить резервную копию"
                            onClick={() => this.getBackupData(`TimeTable-${Date.now()}.json`, 'application/json')}
                        >
                            Загрузить резервную копию
                        </button>
                    </header>
                </div>

                {monthSizeInfo.map(elem => (
                    <section key={elem.year} className="group-year">
                        <div className="year-data-wrapper">
                            <div className="year-info">
                                {<time className="year-name">{elem.year}</time>}
                                <p className="year-size">{elem.sizePercentage > 0.1 ? elem.sizePercentage + '%' : 'менее 0.1%'}</p>
                            </div>

                            <ul>
                                {elem.months.map(month => (
                                    <li key={month.name} className="month-size-info">
                                        <div className="month-link-wrapper">
                                            <Link
                                                to="/"
                                                className="month-link"
                                                title={`Показать ${new Date(`${month.name}-${elem.year}`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`}
                                                onClick={() => updateDate(month.name, elem.year)}
                                                draggable="false"
                                            >
                                                <h3 className="month">{new Date(`${month.name}-${elem.year}`).toLocaleDateString('ru-RU', { month: 'long' })}</h3>
                                                <p className="size">
                                                    Объем: {month.sizePercentage > 0.1 ? month.sizePercentage + '%' : 'менее 0.1%'}
                                                </p>
                                            </Link>
                                            {(elem.year === currentYear && month.name === currentMonth) && <div className="current" title="Текущий отображаемый месяц"></div>}
                                        </div>

                                        <button
                                            className="btn btn-delete-month"
                                            onClick={() => this.confirmDeletion({ month: month.name, year: elem.year })}
                                            title={`Очистить данные за ${new Date(`${month.name}-${elem.year}`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`}
                                        >
                                            Clear {month.name} {elem.year} data
                                    </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="delete-year-wrapper">
                            <button
                                className="btn btn-delete-year"
                                onClick={() => this.confirmDeletion({ year: elem.year })}
                                title={`Очистить все данные за ${elem.year} г.`}
                            >
                                {`Очистить все данные за ${elem.year} г.`}
                            </button>
                        </div>

                    </section>
                ))}
                <section className="group-year">
                    <div className="year-info">
                        {<div className="year-name other">Другое</div>}
                    </div>
                    <ul>
                        <li className="month-size-info service-info">
                            <div className="month-link-wrapper">
                                <div className="month-link" title="Служебная информация не может быть удалена">
                                    <h3 className="month">Служебная информация</h3>
                                    <p className="size">Объем: {serviceInfoPercentage > 0.1 ? Number(serviceInfoPercentage.toFixed(2)) + '%' : 'менее 0.1%'}</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>

                <RestorationUtility
                    getMonthSizeInfo={this.getMonthSizeInfo}
                    monthSizeInfo={monthSizeInfo}
                    getUsedSpace={getUsedSpace}
                    appSetLoading={appSetLoading}
                    isLoading={isLoading}
                    storedKeys={storedKeys}
                    usedSpace={usedSpace}
                    totalSpace={totalSpace}
                />

                <section className="group-year app-reset">
                    <h2>Сброс приложения</h2>

                    <button
                        className="btn btn-reset"
                        onClick={() => this.confirmDeletion('soft reset')}
                        title="Удалить сервисные данные приложения, пользовательские данные не будут затронуты"
                    >
                        Мягкий сброс
                    </button>
                    <p className="reset-description">
                        Во время мягкого сброса будут удалены только служебные данные приложения,
                        данные пользователя не будут затронуты.
                    </p>


                    <div className="danger-zone">
                        <h2>Опасная зона</h2>
                        <button
                            className="btn btn-reset"
                            onClick={() => this.confirmDeletion()}
                            title="ОПАСНО! Удалить все данные приложения"
                        >
                            Полный сброс
                        </button>
                        <p className="reset-description">
                            Во время жесткого сброса <b>ВСЕ</b> данные приложения будут удалены
                            и не могут быть восстановлены без файла резервной копии
                        </p>
                    </div>
                </section>

                <div className={`modal-window ${showModal ? 'visible' : ''}`}>
                    <div className="message">
                        <h2><span className="modal-header">Внимание!</span></h2>
                        {deleteObject !== 'soft reset' && <p>Удаленные данные не могут быть восстановлены без файла резервной копии.</p>}
                        <p>
                            Вы действительно хотите удалить
                            {deleteObject === 'soft reset' ?
                                ' всю служебную информацию приложения' :
                                deleteObject ?
                                    ` все данные за ${deleteObject.month ? new Date(`${deleteObject.month} ${deleteObject.year}`).toLocaleDateString('ru-RU', {month: 'long'}) : ''} ${deleteObject.year} г.` :
                                    ' все данные приложения'
                            }?
                        </p>
                        <p>
                            Пожалуйста, введите следующий текст, чтобы подтвердить:
                            <br/>
                            "{this.getDelText(deleteObject)}"
                        </p>
                        <form
                            className="btn-wrapper"
                            onSubmit={(e) => {
                                if (deleteObject === 'soft reset') {
                                    this.appReset();
                                } else if (deleteObject) {
                                    this.clearData(e, deleteObject);
                                } else {
                                    this.appReset(true);
                                }
                                document.querySelector('body').classList.remove('modal-shown');
                            }}
                        >
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="confirm-deletion"
                                    autoComplete="off"
                                    placeholder={this.getDelText(deleteObject)}
                                    maxLength="40"
                                    onChange={(e) => {
                                        if (e.target.value === this.getDelText(deleteObject)) {
                                            this.setState({confirmed: true})
                                        } else {
                                            this.setState({ confirmed: false })
                                        }
                                    }}
                                />
                            </div>

                            <button
                                className="btn btn-no"
                                type="button"
                                onClick={() => {
                                    this.setState({ showModal: false });
                                    document.querySelector('body').classList.remove('modal-shown');
                                }}
                            >
                                Оставить
                            </button>
                            <button
                                className={`btn btn-yes ${confirmed ? '' : 'disabled'}`}
                                type="submit"
                                disabled={!confirmed}
                            >
                                Удалить
                            </button>

                        </form>

                    </div>
                </div>

            </section>
        )
    }
}

export default StoragePage
