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


// �����˷��ص����ݱ����ڱ��� responseData ��
//const responseData = [
//    {
  //      name: "Game 1",
    //    image: "https://th.bing.com/th/id/OIP.ihxvoWLVFZ8WtxBodfe7GQHaFO?pid=ImgDet&rs=1",
      //  link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        //reason: "The project embodies a concerted effort to blend image processing, digit recognition, and interactive web design to foster a dynamic platform for Sudoku enthusiasts.",
        //price: "The challenges encountered have paved the way for a clear delineation of future work, focused on honing the accuracy and user interaction further. This project not only provides a practical solution to a real-world problem but also serves as a valuable learning experience in applying theoretical knowledge in image processing and machine learning in a real-world scenario."
    //},]



// ����ȫ�ֱ���
let recommendationsShown = false;
let currentGameIndex;
let nameClicked = false
//���������ȫ�ֱ���
let progressBarValue = 0;
let progressBarInterval;
let carouselInterval;
let carouselDisplayed = false;


function displayCarousel() {
    // ��������ʾ�ֲ�ͼ�Ĵ���
    carouselDisplayed = true;
}
//�ʺ�ɫ
function updateWordColors() {
    const colors = ['#FFFF00', '#FFFFFF', '#ADD8E6', '#FFA500', '#90EE90', '#FF4500'];  // ������ɫ����
    const gameItems = document.querySelectorAll('.game-item');  // ѡ�����е� game-item Ԫ��

    gameItems.forEach((gameItem, itemIndex) => {
        const words = gameItem.innerText.split(' ');  // �ָ��ı�Ϊ����
        gameItem.innerHTML = '';  // ���ԭ������
        
        words.forEach((word, wordIndex) => {
            const span = document.createElement('span');
            span.innerText = word + ' ';  // ��ӵ��ʺ�һ���ո�
            span.style.color = colors[(itemIndex * words.length + wordIndex) % colors.length];  // Ӧ����ɫ
            gameItem.appendChild(span);  // �� span Ԫ����ӵ� game-item Ԫ��
        });
    });
}
function displayRecommendations() {
    currentGameIndex = 0;
    // ����ɵ��Ƽ�
    const gamesList = document.getElementById('games-list');
    const carousel = document.getElementById('carousel');
    gamesList.innerHTML = '';
    carousel.innerHTML = '';

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
        // ����ѡ�񲿷�
        document.getElementById('game-type-container').style.display = 'none';
        document.getElementById('time-limitation').style.display = 'none';
        document.getElementById('game-type-header').style.display = 'none';
        document.getElementById('time-range-header').style.display = 'none';

    });

    // ��������״���ʾ�Ƽ�������ʾ�����"Try Again"��ť
    if (!recommendationsShown) {
        const gameTitle = document.getElementById('game-title');
        const tryAgainButton = document.getElementById('try-again-button');
        gameTitle.style.display = 'block';
        tryAgainButton.style.display = 'block';

        recommendationsShown = true;
    }
    // ����������Ϸ����ͼ��
    const gameTypeImages = document.querySelectorAll('.game-type-image');
    gameTypeImages.forEach(image => {
        image.style.display = 'none';
    });
    // ��������Ϸ����ѡ��ŵ�һ��
    const gameTypeContainer = document.getElementById('game-type-container');
    gameTypeContainer.classList.add('single-row');

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
    overlayBox.style.height = '380px';
    updateProgressBar();  // ����ʾ�Ƽ�ʱ��ʼ���н�����

    updateWordColors();  // ���µ��ʵ���ɫ
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

var width = 0;  // ��width�����ƶ����ⲿ������

// Confirm
document.getElementById('confirm-button').addEventListener('click', () => {
    const userId = document.getElementById('user-id').value;
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game_type"]');
    let gameTypes = Array.from(gameTypeCheckboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    const fromMonth1 = document.getElementById('from-month1').value;
    const fromYear1 = document.getElementById('from-year1').value;
    const fromMonth2 = document.getElementById('from-month2').value;
    const fromYear2 = document.getElementById('from-year2').value;
    const errorMsg = document.getElementById('error-message');
    const anyTimeChecked = document.getElementById('any-time-checkbox').checked;  // ��ȡ "Any time" ��ѡ���״̬

    if (!userId) {
        errorMsg.innerText = 'Please enter your User ID';
        errorMsg.style.display = 'block';  // ��ʾ������Ϣ
    } else if (gameTypes.length === 0 || !fromMonth1 || !fromYear1 || !fromMonth2 || !fromYear2) {
        errorMsg.innerText = 'Please complete all the blanks';
        errorMsg.style.display = 'block';  // ��ʾ������Ϣ
    } else if (!anyTimeChecked && ((fromYear1 > fromYear2) || (fromYear1 == fromYear2 && fromMonth1 > fromMonth2))) {
        errorMsg.innerText = "Please ensure that the date of 'From' is earlier than the date of 'To'";
        errorMsg.style.display = 'block';  // ��ʾ������Ϣ
    } else {
        errorMsg.style.display = 'none';  // ���ش�����Ϣ

        // ���ѡ�� "Any"����������Ϸ������ӵ�������
        if (gameTypes.includes('Any')) {
            gameTypes = ['Action', 'Adventure', 'Strategy', 'Simulation', 'RPG', 'Sports and Racing'];
        }

        var progressBarInterval = startProgressBar();  // �����￪ʼ������

        // �������󵽺�˲������ص�����
        fetch('/get-recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                gameTypes: gameTypes,  // ������Ϸ��������
                fromMonth1: fromMonth1,
                fromYear1: fromYear1,
                fromMonth2: fromMonth2,
                fromYear2: fromYear2,
                anyTimeChecked: anyTimeChecked,
                // ...������Ҫ���͵���˵�����
            }),
        })
            .then(response => response.json())
            .then(data => {
                clearInterval(progressBarInterval);  // ֹͣ�����������������������������
                finishProgressBar(progressBarInterval);  // ��ɽ�������������interval����
                responseData = data;  // ����responseData��һ��ȫ�ֱ���

                displayRecommendations();
            })
            .catch(error => {
                clearInterval(progressBarInterval);  // �ڷ�������ʱֹͣ������������
                console.error('Error:', error);
            });
        }
    });
//������
var currentWidth = 0;  // ����һ��ȫ�ֱ��������ٽ������ĵ�ǰ���

function startProgressBar() {
    // ��ʾ������
    var progressBar = document.getElementById('progress-bar');
    var interval = setInterval(function () {
        if (currentWidth >= 95) {
            clearInterval(interval);  // ���������ﵽ95%ʱֹͣ
        } else {
            currentWidth++;
            progressBar.style.width = currentWidth + '%';
        }
    }, 30);
    return interval;  // ����interval���Ա��Ժ���������
}

function finishProgressBar(interval) {
    clearInterval(interval);  // ������е�interval��ȷ���������������¿�ʼ
    var progressBar = document.getElementById('progress-bar');
    var finishInterval = setInterval(function () {
        if (currentWidth >= 100) {
            clearInterval(finishInterval);  // ���������ﵽ100%ʱֹͣ
            setTimeout(function () {
                progressBar.style.width = '0';  // �ڶ��ݵ��ӳٺ����ؽ�����
            }, 500);  // 500������ӳ��ǿɵ��ģ������Ը�����Ҫ������
        } else {
            currentWidth++;
            progressBar.style.width = currentWidth + '%';
        }
    }, 30);
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
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game_type"]:not(#any-checkbox)');
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

        // ��ȡ���ɺͼ۸���Ϣ
        let reasonInfo = `Reason why we choose this game: ${target.dataset.reason}`;
        let priceInfo = `The information about its price: ${target.dataset.price}`;

        // ��� "experience with" �� ", which had" ֮����ı�����������ɫ����Ϊ #d1a655
        let experienceRegex = /(experience with)(.*)(, which had)/;
        if (experienceRegex.test(reasonInfo)) {
            reasonInfo = reasonInfo.replace(experienceRegex, '$1<span class="highlighted-text">$2</span>$3');
        }

        // ��� "The information about its price: " �� " U.S. dollar" ֮����ı�����������ɫ����Ϊ #d1a655
        let priceStartIndex = priceInfo.indexOf('The information about its price: ') + 'The information about its price: '.length;
        let priceEndIndex = priceInfo.indexOf(' U.S. dollar');
        if (priceStartIndex > -1 && priceEndIndex > -1) {
            priceInfo = priceInfo.substring(0, priceStartIndex) +
                '<span class="highlighted-text">' + priceInfo.substring(priceStartIndex, priceEndIndex) + '</span>' +
                priceInfo.substring(priceEndIndex);
        }

        // ���޸ĺ�����ɺͼ۸���Ϣ����Ϊ infoBox ������
        infoBox.innerHTML = `
    <br>
    ${reasonInfo}<br><br>
    ${priceInfo}
`;

        // ������Ҫ��̬����info-box��right����
        let newRightValue = -200;
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
