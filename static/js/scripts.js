const video = document.getElementById('video-background');
const volumeControl = document.getElementById('volume-control');

// 一旦视频可以播放，取消静音
video.addEventListener('canplay', () => {
    video.muted = false;
});

// 处理音量控制滑块的值更改事件
volumeControl.addEventListener('input', () => {
    video.volume = volumeControl.value;
});


// 假设后端返回的数据保存在变量 responseData 中
//const responseData = [
//    {
  //      name: "Game 1",
    //    image: "https://th.bing.com/th/id/OIP.ihxvoWLVFZ8WtxBodfe7GQHaFO?pid=ImgDet&rs=1",
      //  link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        //reason: "The project embodies a concerted effort to blend image processing, digit recognition, and interactive web design to foster a dynamic platform for Sudoku enthusiasts.",
        //price: "The challenges encountered have paved the way for a clear delineation of future work, focused on honing the accuracy and user interaction further. This project not only provides a practical solution to a real-world problem but also serves as a valuable learning experience in applying theoretical knowledge in image processing and machine learning in a real-world scenario."
    //},]



// 声明全局变量
let recommendationsShown = false;
let currentGameIndex;
let nameClicked = false
//进度条相关全局变量
let progressBarValue = 0;
let progressBarInterval;
let carouselInterval;
let carouselDisplayed = false;


function displayCarousel() {
    // 这里是显示轮播图的代码
    carouselDisplayed = true;
}
//彩虹色
function updateWordColors() {
    const colors = ['#FFFF00', '#FFFFFF', '#ADD8E6', '#FFA500', '#90EE90', '#FF4500'];  // 定义颜色数组
    const gameItems = document.querySelectorAll('.game-item');  // 选择所有的 game-item 元素

    gameItems.forEach((gameItem, itemIndex) => {
        const words = gameItem.innerText.split(' ');  // 分割文本为单词
        gameItem.innerHTML = '';  // 清空原有内容
        
        words.forEach((word, wordIndex) => {
            const span = document.createElement('span');
            span.innerText = word + ' ';  // 添加单词和一个空格
            span.style.color = colors[(itemIndex * words.length + wordIndex) % colors.length];  // 应用颜色
            gameItem.appendChild(span);  // 将 span 元素添加到 game-item 元素
        });
    });
}
function displayRecommendations() {
    currentGameIndex = 0;
    // 清除旧的推荐
    const gamesList = document.getElementById('games-list');
    const carousel = document.getElementById('carousel');
    gamesList.innerHTML = '';
    carousel.innerHTML = '';

    let gameGroup = null;
    responseData.forEach((game, index) => {
        if (index % 2 === 0) {  // 对于偶数索引，创建新的游戏组
            gameGroup = document.createElement('div');
            gameGroup.className = 'game-group';
            gamesList.appendChild(gameGroup);
        }

        // 创建游戏列表项
        const gameListItem = document.createElement('div');
        gameListItem.className = 'game-item';
        gameListItem.innerText = game.name;
        gameListItem.dataset.reason = game.reason;  // 新增属性：游戏推荐原因
        gameListItem.dataset.price = game.price;    // 新增属性：游戏价格

        gameGroup.appendChild(gameListItem);
        // 创建轮播项
        const gameDiv = document.createElement('div');
        gameDiv.className = 'carousel-item';  // 添加类名以便在 CSS 中应用样式
        gameDiv.innerHTML = `
            <a href="${game.link}" target="_blank">
                <img src="${game.image}" alt="${game.name}">
            </a>
            <div class="game-info"></div>  <!-- 新增游戏信息容器 -->
        `;
        carousel.appendChild(gameDiv);
        // 隐藏选择部分
        document.getElementById('game-type-container').style.display = 'none';
        document.getElementById('time-limitation').style.display = 'none';
        document.getElementById('game-type-header').style.display = 'none';
        document.getElementById('time-range-header').style.display = 'none';

    });

    // 如果这是首次显示推荐，则显示标题和"Try Again"按钮
    if (!recommendationsShown) {
        const gameTitle = document.getElementById('game-title');
        const tryAgainButton = document.getElementById('try-again-button');
        gameTitle.style.display = 'block';
        tryAgainButton.style.display = 'block';

        recommendationsShown = true;
    }
    // 隐藏所有游戏类型图像
    const gameTypeImages = document.querySelectorAll('.game-type-image');
    gameTypeImages.forEach(image => {
        image.style.display = 'none';
    });
    // 将所有游戏类型选项放到一排
    const gameTypeContainer = document.getElementById('game-type-container');
    gameTypeContainer.classList.add('single-row');

    updateCarousel();

    // 隐藏按钮直到推荐被显示
    document.getElementById('prev-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'none';

        // 动态生成圆点前，先清空#carousel-dots
    const carouselDots = document.getElementById('carousel-dots');
    carouselDots.innerHTML = '';
    // 动态生成圆点
    responseData.forEach((game, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = index;
        carouselDots.appendChild(dot);
    });

    updateCarousel();

    // 在展示推荐时改变方框的大小
    const overlayBox = document.getElementById('overlay-box');
    overlayBox.style.height = '380px';
    updateProgressBar();  // 在显示推荐时开始运行进度条

    updateWordColors();  // 更新单词的颜色
}

function updateDots() {
    const dots = document.querySelectorAll('#carousel-dots .dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    if (dots.length > 0) {
        dots[currentGameIndex].classList.add('active');  // 检查 dots 数组的长度
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

    // 当推荐被显示时，显示按钮
    document.getElementById('prev-button').style.display = 'block';
    document.getElementById('next-button').style.display = 'block';

    hideMoreInfo();  // 调用 hideMoreInfo 函数来更新 .game-info 元素的内容
    // 更新当前显示的游戏名字和添加提示
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

var width = 0;  // 将width变量移动到外部作用域

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
    const anyTimeChecked = document.getElementById('any-time-checkbox').checked;  // 获取 "Any time" 复选框的状态

    if (!userId) {
        errorMsg.innerText = 'Please enter your User ID';
        errorMsg.style.display = 'block';  // 显示错误消息
    } else if (gameTypes.length === 0 || !fromMonth1 || !fromYear1 || !fromMonth2 || !fromYear2) {
        errorMsg.innerText = 'Please complete all the blanks';
        errorMsg.style.display = 'block';  // 显示错误消息
    } else if (!anyTimeChecked && ((fromYear1 > fromYear2) || (fromYear1 == fromYear2 && fromMonth1 > fromMonth2))) {
        errorMsg.innerText = "Please ensure that the date of 'From' is earlier than the date of 'To'";
        errorMsg.style.display = 'block';  // 显示错误消息
    } else {
        errorMsg.style.display = 'none';  // 隐藏错误消息

        // 如果选中 "Any"，则将所有游戏类型添加到数组中
        if (gameTypes.includes('Any')) {
            gameTypes = ['Action', 'Adventure', 'Strategy', 'Simulation', 'RPG', 'Sports and Racing'];
        }

        var progressBarInterval = startProgressBar();  // 在这里开始进度条

        // 发送请求到后端并处理返回的数据
        fetch('/get-recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                gameTypes: gameTypes,  // 发送游戏类型数组
                fromMonth1: fromMonth1,
                fromYear1: fromYear1,
                fromMonth2: fromMonth2,
                fromYear2: fromYear2,
                anyTimeChecked: anyTimeChecked,
                // ...其他需要发送到后端的数据
            }),
        })
            .then(response => response.json())
            .then(data => {
                clearInterval(progressBarInterval);  // 停止进度条的增长（如果它还在增长）
                finishProgressBar(progressBarInterval);  // 完成进度条，并传递interval对象
                responseData = data;  // 假设responseData是一个全局变量

                displayRecommendations();
            })
            .catch(error => {
                clearInterval(progressBarInterval);  // 在发生错误时停止进度条的增长
                console.error('Error:', error);
            });
        }
    });
//进度条
var currentWidth = 0;  // 定义一个全局变量来跟踪进度条的当前宽度

function startProgressBar() {
    // 显示进度条
    var progressBar = document.getElementById('progress-bar');
    var interval = setInterval(function () {
        if (currentWidth >= 95) {
            clearInterval(interval);  // 当进度条达到95%时停止
        } else {
            currentWidth++;
            progressBar.style.width = currentWidth + '%';
        }
    }, 30);
    return interval;  // 返回interval，以便稍后可以清除它
}

function finishProgressBar(interval) {
    clearInterval(interval);  // 清除现有的interval，确保进度条不会重新开始
    var progressBar = document.getElementById('progress-bar');
    var finishInterval = setInterval(function () {
        if (currentWidth >= 100) {
            clearInterval(finishInterval);  // 当进度条达到100%时停止
            setTimeout(function () {
                progressBar.style.width = '0';  // 在短暂的延迟后隐藏进度条
            }, 500);  // 500毫秒的延迟是可调的，您可以根据需要更改它
        } else {
            currentWidth++;
            progressBar.style.width = currentWidth + '%';
        }
    }, 30);
}

// 当 "ANY TIME" 复选框的状态改变时，启用或禁用 "From" 和 "To" 的下拉菜单
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
// 当 "ANY" 复选框的状态改变时，启用或禁用选择游戏类型
document.getElementById('any-checkbox').addEventListener('change', (event) => {
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game_type"]:not(#any-checkbox)');
    gameTypeCheckboxes.forEach(checkbox => {
        checkbox.disabled = event.target.checked;
    });
});


//点击游戏名触发
document.getElementById('carousel').addEventListener('click', function (event) {
    let target = event.target;
    if (target.classList.contains('game-name')) {
        nameClicked = true;  // 更新 nameClicked 变量的值
        hideMoreInfo();

        let gameDisplay = document.getElementById('game-display');
        gameDisplay.style.transform = 'translateX(-300px)';

        // 检查是否已存在 infoBox，如果不存在则创建新的 infoBox
        let infoBox = document.querySelector('.info-box');
        if (!infoBox) {
            infoBox = document.createElement('div');
            infoBox.className = 'info-box';
            document.getElementById('info-box-container').appendChild(infoBox);
        }

        // 提取理由和价格信息
        let reasonInfo = `Reason why we choose this game: ${target.dataset.reason}`;
        let priceInfo = `The information about its price: ${target.dataset.price}`;

        // 检查 "experience with" 和 ", which had" 之间的文本，并将其颜色更改为 #d1a655
        let experienceRegex = /(experience with)(.*)(, which had)/;
        if (experienceRegex.test(reasonInfo)) {
            reasonInfo = reasonInfo.replace(experienceRegex, '$1<span class="highlighted-text">$2</span>$3');
        }

        // 检查 "The information about its price: " 和 " U.S. dollar" 之间的文本，并将其颜色更改为 #d1a655
        let priceStartIndex = priceInfo.indexOf('The information about its price: ') + 'The information about its price: '.length;
        let priceEndIndex = priceInfo.indexOf(' U.S. dollar');
        if (priceStartIndex > -1 && priceEndIndex > -1) {
            priceInfo = priceInfo.substring(0, priceStartIndex) +
                '<span class="highlighted-text">' + priceInfo.substring(priceStartIndex, priceEndIndex) + '</span>' +
                priceInfo.substring(priceEndIndex);
        }

        // 将修改后的理由和价格信息设置为 infoBox 的内容
        infoBox.innerHTML = `
    <br>
    ${reasonInfo}<br><br>
    ${priceInfo}
`;

        // 根据需要动态调整info-box的right属性
        let newRightValue = -200;
        infoBox.style.right = newRightValue + 'px';

        infoBox.style.display = 'block';
    }
});




//记录是否点击游戏名
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
