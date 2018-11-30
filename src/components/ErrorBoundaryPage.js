import React, { Component } from 'react';

import emailIcon from '../icons/email.svg';
import gitHubIcon from '../icons/github.svg';
import linkedInIcon from '../icons/linkedin.svg';
import telegramIcon from '../icons/telegram.svg';
import vkIcon from '../icons/vkontakte.svg';

import ClipboardJS from 'clipboard';

class ErrorBoundaryPage extends Component {
    state = {
        errorText: null,
        error: null,
        errorInfo: null
    }

    componentDidCatch(error, errorInfo) {
        var clipboard = new ClipboardJS('.copy-to-clipboard');

        clipboard.on('success', function (e) {
            e.trigger.classList.add('success')

            setTimeout(() => {
                e.trigger.classList.remove('success')
            }, 1250);
            e.clearSelection();
        });

        clipboard.on('error', function (e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
        });

        this.setState({
            error: error,
            errorInfo: errorInfo,
            clipboard: clipboard
        })
    }

    componentWillUnmount() {
        this.state.clipboard && this.state.clipboard.destroy();
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
                .catch(() => alert('Ошибка в ServiceWorker'))
                .then(() => [...monthDataKeys, ...serviceInfoKeys].forEach(key => localStorage.removeItem(key)))
                .catch(() => alert('Ошибка сброса'))
                .then(() => window.location.replace(process.env.PUBLIC_URL || '/'))
        } else {
            [...monthDataKeys, ...serviceInfoKeys].forEach(key => localStorage.removeItem(key));
            window.location.replace(process.env.PUBLIC_URL || '/');
        }
    }

    render() {
        const { error, errorInfo } = this.state;

        if (errorInfo) {
            // Error path
            const subject = encodeURIComponent('Event-planner bug report'),
                location = window.location.href,
                shortErrStack = error.stack.split('\n').slice(0,6).join('\n'),
                description = encodeURIComponent(`Location: ${location}\n\nError: ${error.toString()}\n\nError stack: ${shortErrStack}\n\nError info componentStack: ${errorInfo.componentStack}`);

            window.scrollTo(0, 0);

            return (
                <section className="error-boundary-page">

                    <header>
                        <h2>...Упс!</h2>
                        <h2>Возникла ошибка!</h2>
                    </header>

                    <button
                        className="summary"
                        title="Раскрыть/убрать технические подробности"
                        onClick={(e) => {
                            const bugInfo = e.target.nextElementSibling;

                            bugInfo.classList.toggle('visible');
                            bugInfo.classList.contains('visible') ?
                                e.target.innerText = 'Скрыть технические подробности' :
                                e.target.innerText = 'Показать технические подробности';
                        }}
                    >
                        Показать технические подробности
                    </button>

                    <div className="bug-info-wrapper">
                        <article id="bug-info">
                            <div><b>Location:</b> {location}</div>
                            <div><b>Error:</b> {error.toString()}</div>
                            <div>
                                <b>Error stack:</b>
                                <ul>
                                    {error.stack.split('\n').map((line, index) => {
                                        return line ? (
                                            <li key={index}>{line}</li>
                                        ) : ''
                                    })}
                                </ul>
                            </div>
                            <div>
                                <b>Error componentStack:</b>
                                <ul>
                                    {errorInfo.componentStack.split('\n').map((line, index) => {
                                        return line ? (
                                            <li key={index}>{line}</li>
                                        ) : ''
                                    })}
                                </ul>

                            </div>
                        </article>

                        <div className="copy-panel">
                            <button
                                className="copy-to-clipboard btn"
                                data-clipboard-target="#bug-info"
                                title="Скопировать всю информацию в буфер обмена"
                            >
                                Скопировать
                            </button>
                        </div>
                    </div>

                    <a
                        href={`mailto:popov.r.k.18@gmail.com?subject=${subject}&body=${description}`}
                        className="btn btn-send-report"
                        title="Нажмите, чтобы создать email автоматически"
                        draggable="false"
                    >
                        Отправить отчет об ошибке
                    </a>

                    <p className="send-report-notes">Будет открыт Ваш почтовый клиент по умолчанию</p>

                    <div className="backup-btn-wrapper">
                        Вы также можете
                        <button
                            className="btn btn-download-backup"
                            title="Загрузить резервную копию"
                            onClick={() => {
                                const a = document.getElementById('err-boundary-backup-link'),
                                    text = JSON.stringify(localStorage),
                                    file = new Blob([text], { type: 'application/json' });
                                a.href = URL.createObjectURL(file);
                                a.download = `TimeTable-${Date.now()}.json`;
                                a.click();
                            }}
                        >
                            <span className="backup-icon"></span>Загрузить файл резервной копии
                        </button>
                        на всякий случай
                    </div>
                    <a href="" id="err-boundary-backup-link" hidden={true}>Загрузить резервную копию</a>

                    <button
                        href='/'
                        className="btn btn-go-main"
                        title="Перейти на главную страницу"
                        onClick={() => {
                            if ('serviceWorker' in navigator) {
                                navigator.serviceWorker.getRegistrations()
                                .then(registrations => {
                                    for (let registration of registrations) {
                                        registration.unregister()
                                    }
                                })
                                .then(() => window.location.replace(process.env.PUBLIC_URL || '/'))
                                .catch(() => alert('ServiceWorker error'))
                            }
                        }}
                    >
                        Перейти на главную страницу
                    </button>

                    <section className="application-reset">
                        <h2>Сброс приложения</h2>
                        <div className="btn-wrapper">
                            <button
                                className="btn btn-no"
                                onClick={() => window.confirm(
                                    'Внимание! Во время частичного сброса будут удалены только сервисные данные. ' +
                                    'Пользовательские данные затронуты не будут. ' +
                                    'Вы действительно хотите продолжить?'
                                ) ? this.appReset() : false}
                                title="Сбросить только сервисные данные, не затрагивая пользовательские"
                            >
                                Частичный
                            </button>
                            <button
                                className="btn btn-yes"
                                onClick={() => window.confirm(
                                    'Предупреждение! Во время полного сброса, ВСЕ данные приложения будут удалены. ' +
                                    'Удаленные данные НЕ МОГУТ БЫТЬ ВОССТАНОВЛЕНЫ без файла резервной копии. ' +
                                    'Вы действительно хотите продолжить?'
                                ) ? this.appReset(true) : false}
                                title={`Предупреждение! Во время полного сброса, ВСЕ данные приложения будут удалены. \nИх нельзя будет восстановить без файла резервной копии`}
                            >
                                Полный
                            </button>
                        </div>
                    </section>

                    <footer className="footer">
                        <aside>
                            <span className="copyright">© 2018 Roman Popov</span>
                            <div className="contacts">
                                <a href="mailto:popov.r.k.18@gmail.com" title="popov.r.k.18@gmail.com" draggable="false">
                                    Email <img src={emailIcon} alt="Email" />
                                </a>
                                <a href="https://github.com/Roman-Popov" title="GitHub" draggable="false">
                                    GitHub <img src={gitHubIcon} alt="GitHub" />
                                </a>
                                <a href="https://linkedin.com/in/-roman-popov-/" title="LinkedIn" draggable="false">
                                    LinkedIn <img src={linkedInIcon} alt="LinkedIn" />
                                </a>
                                <a href="https://t.me/Barmalew" title="Telegram" draggable="false">
                                    Telegram <img src={telegramIcon} alt="Telegram" />
                                </a>
                                <a href="https://vk.com/vk.popovroman" title="Vkontakte" draggable="false">
                                    Vkontakte <img src={vkIcon} alt="Vkontakte" />
                                </a>
                            </div>
                        </aside>
                    </footer>
                </section>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundaryPage
