import React, { Component } from 'react';


class RestorationUtility extends Component {
    state = {
        fileToLoad: null,
        containsRestoreData: true,
        dataToRestore: null,
        restoreAvailableSpace: null,
        restoreUsedSpace: null,
        restoreOption: 'дополнить',
        supplementOption: 'объединить'
    }

    componentDidUpdate(prevProps) {
        if ((this.props.usedSpace !== prevProps.usedSpace) && this.state.dataToRestore) this.restoreGetSpaceUsage()
    }

    uploadBackup = () => {
        const { appSetLoading, getUsedSpace } = this.props,
            { fileToLoad } = this.state;

        let loaded = false;

        if (fileToLoad) {
            const reader = new FileReader(),
                loadDisplayTimeout = setTimeout(() => {
                    if (!loaded) appSetLoading(true);
                }, 100);

            reader.onload = (e) => {
                const result = fileToLoad.type === 'application/json' ? JSON.parse(e.target.result) : {},
                    backupMonthDataKeys = Object.keys(result).filter(key => /^[A-Z]+-20\d\d$/i.test(key)),
                    dataToRestore = { months: backupMonthDataKeys, size: {} };

                if (backupMonthDataKeys.length === 0) {
                    this.setState({
                        dataToRestore: null,
                        containsRestoreData: false,
                        restoreOption: 'дополнить',
                        supplementOption: 'объединить'
                    })
                } else {
                    backupMonthDataKeys.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

                    backupMonthDataKeys.forEach(key => {
                        dataToRestore[key] = result[key]
                        dataToRestore.size[key] = getUsedSpace(result[key])
                    });

                    this.setState({ dataToRestore: dataToRestore, containsRestoreData: true })
                    this.restoreGetSpaceUsage()
                }

                document.querySelector('.restoration-wrapper').classList.add('visible')

                loaded = true;
                clearTimeout(loadDisplayTimeout);
                if (this.props.isLoading) appSetLoading(false);
            };

            reader.readAsText(fileToLoad);
        }
    }

    restoreData = () => {
        const { storedKeys } = this.props,
            { dataToRestore } = this.state,
            monthList = document.getElementById('months-list'),
            selectedMonths = [...monthList.querySelectorAll('.month-checkbox:checked')].map(month => month.value),
            overwrite = document.getElementById('restore-overwrite-all').checked,
            supplement = document.getElementById('restore-supplement').checked,
            replace = document.getElementById('suppl-replace').checked,
            merge = document.getElementById('suppl-merge').checked;

        let backupKeys = selectedMonths;

        if (!(supplement && replace) && selectedMonths.length > 0) {
            if (overwrite) {
                storedKeys.forEach(key => localStorage.removeItem(key))
            } else {
                if (merge) {
                    const duplicateMonths = selectedMonths.filter(month => storedKeys.includes(month));

                    duplicateMonths.forEach(month => {
                        const storedData = JSON.parse(localStorage.getItem(month)),
                            backupData = JSON.parse(dataToRestore[month]);

                        backupData.forEach((day, index) => {
                            if (day.tasks.length > 0) {
                                const textStoredTasks = JSON.stringify(storedData[index].tasks);

                                day.tasks.forEach(task => {
                                    if (!textStoredTasks.includes(JSON.stringify(task))) {
                                        storedData[index].tasks.push(task)
                                    }
                                })

                                if (!day.work) storedData[index].work = false;

                                storedData[index].tasks.sort((a, b) => {
                                    // "Day off" task will always be on top position
                                    if (a.name === 'Выходной') { return -1 } else if (b.name === 'Выходной') { return 1 }
                                    if (a.time > b.time) { return 1 } else { return -1 }
                                })
                            }

                            if (day.color) storedData[index].color = day.color;

                        })

                        localStorage.setItem(month, JSON.stringify(storedData))
                    })
                }
                backupKeys = selectedMonths.filter(month => !storedKeys.includes(month))
            }
        }
        backupKeys.forEach(key => localStorage.setItem(key, dataToRestore[key]));
        this.props.getMonthSizeInfo();
    }

    restoreGetSpaceUsage = () => {
        const { dataToRestore } = this.state,
            { monthSizeInfo, storedKeys, usedSpace, totalSpace } = this.props,
            usedPercentage = Number((usedSpace / totalSpace * 100).toFixed(2)),
            availableStoragePercentage = usedPercentage < 100 ? Number((100 - usedPercentage).toFixed(2)) : 0;

        const monthList = document.getElementById('months-list'),
            selectedMonths = [...monthList.querySelectorAll('.month-checkbox:checked')].map(month => month.value),
            overwrite = document.getElementById('restore-overwrite-all').checked,
            notCopy = document.getElementById('suppl-not-copy').checked,
            replace = document.getElementById('suppl-replace').checked,
            supplOption = document.getElementById('supplement-option');

        function getSize(arr) {
            const sizeOfSelected = arr.reduce((acc, curr) => acc + dataToRestore.size[curr], 0);

            return Number((sizeOfSelected / totalSpace * 100).toFixed(2));
        }

        let availableSpacePercentage = availableStoragePercentage,
            sizeOfSelectedPercentage = getSize(selectedMonths);

        if (overwrite) {
            availableSpacePercentage = 100;
            supplOption.disabled = true;
        } else {
            supplOption.disabled = false;
            if (notCopy) {
                const nonDuplicateMonths = selectedMonths.filter(month => !storedKeys.includes(month));
                sizeOfSelectedPercentage = getSize(nonDuplicateMonths);

            } else if (replace) {
                const duplicateMonths = selectedMonths.filter(month => storedKeys.includes(month)),
                    sizeOfSelected = duplicateMonths.reduce((acc, curr) => {
                        const monthYear = curr.split('-'),
                            year = Number(monthYear.pop()),
                            monthName = monthYear.pop(),
                            size = monthSizeInfo
                                .find(elem => elem.year === year).months
                                .find(month => month.name === monthName).size

                        return acc + size
                    }, 0)

                availableSpacePercentage = Number((availableSpacePercentage + sizeOfSelected / totalSpace * 100).toFixed(2));
            }
        }
        this.setState({ restoreAvailableSpace: availableSpacePercentage, restoreUsedSpace: sizeOfSelectedPercentage })
    }

    getModeText = (elem) => {
        const warningText = document.getElementById('supplement-method')

        const id = elem.id;

        let restoreOption = null,
            supplementOption = null;

        switch (id) {
            case 'restore-overwrite-all':
                restoreOption = 'перезаписать'
                break;

            case 'restore-supplement':
                restoreOption = 'дополнить'
                break;

            case 'suppl-not-copy':
                supplementOption = 'не копировать'
                warningText.innerText = 'не будут скопированы'
                break;

            case 'suppl-replace':
                supplementOption = 'заменить'
                warningText.innerText = 'будут заменены'
                break;

            case 'suppl-merge':
                supplementOption = 'объединить'
                warningText.innerText = 'будут объединены'
                break;

            default:
                break;
        }

        if (!restoreOption) restoreOption = this.state.restoreOption;
        if (!supplementOption) supplementOption = this.state.supplementOption;

        this.setState({ restoreOption: restoreOption, supplementOption: supplementOption })
    }

    render() {
        const { fileToLoad, containsRestoreData, dataToRestore,
            restoreUsedSpace, restoreAvailableSpace, restoreOption, supplementOption } = this.state,
            { storedKeys, totalSpace } = this.props;

        return (
            <section className="group-year upload">
                <h2>Загрузить данные из файла</h2>

                <div className="select-file-wrapper">
                    <div className="upload-input-wrapper">
                        <div className="btn-browse-wrapper">
                            <button
                                className="btn btn-browse"
                                title="Выберите файл с данными на Вашем устройстве"
                                onClick={() => document.getElementById('load-json').click()}
                            >
                                <span>Обзор...</span>
                            </button>
                        </div>
                        <label title="Выберите файл с данными на Вашем устройстве">
                            <input
                                type="file"
                                id="load-json"
                                accept="application/json"
                                onChange={(e) => {
                                    const fileInput = e.target,
                                        file = fileInput.files.length ? fileInput.files[0] : null,
                                        restorationWrapper = document.querySelector('.restoration-wrapper'),
                                        auxiliaryElement = document.getElementById('auxiliary-element');

                                    auxiliaryElement.style.height = restorationWrapper.offsetHeight + 'px';
                                    restorationWrapper.classList.remove('visible')

                                    this.setState({
                                        fileToLoad: file,
                                        dataToRestore: file ? dataToRestore : null,
                                        restoreOption: file ? restoreOption : 'дополнить',
                                        supplementOption: file ? supplementOption : 'объединить'
                                    })
                                }}
                            />
                            <span style={fileToLoad ? {} : { color: 'silver' }}>{fileToLoad ? fileToLoad.name : 'Файл не выбран'}</span>
                        </label>
                    </div>

                    <button
                        className={`btn btn-upload ${fileToLoad ? '' : 'disabled'}`}
                        disabled={!fileToLoad}
                        title={fileToLoad ? 'Начать загрузку выбранного файла' : 'Не выбран файл для загрузки'}
                        onClick={() => {
                            document.getElementById('auxiliary-element').style.height = '0px'
                            this.uploadBackup()
                        }}
                    >
                        Загрузить
                    </button>
                </div>

                <section className="restoration-wrapper">
                    {/* For smooth scrolling */}
                    <div id='auxiliary-element'></div>

                    {!containsRestoreData &&
                    <div className="selection-wrapper shown">
                        <p>Этот файл не содержит данных для восстановления. Пожалуйста, выберите другой файл.</p>
                    </div>}

                    {dataToRestore &&
                    <div>
                        <h3>Выберите данные, которые следует восстановить</h3>

                        <p className="file-info">
                            {(() => {
                                const fileDateTime = fileToLoad.lastModifiedDate,
                                    date = fileDateTime.toLocaleDateString('ru-RU'),
                                    time = fileDateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                                    text = `Эта резервная копия была создана ${date} в ${time}`

                                return text
                            })()}
                        </p>

                        <div className="selection-wrapper shown">
                            <header>
                                <label title="Выбрать все">
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        className="month-checkbox"
                                        name="select-all"
                                        value="Select all data"
                                        defaultChecked={false}
                                        onChange={(e) => {
                                            const checkboxes = document.querySelectorAll('#months-list input.month-checkbox')

                                            if (e.target.checked) {
                                                checkboxes.forEach(checkbox => checkbox.checked = true)
                                            } else {
                                                checkboxes.forEach(checkbox => checkbox.checked = false)
                                            }

                                            this.restoreGetSpaceUsage();
                                        }}
                                    />
                                    <span className="checkmark"></span>
                                </label>

                                <h4>Месяцы</h4>

                                <p>
                                    <span className={`selected ${restoreUsedSpace > restoreAvailableSpace ? 'overload' : ''}`}>
                                        {restoreUsedSpace || 0}%
                                        {(supplementOption === 'объединить' && restoreOption === 'дополнить') &&
                                        <b
                                            className="merge"
                                            title={"Фактический размер может быть меньше указанного. \nВ случае перерасхода памяти попробуйте отметить часть данных и повторить несколько раз."}
                                        >*</b>}
                                    </span>
                                    <span className="available">{restoreAvailableSpace || 100}%</span>
                                </p>
                            </header>

                            <form id="months-list" className="months-list" onChange={() => this.restoreGetSpaceUsage()}>
                                {dataToRestore.months.map((month, index) => (
                                    <label key={index} title="Выберите данные, которые следует восстановить">
                                        <span>
                                            <input
                                                type="checkbox"
                                                className="month-checkbox"
                                                name="restore"
                                                value={month}
                                                defaultChecked={!storedKeys.includes(month)}
                                            />
                                            <span className="checkmark"></span>
                                            <span className={`month-name ${(storedKeys.includes(month) && restoreOption === 'дополнить') ? 'double' : ''}`}>{new Date(month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
                                        </span>
                                        <span
                                            className="backup-month-size"
                                            title={`Объем данных за ${new Date(month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`}
                                        >
                                            {Number((dataToRestore.size[month] / totalSpace * 100).toFixed(2))}%
                                        </span>
                                    </label>
                                ))}

                                {(dataToRestore.months.some(month => storedKeys.includes(month)) && restoreOption === 'дополнить') &&
                                    <div className="warning">
                                        <button
                                            type="button"
                                            className="btn btn-close-banner"
                                            title="Закрыть предупреждение"
                                            onClick={(e) => e.target.parentElement.style.display = 'none'}
                                        >
                                            Закрыть предупреждение
                                </button>
                                        <p>
                                            − Данные за указанные месяцы уже имеются в хранилище. <br />
                                            <span>Если они будут выбраны - они <span id="supplement-method">будут объединены</span></span>
                                        </p>
                                    </div>}
                            </form>
                        </div>

                        <div className="options-toggle">
                            <button
                                className="summary"
                                title="Показать/скрыть опции восстановления"
                                onClick={(e) => {
                                    const options = e.target.parentElement.nextElementSibling,
                                        current = e.target.nextElementSibling;

                                    current.classList.toggle('shown');
                                    options.classList.toggle('visible');
                                    options.classList.contains('visible') ?
                                        e.target.innerText = 'Скрыть опции восстановления' :
                                        e.target.innerText = 'Показать опции восстановления';
                                }}
                            >
                                Показать опции восстановления
                            </button>

                            <span className="current-options shown">(Текущие: {restoreOption}{ restoreOption === 'дополнить' && supplementOption ? `, ${supplementOption}` : ''})</span>
                        </div>

                        <div className="options-wrapper">
                            <form onChange={(e) => {this.restoreGetSpaceUsage(); this.getModeText(e.target)}}>
                                <fieldset>
                                    <legend>Способ восстановления</legend>

                                    <label title="Выбрать способ восстановления">
                                        <input
                                            type="radio"
                                            id="restore-overwrite-all"
                                            name="restore-option"
                                            value="Overwrite all"
                                            defaultChecked={false}
                                        />
                                        <span className="radio-checkmark"></span>
                                        <span>Перезаписать всю сохраненную информацию</span>
                                    </label>

                                    <label title="Выбрать способ восстановления">
                                        <input
                                            type="radio"
                                            id="restore-supplement"
                                            name="restore-option"
                                            value="Supplement existing information"
                                            defaultChecked={true}
                                        />
                                        <span className="radio-checkmark"></span>
                                        <span>Дополнить существующую информацию</span>
                                    </label>
                                </fieldset>

                                <fieldset id="supplement-option">
                                    <legend>Метод дополнения</legend>
                                    <p className="hint">Что делать с дублирующимися месяцами?</p>

                                    <label title="Выбрать метод дополнения">
                                        <input
                                            type="radio"
                                            id="suppl-not-copy"
                                            name="supplement-option"
                                            value="Не копировать"
                                            defaultChecked={false}
                                        />
                                        <span className="radio-checkmark"></span>
                                        <span>Не копировать</span>
                                    </label>

                                    <label title="Выбрать метод дополнения">
                                        <input
                                            type="radio"
                                            id="suppl-replace"
                                            name="supplement-option"
                                            value="Заменить"
                                            defaultChecked={false}
                                        />
                                        <span className="radio-checkmark"></span>
                                        <span>Заменить</span>
                                    </label>

                                    <label title="Выбрать метод дополнения">
                                        <input
                                            type="radio"
                                            id="suppl-merge"
                                            name="supplement-option"
                                            value="Объединить"
                                            defaultChecked={true}
                                        />
                                        <span className="radio-checkmark"></span>
                                        <span>Объединить</span>
                                    </label>
                                </fieldset>
                            </form>
                        </div>

                        <div className="btn-wrapper">
                            <button
                                className="btn"
                                title="Отменить восстановление"
                                onClick={() => document.querySelector('.restoration-wrapper').classList.remove('visible')}
                            >
                                Отменить
                            </button>
                            <button
                                className={`btn btn-restore ${restoreUsedSpace > restoreAvailableSpace ? 'disabled' : ''}`}
                                title={restoreUsedSpace > 0.05 ?
                                    'Недостаточно места в памяти приложения для добавления выбранных позиций' :
                                    'Добавить отмеченные позиции в хранилище приложения'}
                                disabled={restoreUsedSpace > restoreAvailableSpace}
                                onClick={() => { document.querySelector('.restoration-wrapper').classList.remove('visible'); this.restoreData()}}
                            >
                                {restoreOption}
                            </button>
                        </div>
                    </div>}
                </section>
            </section>
        )
    }
}

export default RestorationUtility
