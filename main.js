const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultList = document.getElementById('resultList');
const loading = document.getElementById('loading');

const PROXY_API = "https://search-server.zztxorg.dpdns.org";
let fetchAbortController = null;

searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', e => e.key === 'Enter' && runSearch());

async function runSearch() {
  const keyword = searchInput.value.trim();
  if (!keyword) {
    alert("请输入搜索关键词");
    return;
  }

  if (fetchAbortController) fetchAbortController.abort();
  fetchAbortController = new AbortController();

  resultList.innerHTML = "";
  loading.style.display = "block";

  try {
    // 改用web网页搜索接口，获取普通网页链接，不再只拿百科
    const duckUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(keyword)}&format=json&no_html=1&kl=zh-cn`;
    const proxyFullUrl = `${PROXY_API}?target=${encodeURIComponent(duckUrl)}`;

    const timeout = setTimeout(() => fetchAbortController.abort(), 10000);
    const res = await fetch(proxyFullUrl, { signal: fetchAbortController.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("接口异常");
    const data = await res.json();
    loading.style.display = "none";

    // 合并网页结果 + 百科词条，覆盖所有搜索内容
    let allResults = [];
    if (data.Results && data.Results.length) allResults.push(...data.Results);
    if (data.RelatedTopics && data.RelatedTopics.length) allResults.push(...data.RelatedTopics);

    if (allResults.length === 0) {
      resultList.innerHTML = `<p style="text-align:center;color:#666;padding:30px;">未找到相关结果</p>`;
      return;
    }

    // 逐条实时渲染，出来一条展示一条
    for (const item of allResults) {
      if (!item.FirstURL && !item.URL) continue;
      const link = item.FirstURL || item.URL;
      const title = item.Text || item.Title || "无标题";
      const desc = item.Abstract || item.Description || "暂无页面描述";

      const html = `
        <div class="result-item">
          <a href="${link}" target="_blank">${title}</a>
          <div class="url">${link}</div>
          <div class="desc">${desc}</div>
        </div>
      `;
      resultList.innerHTML += html;
    }

  } catch (err) {
    loading.style.display = "none";
    if (err.name !== "AbortError") {
      resultList.innerHTML = `<p style="text-align:center;color:red;padding:30px;">搜索接口请求失败，请稍后重试</p>`;
      console.error(err);
    }
  }
}
