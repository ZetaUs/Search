const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultList = document.getElementById('resultList');
const loading = document.getElementById('loading');

// 绑定点击与回车搜索
searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', e => e.key === 'Enter' && runSearch());

async function runSearch() {
    const kw = searchInput.value.trim();
    if (!kw) return alert('请输入搜索关键词');
    resultList.innerHTML = '';
    loading.style.display = 'block';

    try {
        // DuckDuckGo 公开简易搜索接口
        const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(kw)}&format=json&no_html=1`);
        const data = await res.json();
        loading.style.display = 'none';

        const results = data.RelatedTopics || [];
        if (results.length === 0) {
            resultList.innerHTML = '<p style="text-align:center;color:#666;">未找到相关结果</p>';
            return;
        }

        // 渲染搜索结果
        results.forEach(item => {
            if (!item.FirstURL) return;
            const html = `
                <div class="result-item">
                    <a href="${item.FirstURL}" target="_blank">${item.Text || '无标题'}</a>
                    <div class="url">${item.FirstURL}</div>
                    <div class="desc">${item.Abstract || '暂无描述'}</div>
                </div>
            `;
            resultList.innerHTML += html;
        })
    } catch (err) {
        loading.style.display = 'none';
        resultList.innerHTML = '<p style="text-align:center;color:red;">搜索接口请求失败，跨域限制可使用Workers中转</p>';
        console.error(err);
    }
}
