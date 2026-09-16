// 自动将全站核心 URL 推送给百度搜索资源平台 API
const urls = [
  'https://wubi.pinme.dev/',
  'https://wubi.pinme.dev/?tab=type',
  'https://wubi.pinme.dev/?tab=rpg',
  'https://wubi.pinme.dev/?tab=keyboard',
  'https://wubi.pinme.dev/?tab=rules',
  'https://wubi.pinme.dev/?tab=lookup',
  'https://wubi.pinme.dev/?tab=article',
  'https://wubi.pinme.dev/?tab=game',
  'https://wubi.pinme.dev/?tab=mistakes'
];

const token = 'G6iRfYKUWdD5ZhkS';
const apiUrl = `http://data.zz.baidu.com/urls?site=https://wubi.pinme.dev&token=${token}`;

async function push() {
  console.log('🚀 正在推送全量 URL 到百度搜索资源平台...');
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: urls.join('\n')
    });
    const data = await res.json();
    console.log('✅ 百度 API 推送结果:', data);
    if (data.success) {
      console.log(`🎉 成功推送 ${data.success} 条链接！今日剩余配额: ${data.remain} 条`);
    } else {
      console.warn('⚠️ 推送返回信息:', data);
    }
  } catch (err) {
    console.error('❌ 推送失败:', err);
  }
}

push();
