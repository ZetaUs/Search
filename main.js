const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultList = document.getElementById('resultList');
const loading = document.getElementById('loading');

const PROXY_API = "https://search-server.zztxorg.dpdns.org";
let abortCtrl = null;

searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', e => e.key === 'Enter' && runSearch());

async function runSearch() {
  const kw = searchInput.value.trim();
  if (!kw) return alert("请输入关键词");

  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();

  resultList.innerHTML = "";
  loading.style.display = "block";

  try {
    const timeout = setTimeout(() => abortCtrl.abort(), 12000);
    const resp = await fetch(`${PROXY_API}?q=${encodeURIComponent(kw)}`, {
      signal: abortCtrl.signal
    });
    clearTimeout(timeout);

    const data = await resp.json();
    loading.style.display = "none";

    if (data.error) throw new Error(data.msg);
    const list = data.results || [];

    if (list.length === 0) {
      resultList.innerHTML = `<p style="text-align:center;color:#666;padding:30px;">未找到相关结果</p>`;
      return;
    }

    for (const item of list) {
      const itemHtml = `
        <div class="result-item">
          <a href="${item.url}" target="_blank">${item.title}</a>
          <div class="url">${item.url}</div>
          <div class="desc">${item.desc}</div>
        </div>
      `;
      resultList.innerHTML += itemHtml;
    }
  } catch (err) {
    loading.style.display = "none";
    if (err.name !== "AbortError") {
      resultList.innerHTML = `<p style="text-align:center;color:red;padding:30px;">搜索接口请求失败，请稍后重试</p>`;
      console.error(err);
    }
  }
}
