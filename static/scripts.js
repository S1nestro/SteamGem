const video = document.getElementById('video-background');
const volumeControl = document.getElementById('volume-control');

// һ����Ƶ���Բ��ţ�ȡ������
video.addEventListener('canplay', () => {
    video.muted = false;
});

// �����������ƻ����ֵ�����¼�
volumeControl.addEventListener('input', () => {
    video.volume = volumeControl.value;
});

// ������ĺ�������� http://localhost:5000
const backendUrl = 'http://localhost:5000/receive-data';

function sendUserData() {
    const userId = document.getElementById('user-id').value;
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game-type"]');
    const gameTypes = Array.from(gameTypeCheckboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    const fromMonth1 = document.getElementById('from-month1').value;
    const fromYear1 = document.getElementById('from-year1').value;
    const fromMonth2 = document.getElementById('from-month2').value;
    const fromYear2 = document.getElementById('from-year2').value;
    const timeLimitation = `${fromYear1}-${fromMonth1},${fromYear2}-${fromMonth2}`;

    fetch('http://localhost:5000/receive-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',  // ������������Ϊ������
        },
        body: new URLSearchParams({
            user_id: userId,
            game_type: gameTypes,
            time_limitation: timeLimitation
        })  // �����ݱ���ΪURL��ѯ�ַ���
    })
        .then(response => response.json())
        .then(data => {
            const responseData = data; // ����� data ���������Ϸ�����б�
        // ... �������� ...
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}
// �����˷��ص����ݱ����ڱ��� responseData ��
/*
const responseData = [
    {
        name: "Game 1",
        image: "https://th.bing.com/th/id/OIP.ihxvoWLVFZ8WtxBodfe7GQHaFO?pid=ImgDet&rs=1",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "The project embodies a concerted effort to blend image processing, digit recognition, and interactive web design to foster a dynamic platform for Sudoku enthusiasts.",
        price: "The challenges encountered have paved the way for a clear delineation of future work, focused on honing the accuracy and user interaction further. This project not only provides a practical solution to a real-world problem but also serves as a valuable learning experience in applying theoretical knowledge in image processing and machine learning in a real-world scenario."
    },
];
*/
// ����ȫ�ֱ���
let recommendationsShown = false;
let currentGameIndex;
let nameClicked = false
//���������ȫ�ֱ���
let progressBarValue = 0;
let progressBarInterval;
let carouselInterval;
let carouselDisplayed = false;


//���½�����
function updateProgressBar() {
    // ������еĽ�������ʱ��
    clearInterval(progressBarInterval);

    progressBarInterval = setInterval(() => {
        // ÿ��ʱ�������ӽ�������ֵ
        progressBarValue += 2;  // ÿ100��������2%���ܹ���Ҫ5�루5000���룩��0%������100%

        // ���½������Ŀ��
        document.getElementById('progress-bar').style.width = progressBarValue + '%';

        // ��������ֵ�ﵽ100%ʱ�������ʱ������ʾ�ֲ�ͼ
        if (progressBarValue >= 100) {
            clearInterval(progressBarInterval);
            if (!carouselDisplayed) {
                displayCarousel();
            }
        }

        // ����ֲ�ͼ����ʾ�����ý�����ֵ�������ʱ��
        if (carouselDisplayed) {
            progressBarValue = 0;
            document.getElementById('progress-bar').style.width = '0%';
            clearInterval(progressBarInterval);
        }
    }, 100);  // 100�������һ�ν�����ֵ
}

function displayCarousel() {
    // ��������ʾ�ֲ�ͼ�Ĵ���
    carouselDisplayed = true;
}
function displayRecommendations() {
    currentGameIndex = 0;
    // ����ɵ��Ƽ�
    const gamesList = document.getElementById('games-list');
    const carousel = document.getElementById('carousel');
    gamesList.innerHTML = '';
    carousel.innerHTML = '';

    // ��DOM��ȡ����
    const userId = document.getElementById('user-id').value;
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game-type"]');
    const selectedGameTypes = Array.from(gameTypeCheckboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    const fromMonth1 = document.getElementById('from-month1').value;
    const fromYear1 = document.getElementById('from-year1').value;
    const fromMonth2 = document.getElementById('from-month2').value;
    const fromYear2 = document.getElementById('from-year2').value;

    // ��������װ��һ������
    const dataToSend = {
        userId: userId,
        gameTypes: selectedGameTypes,
        fromDate: `${fromYear1}-${fromMonth1}`,
        toDate: `${fromYear2}-${fromMonth2}`
    };

    // ʹ��fetch�������ݵ����
    fetch('/receive-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    })
        .then(response => response.json())
        .then(data => {
            // ����Ӧ��������ΪresponseData
            responseData = data;

            // Ȼ����ø���UI�ĺ���
            updateCarousel();
        })
        .catch(error => {
            console.error('Error:', error);
        });


    let gameGroup = null;
    responseData.forEach((game, index) => {
        if (index % 2 === 0) {  // ����ż�������������µ���Ϸ��
            gameGroup = document.createElement('div');
            gameGroup.className = 'game-group';
            gamesList.appendChild(gameGroup);
        }

        // ������Ϸ�б���
        const gameListItem = document.createElement('div');
        gameListItem.className = 'game-item';
        gameListItem.innerText = game.name;
        gameListItem.dataset.reason = game.reason;  // �������ԣ���Ϸ�Ƽ�ԭ��
        gameListItem.dataset.price = game.price;    // �������ԣ���Ϸ�۸�

        gameGroup.appendChild(gameListItem);
        // �����ֲ���
        const gameDiv = document.createElement('div');
        gameDiv.className = 'carousel-item';  // ��������Ա��� CSS ��Ӧ����ʽ
        gameDiv.innerHTML = `
            <a href="${game.link}" target="_blank">
                <img src="${game.image}" alt="${game.name}">
            </a>
            <div class="game-info"></div>  <!-- ������Ϸ��Ϣ���� -->
        `;
        carousel.appendChild(gameDiv);
    });

    // ��������״���ʾ�Ƽ�������ʾ�����"Try Again"��ť
    if (!recommendationsShown) {
        const gameTitle = document.getElementById('game-title');
        const tryAgainButton = document.getElementById('try-again-button');
        gameTitle.style.display = 'block';
        tryAgainButton.style.display = 'block';

        recommendationsShown = true;
    }


    updateCarousel();

    // ���ذ�ťֱ���Ƽ�����ʾ
    document.getElementById('prev-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'none';

        // ��̬����Բ��ǰ�������#carousel-dots
    const carouselDots = document.getElementById('carousel-dots');
    carouselDots.innerHTML = '';
    // ��̬����Բ��
    responseData.forEach((game, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = index;
        carouselDots.appendChild(dot);
    });

    updateCarousel();

    // ��չʾ�Ƽ�ʱ�ı䷽��Ĵ�С
    const overlayBox = document.getElementById('overlay-box');
    overlayBox.style.height = '345px';
    updateProgressBar();  // ����ʾ�Ƽ�ʱ��ʼ���н�����
}

function updateDots() {
    const dots = document.querySelectorAll('#carousel-dots .dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    if (dots.length > 0) {
        dots[currentGameIndex].classList.add('active');  // ��� dots ����ĳ���
    }
}

document.getElementById('carousel-dots').addEventListener('click', (event) => {
    if (event.target.classList.contains('dot')) {
        currentGameIndex = parseInt(event.target.dataset.index);
        updateCarousel();
    }
});
function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const transformValue = -currentGameIndex * 100;
    carousel.style.transform = `translateX(${transformValue}%)`;

    // ���Ƽ�����ʾʱ����ʾ��ť
    document.getElementById('prev-button').style.display = 'block';
    document.getElementById('next-button').style.display = 'block';

    hideMoreInfo();  // ���� hideMoreInfo ���������� .game-info Ԫ�ص�����
    // ���µ�ǰ��ʾ����Ϸ���ֺ������ʾ
    const currentGame = responseData[currentGameIndex];
    const carouselItems = carousel.getElementsByClassName('carousel-item');
    Array.from(carouselItems).forEach((item, index) => {
        const gameInfo = item.getElementsByClassName('game-info')[0];
        gameInfo.innerHTML = `
            <span class="game-name" data-reason="${currentGame.reason}" data-price="${currentGame.price}">
                ${currentGame.name}
            </span>
            <span class="more-info"> <- Click to obtain more relevant information</span>
        `;
    });

    updateDots();
}

document.getElementById('prev-button').addEventListener('click', () => {
    currentGameIndex = (currentGameIndex + responseData.length - 1) % responseData.length;
    updateCarousel();
});

document.getElementById('next-button').addEventListener('click', () => {
    currentGameIndex = (currentGameIndex + 1) % responseData.length;
    updateCarousel();
});
// Confirm
document.getElementById('confirm-button').addEventListener('click', () => {
    const userId = document.getElementById('user-id').value;
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game-type"]');
    const gameTypeChecked = Array.from(gameTypeCheckboxes).some(checkbox => checkbox.checked);
    const fromMonth1 = document.getElementById('from-month1').value;
    const fromYear1 = document.getElementById('from-year1').value;
    const fromMonth2 = document.getElementById('from-month2').value;
    const fromYear2 = document.getElementById('from-year2').value;
    const errorMsg = document.getElementById('error-message');
    const anyTimeChecked = document.getElementById('any-time-checkbox').checked;  // ��ȡ "Any time" ��ѡ���״̬

    if (!userId) {
        errorMsg.innerText = 'Please enter your User ID';
        errorMsg.style.display = 'block';  // ��ʾ������Ϣ
    } else if (!gameTypeChecked || !fromMonth1 || !fromYear1 || !fromMonth2 || !fromYear2) {
        errorMsg.innerText = 'Please complete all the blanks';
        errorMsg.style.display = 'block';  // ��ʾ������Ϣ
    } else if (!anyTimeChecked && ((fromYear1 > fromYear2) || (fromYear1 == fromYear2 && fromMonth1 > fromMonth2))) {
        errorMsg.innerText = "Please ensure that the date of 'From' is earlier than the date of 'To'";
        errorMsg.style.display = 'block';  // ��ʾ������Ϣ
    } else {
        errorMsg.style.display = 'none';  // ���ش�����Ϣ
        displayRecommendations();
    }
});

//������
function processConfirmation() {
    // ��ʾ������
    var progressBar = document.getElementById('progress-bar');
    var width = 0;
    var interval = setInterval(function () {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width++;
            progressBar.style.width = width + '%';
        }
    }, 30);

    // ִ�����Ĵ���
    // ��������һ����Ϊ longRunningProcess �ĺ���������ȷ��
    longRunningProcess().then(function () {
        // �������ʱ���ؽ�����
        clearInterval(interval);
        progressBar.style.width = '0';
    });
}

function longRunningProcess() {
    // ����һ��ʾ����������Ӧ�ý����滻Ϊʵ�ʵĴ�����
    return new Promise(function (resolve) {
        setTimeout(resolve, 5000);  // ���磬ģ��5��Ĵ���ʱ��
    });
}



// �� "ANY TIME" ��ѡ���״̬�ı�ʱ�����û���� "From" �� "To" �������˵�
document.getElementById('any-time-checkbox').addEventListener('change', (event) => {
    const fromMonth1 = document.getElementById('from-month1');
    const fromYear1 = document.getElementById('from-year1');
    const fromMonth2 = document.getElementById('from-month2');
    const fromYear2 = document.getElementById('from-year2');

    const disabled = event.target.checked;
    fromMonth1.disabled = disabled;
    fromYear1.disabled = disabled;
    fromMonth2.disabled = disabled;
    fromYear2.disabled = disabled;
});
// �� "ANY" ��ѡ���״̬�ı�ʱ�����û����ѡ����Ϸ����
document.getElementById('any-checkbox').addEventListener('change', (event) => {
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game-type"]:not(#any-checkbox)');
    gameTypeCheckboxes.forEach(checkbox => {
        checkbox.disabled = event.target.checked;
    });
});


//�����Ϸ������
document.getElementById('carousel').addEventListener('click', function (event) {
    let target = event.target;
    if (target.classList.contains('game-name')) {
        nameClicked = true;  // ���� nameClicked ������ֵ
        hideMoreInfo();

        let gameDisplay = document.getElementById('game-display');
        gameDisplay.style.transform = 'translateX(-300px)';

        // ����Ƿ��Ѵ��� infoBox������������򴴽��µ� infoBox
        let infoBox = document.querySelector('.info-box');
        if (!infoBox) {
            infoBox = document.createElement('div');
            infoBox.className = 'info-box';
            document.getElementById('info-box-container').appendChild(infoBox);
        }

        // ����info-box�����ݺ�λ��
        infoBox.innerHTML = `
            Reason why we choose this game: ${target.dataset.reason}<br><br>
            The information about its price: ${target.dataset.price}
        `;

        // ������Ҫ��̬����info-box��right����
        let newRightValue = -300
        infoBox.style.right = newRightValue + 'px';

        infoBox.style.display = 'block';
    }
});

//��¼�Ƿ�����Ϸ��
function hideMoreInfo() {
    const moreInfoElements = document.querySelectorAll('.more-info');
    const gameInfoElements = document.querySelectorAll('.game-info');
    const currentGame = responseData[currentGameIndex];

    if (nameClicked) {
        moreInfoElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    gameInfoElements.forEach(element => {
        element.innerHTML = `
            <span class="game-name" data-reason="${currentGame.reason}" data-price="${currentGame.price}">
                ${currentGame.name}
            </span>
            ${nameClicked ? '' : '<span class="more-info"> <- Click to obtain more relevant information</span>'}
        `;
    });
}