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
const responseData = [
    {
        name: "Game 1",
        image: "https://th.bing.com/th/id/OIP.ihxvoWLVFZ8WtxBodfe7GQHaFO?pid=ImgDet&rs=1",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "The project embodies a concerted effort to blend image processing, digit recognition, and interactive web design to foster a dynamic platform for Sudoku enthusiasts.",
        price: "The challenges encountered have paved the way for a clear delineation of future work, focused on honing the accuracy and user interaction further. This project not only provides a practical solution to a real-world problem but also serves as a valuable learning experience in applying theoretical knowledge in image processing and machine learning in a real-world scenario."
    },
    {
        name: "Game 2",
        image: "https://th.bing.com/th/id/OIP.TfNyqAurXXiVhf99vjUPUwHaEK?pid=ImgDet&rs=1",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 2",
        price: "Price 2"
    },
    {
        name: "Game 3",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 3",
        price: "Price 3"
    },
    {
        name: "Game 4",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 4",
        price: "Price 4"
    },
    {
        name: "Game 5",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 5",
        price: "Price 5"
    },
    {
        name: "Game 6",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 6",
        price: "Price 6"
    },
    {
        name: "Game 7",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 7",
        price: "Price 7"
    },
    {
        name: "Game 8",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 8",
        price: "Price 8"
    },
    {
        name: "Game 9",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 9",
        price: "Price 9"
    },
    {
        name: "Game 10",
        image: "game.jpg",
        link: "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753",
        reason: "Reason 10",
        price: "Price 10"
    },
];

// 声明全局变量
let recommendationsShown = false;
let currentGameIndex;
let nameClicked = false

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
    });

    // 如果这是首次显示推荐，则显示标题和"Try Again"按钮
    if (!recommendationsShown) {
        const gameTitle = document.getElementById('game-title');
        const tryAgainButton = document.getElementById('try-again-button');
        gameTitle.style.display = 'block';
        tryAgainButton.style.display = 'block';

        recommendationsShown = true;
    }


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
    overlayBox.style.height = '345px';
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

    if (!userId) {
        errorMsg.innerText = 'Please enter your User ID';
        errorMsg.style.display = 'block';  // 显示错误消息
    } else if (!gameTypeChecked || !fromMonth1 || !fromYear1 || !fromMonth2 || !fromYear2) {
        errorMsg.innerText = 'Please complete all the blanks';
        errorMsg.style.display = 'block';  // 显示错误消息
    } else {
        errorMsg.style.display = 'none';  // 隐藏错误消息
        displayRecommendations();
    }
});
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
    const gameTypeCheckboxes = document.querySelectorAll('input[name="game-type"]:not(#any-checkbox)');
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

        // 设置info-box的内容和位置
        infoBox.innerHTML = `
            Reason why we choose this game: ${target.dataset.reason}<br><br>
            The information about its price: ${target.dataset.price}
        `;

        // 根据需要动态调整info-box的right属性
        let newRightValue = -300
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