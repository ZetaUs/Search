const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultList = document.getElementById('resultList');
const loading = document.getElementById('loading');

// 你的 Cloudflare Worker 代理域名
const PROXY_API = "https://search-server.zztxorg.dpdns.org";

// 绑定搜索事件：点击按钮 / 回车
searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch();
});

async function runSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
        alert("请输入搜索关键词");
        return;
    }

    // 清空旧结果，展示加载提示
    resultList.innerHTML = "";
    loading.style.display = "block";

    try {
        // 构造 DuckDuckGo 原始搜索接口
        const duckUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(keyword)}&format=json&no_html=1`;
        // 用 Worker 中转，解决跨域 CORS
        const proxyFullUrl = `${PROXY_API}?target=${encodeURIComponent(duckUrl)}`;

        const response = await fetch(proxyFullUrl);
        if (!response.ok) throw new Error("接口请求异常");

        const data = await response.json();
        loading.style.display = "none";

        const searchResults = data.RelatedTopics || [];
        if (searchResults.length === 0) {
            resultList.innerHTML = `<p style="text-align:center;color:#666;padding:30px;">未找到相关搜索结果</p>`;
            return;
        }

        // 循环渲染搜索结果
        searchResults.forEach(item => {
            if (!item.FirstURL) return;

            const itemHtml = `
                <div class="result-item">
                    <a href="${item.FirstURL}" target="_blank">${item.Text || "无标题"}</a>
                    <div class="url">${item.FirstURL}</div>
                    <div class="desc">${item.Abstract || "暂无页面描述"}</div>
                </div>
            `;
            resultList.innerHTML += itemHtml;
        });

    } catch (error) {
        loading.style.display = "none";
        resultList.innerHTML = `<p style="text-align:center;color:red;padding:30px;">搜索失败，请稍后重试</p>`;
        console.error("搜索错误：", error);
    }
}
