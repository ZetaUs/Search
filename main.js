const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultList = document.getElementById('resultList');
const loading = document.getElementById('loading');

// 你的代理地址
const PROXY_API = "https://search-server.zztxorg.dpdns.org";
let fetchAbortController = null;

// 搜索绑定
searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', e => e.key === 'Enter' && runSearch());

async function runSearch() {
  const keyword = searchInput.value.trim();
  if (!keyword) {
    alert("请输入搜索关键词");
    return;
  }

  // 中断上一次未完成请求，避免卡顿错乱
  if (fetchAbortController) fetchAbortController.abort();
  fetchAbortController = new AbortController();

  // 重置界面
  resultList.innerHTML = "";
  loading.style.display = "block";

  try {
    const duckUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(keyword)}&format=json&no_html=1`;
    const proxyFullUrl = `${PROXY_API}?target=${encodeURIComponent(duckUrl)}`;

    // 设置10秒超时
    const timeout = setTimeout(() => fetchAbortController.abort(), 10000);
    const res = await fetch(proxyFullUrl, { signal: fetchAbortController.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("接口异常");
    const data = await res.json();
    loading.style.display = "none";

    const list = data.RelatedTopics || [];
    if (list.length === 0) {
      resultList.innerHTML = `<p style="text-align:center;color:#666;padding:30px;">未找到相关结果</p>`;
      return;
    }

    // 逐条立刻渲染，出一条显示一条
    for (const item of list) {
      if (!item.FirstURL) continue;
      const html = `
        <div class="result-item">
          <a href="${item.FirstURL}" target="_blank">${item.Text || "无标题"}</a>
          <div class="url">${item.FirstURL}</div>
          <div class="desc">${item.Abstract || "暂无描述"}</div>
        </div>
      `;
      resultList.innerHTML += html;
      // 轻微延时模拟流式，可删掉下面一行完全瞬时渲染
      await new Promise(r => setTimeout(r, 30));
    }

  } catch (err) {
    loading.style.display = "none";
    // 区分主动取消和真实报错
    if (err.name !== "AbortError") {
      resultList.innerHTML = `<p style="text-align:center;color:red;padding:30px;">搜索接口请求失败，请稍后重试</p>`;
      console.error(err);
    }
  }
}
