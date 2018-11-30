import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import './App.css';

import Header from './components/Header';
import MainPage from './components/MainPage';
import SearchPage from './components/SearchPage';
import SelectMonthPage from './components/SelectMonthPage';
import ManageTaskPage from './components/ManageTaskPage';
import DayDetailsPage from './components/DayDetailsPage';
import InstructionsPage from './components/InstructionsPage';
import StoragePage from './components/StoragePage';
import StatisticsPage from './components/StatisticsPage';
import ErrorBoundaryPage from './components/ErrorBoundaryPage';

class App extends Component {
    state = {
        isLoading: false,
        lsSpaceInfo: JSON.parse(localStorage.getItem('localStorageSpaceInfo')) ||
            { total: 4981036 /* typical */, used: 0 },
        months: ['January', 'February', 'March',
            'April', 'May', 'June',
            'July', 'August', 'September',
            'October', 'November', 'December'],
        years: [],
        currentMonth: '',
        currentYear: '',
        daysInMonth: '',
        dayData: null,
        editData: null,
        addTaskDateValue: '',
        addTaskTimeValue: '',
        lastSearchString: '',
        scrollY: 0
    }

    componentWillMount() {
        const currentDate = new Date(),
            currentMonth = this.state.months[currentDate.getMonth()],
            currentYear = currentDate.getFullYear(),
            daysInMonth = this.GetDaysInMonth(currentDate.getMonth(), currentYear),
            years = [],
            // Note: 'en-GB' was selected because it matches to time input format
            addTaskDateValue = currentDate.toLocaleDateString('en-GB').split('/').reverse().join('-'),
            addTaskTimeValue = currentDate.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric' })

        for (let i = 0; i < 5; i++) {
            years.push(currentYear + 1 - i)
        }

        this.setState({
            years: years,
            currentMonth: currentMonth,
            currentYear: currentYear,
            daysInMonth: daysInMonth,
            addTaskDateValue: addTaskDateValue,
            addTaskTimeValue: addTaskTimeValue
        })
    }

    componentDidMount() {
        const lsSpaceInfo = JSON.parse(localStorage.getItem('localStorageSpaceInfo'));

        !lsSpaceInfo && this.appSetLoading(true)

        setTimeout(() => {
            const usedLocalSpace = this.testLocalStorageSize.getUsedSpaceInBytes();

            let localStorageQuota = lsSpaceInfo ? lsSpaceInfo.total : undefined;

            if (!localStorageQuota) {
                const unusedLocalSpace = this.testLocalStorageSize.getUnusedSpaceInBytes();
                localStorageQuota = Math.round((usedLocalSpace + unusedLocalSpace) * 0.95); // 5% - reserved space
            }

            const localStorageSpaceInfo = {
                total: localStorageQuota,
                used: usedLocalSpace,
            }

            localStorage.setItem('localStorageSpaceInfo', JSON.stringify(localStorageSpaceInfo))
            this.setState({ lsSpaceInfo: localStorageSpaceInfo })
        }, 1000);
    }

    testLocalStorageSize = {
        getUsedSpaceInBytes: (elem) => {
            return new Blob([JSON.stringify(elem || localStorage)]).size;
        },

        getUnusedSpaceInBytes: () => {
            const testQuotaKey = 'testQuota',
                startTime = new Date(),
                timeout = 20000;
            let maxByteSize = 10485760, // 10MiB
                minByteSize = 0,
                tryByteSize = 0,
                runtime = 0,
                unusedSpace = 0;

            !this.state.isLoading && this.appSetLoading(true)

            do {
                runtime = new Date() - startTime;
                try {
                    tryByteSize = Math.floor((maxByteSize + minByteSize) / 2);
                    localStorage.setItem(testQuotaKey, new Array(tryByteSize).join('1'));
                    minByteSize = tryByteSize;
                } catch (e) {
                    maxByteSize = tryByteSize - 1;
                }
            } while ((maxByteSize - minByteSize > 1) && runtime < timeout);

            localStorage.removeItem(testQuotaKey);

            if (runtime >= timeout) {
                alert("Calculation of LocalStorage's free space was off due to timeout.");
            }

            this.appSetLoading(false)

            // Compensate for the byte size of the key that was used,
            // then subtract 1 byte because the last value of the tryByteSize threw the exception
            unusedSpace = tryByteSize + testQuotaKey.length - 1;
            return unusedSpace;
        }
    }

    submitMonth = () => {
        const selectedMonth = document.querySelector('input[name="radio-month"]:checked').value,
            selectedYear = document.querySelector('input[name="radio-year"]:checked').value;

        this.updateDate(selectedMonth, selectedYear);
    }

    GetDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate()
    }

    updateDate = (month, year) => {
        if (month !== this.state.currentMonth || year !== this.state.currentYear) {
            this.setState({
                currentMonth: month,
                currentYear: Number(year),
                daysInMonth: this.GetDaysInMonth(this.state.months.indexOf(month), year)
            })
        }
    }

    updateLastSearch = (query) => {
        this.setState({
            lastSearchString: query,
            dayData: null
        })
    }

    initLocalData = (month, year) => {
        const { currentYear, months, currentMonth } = this.state,
            localMonth = (month || currentMonth),
            localYear = (year || currentYear),
            daysInMonth = this.GetDaysInMonth(months.indexOf(month), localYear),
            localDataName = `${localMonth}-${localYear}`,
            storedData = localStorage.getItem(localDataName),
            initialData = [];

        if (!storedData) {
            for (let i = 0; i < daysInMonth; i++) {
                const weekdayName = new Date(localYear, months.indexOf(localMonth), i + 1).toLocaleString('en-GB', { weekday: 'long' }),
                    dayData = {
                        day: i + 1,
                        wdName: weekdayName,
                        work: true,
                        tasks: []
                    };
                initialData.push(dayData)
            }
            localStorage.setItem(localDataName, JSON.stringify(initialData));
        }
        return initialData.length ? initialData : JSON.parse(storedData)
    }

    dateTimeValueToState = (date, time) => {
        this.setState((state) => ({
            addTaskDateValue: date ? date : state.addTaskDateValue,
            addTaskTimeValue: time ? time : state.addTaskTimeValue
        }))
    }

    dayDataToState = (dayData, callback) => {
        this.setState({ dayData: dayData }, typeof(callback) === 'function' ? callback : undefined)
    }

    editDataToState = (dayData, task) => {
        if (dayData && task) {
            this.setState({ editData: { dayData: dayData, task: task } })
        } else {
            this.setState({ editData: null })
        }
    }

    appForceUpdate = () => {
        this.forceUpdate()
    }

    appSetLoading = (status) => {
        this.setState({ isLoading: status })
    }

    setInitialScroll = (scrollValue) => {
        this.setState({ scrollY: scrollValue })
    }

    render() {
        const { scrollY, isLoading, lsSpaceInfo, months, currentMonth, years, currentYear, daysInMonth,
            dayData, addTaskDateValue, addTaskTimeValue, lastSearchString, editData } = this.state;

        return (
            <div className="App">
                {isLoading && <aside className="loading">
                    <div className="spinner"></div>
                    <p>Загрузка...</p>
                    <p>Пожалуйста, подождите</p>
                </aside>}

                <ErrorBoundaryPage>
                    <Header
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        updateLastSearch={this.updateLastSearch}
                        editData={editData}
                    />
                </ErrorBoundaryPage>


                <Route path="/select-month" render={() => (
                    <ErrorBoundaryPage>
                        <SelectMonthPage
                            months={months}
                            currentMonth={currentMonth}
                            years={years}
                            currentYear={currentYear}
                            submitMonth={this.submitMonth}
                        />
                    </ErrorBoundaryPage>
                )} />

                <Route exact path="/" render={() => (
                    <ErrorBoundaryPage>
                        <MainPage
                            scrollY={scrollY}
                            setInitialScroll={this.setInitialScroll}
                            months={months}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            daysInMonth={daysInMonth}
                            initLocalData={this.initLocalData}
                            dayDataToState={this.dayDataToState}
                        />
                    </ErrorBoundaryPage>
                )} />

                <Route path={`${/(add-task|edit-task)/}`} render={() => (
                    <ErrorBoundaryPage>
                        <ManageTaskPage
                            months={months}
                            currentMonth={currentMonth}
                            years={years}
                            currentYear={currentYear}
                            initLocalData={this.initLocalData}
                            initialTaskDate={addTaskDateValue}
                            initialTaskTime={addTaskTimeValue}
                            dateTimeValueToState={this.dateTimeValueToState}
                            editData={editData}
                            editDataToState={this.editDataToState}
                            getUsedSpace={this.testLocalStorageSize.getUsedSpaceInBytes}
                            totalSpace={lsSpaceInfo.total}
                            appForceUpdate={this.appForceUpdate}
                        />
                    </ErrorBoundaryPage>
                )} />

                <Route path="/search" render={() => (
                    <ErrorBoundaryPage>
                        <SearchPage
                            lastSearchString={lastSearchString}
                            updateLastSearch={this.updateLastSearch}
                        />
                    </ErrorBoundaryPage>
                )} />

                <Route path="/day-details" render={() => (
                    <ErrorBoundaryPage>
                        <DayDetailsPage
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            dayData={dayData}
                            dayDataToState={this.dayDataToState}
                            editDataToState={this.editDataToState}
                            updateDate={this.updateDate}
                        />
                    </ErrorBoundaryPage>
                )} />

                <Route path="/instructions" render={() => (
                    <ErrorBoundaryPage>
                        <InstructionsPage />
                    </ErrorBoundaryPage>
                )} />

                <Route path="/storage-management" render={() => (
                    <ErrorBoundaryPage>
                        <StoragePage
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            getUsedSpace={this.testLocalStorageSize.getUsedSpaceInBytes}
                            totalSpace={lsSpaceInfo.total}
                            updateDate={this.updateDate}
                            isLoading={isLoading}
                            appSetLoading={this.appSetLoading}
                        />
                    </ErrorBoundaryPage>
                )} />

                <Route path="/statistics" render={() => (
                    <ErrorBoundaryPage>
                        <StatisticsPage
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            updateDate={this.updateDate}
                            dayDataToState={this.dayDataToState}
                        />
                    </ErrorBoundaryPage>
                )} />

            </div>
        );
    }
}

export default App;
