// 假设后端返回的数据保存在变量 responseData 中
const responseData = [
    {
        "name": "Game 1",
        "image": "https://th.bing.com/th/id/OIP.ihxvoWLVFZ8WtxBodfe7GQHaFO?pid=ImgDet&rs=1",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 2",
        "image": "https://th.bing.com/th/id/OIP.TfNyqAurXXiVhf99vjUPUwHaEK?pid=ImgDet&rs=1",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 3",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 4",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 5",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 6",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 7",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 8",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 9",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
    {
        "name": "Game 10",
        "image": "game.jpg",
        "link": "https://www.bilibili.com/video/BV1uT4y1P7CX/?spm_id_from=333.337.search-card.all.click&vd_source=2237e9e19352eb24306c6091eb0ae753"
    },
];
let recommendationsShown = false;
let currentGameIndex;  // 声明 currentGameIndex 全局变量

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
        gameListItem.innerText = game.name;
        gameGroup.appendChild(gameListItem);

        // 创建轮播项
        const gameDiv = document.createElement('div');
        gameDiv.innerHTML = `
            <a href="${game.link}" target="_blank">
                <img src="${game.image}" alt="${game.name}">
            </a>
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

    // 显示第一个游戏的名字
    const gameName = document.getElementById('game-name');
    gameName.innerText = responseData[0].name;

    updateCarousel();

    // 隐藏按钮直到推荐被显示
    document.getElementById('prev-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'none';

    // 动态生成圆点
    const carouselDots = document.getElementById('carousel-dots');
    responseData.forEach((game, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = index;
        carouselDots.appendChild(dot);
    });

    updateCarousel();
}

function updateCarousel() {
    // 其他代码

    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('#carousel-dots .dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    dots[currentGameIndex].classList.add('active');
}

document.getElementById('carousel-dots').addEventListener('click', (event) => {
    if (event.target.classList.contains('dot')) {
        currentGameIndex = parseInt(event.target.dataset.index);
        updateCarousel();
    }
});
function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const gameName = document.getElementById('game-name');
    const transformValue = -currentGameIndex * 100;
    carousel.style.transform = `translateX(${transformValue}%)`;
    // 当推荐被显示时，显示按钮
    document.getElementById('prev-button').style.display = 'block';
    document.getElementById('next-button').style.display = 'block';
    // 更新当前显示的游戏名字
    gameName.innerText = responseData[currentGameIndex].name;

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
