'use strict'

// let SpinsAmount = 2,
//     SpinID = 000001,
//     PrizeCode = 1,
//     PrizeName = 'Название Приза',
//     Promocode = 'promocode2023'

// ПЕРЕМЕННЫЕ: 
// SpinsAmount - количество оставшихся прокруток (больше их мы не даём делать) integer
// SpinID - id прокрутки , его возвращаем ajax после того как колесо покрутилось integer 
// PrizeCode - Код приза , который должен выпасть integer
// PrizeName - название приза которое можно отображать после прокрутки  string
// Promocode - промокод на скидку , когда выпадает скидка чтобы его о отразить после прокрутки

// ПРИЗЫ:
// 0 - Скидка 50% на гайд
// 1 - KITCHENAID
// 2 - Чек-лист по Фуд-фото
// 3 - Деньги 30 000 ₽
// 4 - Скидка 25% на гайд
// 5 - Чек-лист по SMM
// 6 - Приз дня
// 7 - Деньги 5 000 ₽
// 8 - VIP тариф Caketeam
// 9 - Деньги 15 000₽

let rotates // Сколько вращений будет сделано (рандомно определяется в функции - от 4 до 9)
let wheel = document.querySelector('.wheel_inner')
let counter_value = document.querySelector('.counter_value')
let btn = document.querySelector('#start')
let gsap_rotating // здесь будет жить быстрая анимация прокрутки колеса

window.addEventListener('DOMContentLoaded', () => {
    console.log('[ DOM loaded! ༼ つ ◕_◕ ༽つ ]')
    wheel_init() // инициализируем колесо / кнопку, из полученных переменных
})

// POST запрос на сервер
let request = () => {
    axios.post('/scrolldone', {
        'done': SpinID
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}

// проверяет существует ли элемент на странице
let checker = (el) => {
    if (document.querySelector(el) !== null) {
        return true
    } else {
        return false
    }
}

// Инициализация 
let wheel_init = () => {
    console.log('Инициализация данных')
    counter_value.innerHTML = SpinsAmount
}

// СЧИТАЕМ СКОЛЬКО СПИНОВ ОСТАЛОСЬ
let spin_counter = () => {
    SpinsAmount -= 1
    counter_value.innerHTML = SpinsAmount
    if (SpinsAmount < 1) {
        let div = document.querySelector('#counter .counter_inner')
        div.style.display = 'block'
        div.innerHTML = 'К сожалению, у вас не осталось попыток. Совершайте покупки на <a href="https://naira-arina.ru" target="_blank">naira-arina.ru</a> и получайте попытки в «Колесе Фортуны»!'
        btn.classList.add('disabled')
        btn.style.display = "none"
    }
}

// бесконечная анимация прокрутки колеса
let wheel_rotating = gsap.to(document.querySelector('.wheel_inner'), 60, {
    rotation: -360,
    ease: 'linear',
    repeat: -1,
})

//появляение венка на фоне
gsap.from('#wheel_bg img', {
    rotate: 45,
    scale: 0.5,
    ease: 'exp1',
    duration: .3
})

// АНИМАЦИЯ ПРОКРУТКИ
let rotating = () => {
    gsap_rotating = gsap.timeline()
        .to('.wheel_inner', {
            rotate: 0,
            duration: 0
        })
        .to('.wheel_inner', {
            rotate: rotates,
            duration: 5,
            ease: CustomEase.create("custom", "M0,0 C0.11,0.494 0.2,1.01 0.604,1.01 0.672,1.01 0.768,0.989 0.824,0.988 0.868,0.986 0.975,1 1,1 ")
        })
        .then(setTimeout(() => { finish() }, 5400))
}

// ДО ПРОКРУТКИ
let start = () => {
    rotates = ((36 * PrizeCode) + (360 * 4)) * -1
    console.log('start')
    request()
    spin_counter()

    wheel_rotating.kill() // убираем бесконечную прокрутку колеса
    running()
}


// В ПРОЦЕССЕ ПРОКРУТКИ
let running = () => {
    console.log('running')

    btn_disable()
    rotating()
}

// ПО ЗАВЕРШЕНИИ ПРОКРУТКИ
let finish = () => {
    console.log('finish')
    modal_show()

    // btn_enable()
}

let btn_disable = () => {
    btn.classList.add('disabled')
}

// let btn_enable = () => {
//     if (SpinsAmount > 0) {
//         btn.classList.remove('disabled')
//     }
// }

let modal_show = () => {
    let modal = document.querySelector('#modal')
    let overlay = document.querySelector('#modal_overlay')

    modal.classList.remove('hide')
    overlay.classList.remove('hide')

    modal.querySelector('.modal_prize').innerHTML = PrizeName // подставляем название приза
    modal.querySelector('.modal_image').src = `./assets/images/dest/prizes/${PrizeCode}.png` // подставляем нужную картинку приза по ID

    if (SpinsAmount > 0) {
        modal.querySelector('.main_btn').innerHTML = 'Попробовать ещё'
    } else {
        modal.querySelector('.main_btn').innerHTML = 'Спасибо'
    }

    if (Discount === 'true') {
        modal.querySelector('.modal_message').innerHTML = `Вы можете воспользоваться скидкой при покупке <a href="https://guides.naira-arina.ru" target="_blank">новых гайдов</a>`
    } else {
        modal.querySelector('.modal_message').innerHTML = 'Скоро мы с вами свяжемся! :)'
    }
}

let modal_hide = () => {
    let modal = document.querySelector('#modal')

    modal.classList.add('hide')
    // перезагрузка страницы
    location.reload()
}



// Обрабатываем КЛИК
document.addEventListener('click', e => {
    let target = e.target

    if (target.matches('#start')) {
        start()
    }

    if (target.matches('.modal_close')) {
        modal_hide()
        console.log('asdasd')
    }

    // Copy to clipboard
    // if (target.matches('.clipboard')) {
    //     if (navigator.clipboard) {
    //         // поддержка имеется, включить соответствующую функцию проекта.
    //         navigator.clipboard.writeText(target.innerHTML)
    //             .then(() => {
    //                 // Получилось!
    //                 target.classList.add('tooltip')
    //                 setTimeout(() => {
    //                     target.classList.remove('tooltip')
    //                 }, 3000)
    //             })
    //             .catch(err => {
    //                 console.log('Ошибка: ', err);
    //             });
    //     } else {
    //         console.log('Браузер не поддерживает копирование в буфер обмена ^_____^')
    //         // поддержки нет. Придётся пользоваться execCommand или не включать эту функцию.
    //     }
    // }
})