/* 张张的工作台 - 主应用逻辑 */

(function () {
  'use strict';

  const STORAGE_KEY = 'zhangzhang_workbench_v1';

  // ==================== 导航配置 ====================
  const NAV_ITEMS = [
    { id: 'workTasks', icon: '📝', label: '每日工作任务' },
    { id: 'lifeManage', icon: '🏠', label: '每日生活管理' },
    { id: 'diet', icon: '🥗', label: '每日减脂饮食' },
    { id: 'exercise', icon: '💪', label: '运动塑形锻炼' },
    { id: 'inspiration', icon: '💡', label: '自媒体每日灵感' },
    { id: 'news', icon: '🔥', label: '热点新闻' },
    { id: 'books', icon: '📚', label: '成长书籍推荐' },
    { id: 'finance', icon: '💰', label: '理财存钱' },
    { id: 'moneyInfo', icon: '💎', label: '赚钱信息差' },
    { id: 'selfImprovement', icon: '🌟', label: '自我提升' },
    { id: 'blogs', icon: '📰', label: '博客精选' },
    { id: 'wellness', icon: '🍵', label: '养生' },
    { id: 'treeHole', icon: '🌳', label: '我的树洞' }
  ];

  // ==================== 存储工具 ====================
  const Storage = {
    get() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return this._clone(WBData);
        const saved = JSON.parse(raw);
        return this._merge(this._clone(WBData), saved);
      } catch (e) {
        console.error('读取存储失败', e);
        return this._clone(WBData);
      }
    },
    set(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('保存失败', e);
      }
    },
    _clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    _merge(defaults, saved) {
      const merged = this._clone(defaults);
      for (const key in saved) {
        if (saved[key] !== undefined && saved[key] !== null) {
          merged[key] = saved[key];
        }
      }
      return merged;
    }
  };

  let appData = Storage.get();

  // ==================== 数据迁移（让新增默认内容补进已有存档，不覆盖用户数据）====================
  const DATA_VERSION = 2;
  (function migrate() {
    try {
      // 自媒体灵感：补充宠物账号等新增选题（与已有选题去重合并）
      if (appData.__v !== DATA_VERSION) {
        const defTopics = (WBData.inspiration && WBData.inspiration.topics) || [];
        if (appData.inspiration && Array.isArray(appData.inspiration.topics)) {
          const have = new Set(appData.inspiration.topics);
          defTopics.forEach(t => { if (!have.has(t)) { appData.inspiration.topics.push(t); have.add(t); } });
        }
        appData.__v = DATA_VERSION;
        save();
      }
    } catch (e) {
      console.error('数据迁移失败', e);
    }
  })();

  // ==================== 通用 UI 组件 ====================
  const Toast = {
    show(msg) {
      const container = document.getElementById('toastContainer');
      const el = document.createElement('div');
      el.className = 'toast';
      el.textContent = msg;
      container.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  };

  const Modal = {
    show(html, onConfirm) {
      const overlay = document.getElementById('modalOverlay');
      const content = document.getElementById('modalContent');
      content.innerHTML = html;
      overlay.classList.add('show');
      if (onConfirm) {
        const btn = content.querySelector('[data-confirm]');
        if (btn) btn.addEventListener('click', () => {
          onConfirm();
          this.hide();
        });
      }
      content.querySelector('[data-cancel]')?.addEventListener('click', () => this.hide());
    },
    hide() {
      document.getElementById('modalOverlay').classList.remove('show');
    }
  };

  function save() {
    Storage.set(appData);
  }

  // ==================== 导航与页面切换 ====================
  function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    nav.innerHTML = NAV_ITEMS.map(item => `
      <button class="nav-item" data-page="${item.id}" title="${item.label}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-tooltip">${item.label}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });
  }

  function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => {
      if (p.classList.contains('active')) {
        p.classList.add('exit');
        setTimeout(() => p.classList.remove('active', 'exit'), 300);
      }
    });

    setTimeout(() => {
      const target = document.getElementById('page-' + pageId);
      if (target) {
        target.classList.add('active');
        renderPage(pageId);
        target.scrollTop = 0;
      }
    }, 50);

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
  }

  function renderPage(pageId) {
    const el = document.getElementById('page-' + pageId);
    if (!el) return;
    const renderer = pageRenderers[pageId];
    if (renderer) renderer(el);
  }

  // ==================== 通用组件构造器 ====================
  function ringProgress(percent) {
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return `
      <div class="ring-progress">
        <svg viewBox="0 0 140 140">
          <circle class="ring-bg" cx="70" cy="70" r="${radius}"></circle>
          <circle class="ring-fill" cx="70" cy="70" r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"></circle>
        </svg>
        <div class="ring-text">
          <div class="ring-percent">${Math.round(percent)}%</div>
          <div class="ring-label">今日完成</div>
        </div>
      </div>
    `;
  }

  function taskListHTML(tasks, key, options = {}) {
    if (!tasks || !tasks.length) return '<p style="color:#7a7a99;font-size:14px;">暂无任务</p>';
    return `
      <div class="task-list" data-key="${key}">
        ${tasks.map((t, i) => `
          <div class="task-item" data-index="${i}">
            <div class="task-checkbox ${t.done ? 'checked' : ''}" data-index="${i}">${t.done ? '✓' : ''}</div>
            <div class="task-text ${t.done ? 'completed' : ''}">${t.text}</div>
            ${options.deletable ? `<button class="btn btn-sm btn-outline" data-del="${i}">删除</button>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function attachTaskEvents(container, key, onChange) {
    const list = container.querySelector(`.task-list[data-key="${key}"]`);
    if (!list) return;
    list.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('click', () => {
        const idx = parseInt(cb.dataset.index);
        const arr = key.split('.').reduce((o, k) => o[k], appData);
        arr[idx].done = !arr[idx].done;
        save();
        if (onChange) onChange();
        else renderPage(container.closest('.page').dataset.page);
      });
    });
    list.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.del);
        const keys = key.split('.');
        const arr = keys.reduce((o, k) => o[k], appData);
        arr.splice(idx, 1);
        save();
        renderPage(container.closest('.page').dataset.page);
      });
    });
  }

  function resetButtonHTML() {
    return `
      <div class="page-footer">
        <button class="btn btn-outline" style="width:100%;" data-reset>
          🔄 一键批量重置今日任务
        </button>
      </div>
    `;
  }

  function attachReset(container, key, callback) {
    const btn = container.querySelector('[data-reset]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      Modal.show(`
        <div class="modal-title">确认重置？</div>
        <p style="color:#7a7a99;font-size:14px;">将清空今日所有已完成勾选状态。</p>
        <div class="modal-actions">
          <button class="btn btn-sm" data-cancel>取消</button>
          <button class="btn btn-sm btn-primary" data-confirm>确认重置</button>
        </div>
      `, () => {
        const keys = key.split('.');
        const arr = keys.reduce((o, k) => o[k], appData);
        arr.forEach(t => t.done = false);
        save();
        if (callback) callback();
        else renderPage(container.closest('.page').dataset.page);
        Toast.show('已重置今日任务');
      });
    });
  }

  // ==================== 页面渲染器 ====================
  const pageRenderers = {

    // 1. 每日工作任务
    workTasks(el) {
      const data = appData.workTasks;
      const allTasks = [...data.xingce, ...data.shenlun];
      const completed = allTasks.filter(t => t.done).length;
      const percent = allTasks.length ? (completed / allTasks.length) * 100 : 0;
      const randomXingce = data.xingce[Math.floor(Math.random() * data.xingce.length)].text;
      const randomShenlun = data.shenlun[Math.floor(Math.random() * data.shenlun.length)].text;
      const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

      el.innerHTML = `
        <div class="welcome-banner">
          <div class="welcome-title">🌙 张张，${today}好！</div>
          <div class="welcome-text" id="workQuote">${WBData.quotes[Math.floor(Math.random() * WBData.quotes.length)]}</div>
        </div>

        <div class="card" style="text-align:center;">
          <div class="card-title" style="justify-content:center;">📊 今日完成率</div>
          ${ringProgress(percent)}
          <p style="color:#7a7a99;font-size:14px;margin-top:10px;">已完成 ${completed}/${allTasks.length} 项</p>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📝</span>行测每日任务</div>
          ${taskListHTML(data.xingce, 'workTasks.xingce', { deletable: false })}
          <div style="margin-top:12px;padding:12px;background:rgba(126,200,255,0.12);border-radius:10px;">
            <strong>🎯 今日重点：</strong>${randomXingce}
          </div>
          <div style="margin-top:10px;">
            <button class="btn btn-sm btn-outline" data-random-xingce>🎲 随机轮换行测任务</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">✍️</span>申论每日任务</div>
          ${taskListHTML(data.shenlun, 'workTasks.shenlun', { deletable: false })}
          <div style="margin-top:12px;padding:12px;background:rgba(255,204,230,0.2);border-radius:10px;">
            <strong>🎯 今日重点：</strong>${randomShenlun}
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📚</span>错题回顾</div>
          <div id="errorQuestions">
            ${(data.errorQuestions || []).map((q, i) => `
              <div class="list-item" style="position:relative;">
                <div class="list-title">错题 #${i + 1} - 掌握程度：${q.level}</div>
                ${q.img ? `<img src="${q.img}" style="max-width:100%;border-radius:8px;margin-top:6px;">` : ''}
                <div class="list-desc">${q.note || '暂无备注'}</div>
                <button class="btn btn-sm btn-outline" data-del-error="${i}" style="position:absolute;top:10px;right:10px;">删除</button>
              </div>
            `).join('') || '<p style="color:#7a7a99;font-size:14px;">暂无错题记录</p>'}
          </div>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
            <input type="file" id="errorImgInput" accept="image/*" style="display:none;">
            <button class="btn btn-sm btn-primary" onclick="document.getElementById('errorImgInput').click()">📷 上传错题图片</button>
            <select id="errorLevel" style="width:auto;min-width:90px;">
              <option value="待掌握">待掌握</option>
              <option value="基本掌握">基本掌握</option>
              <option value="已掌握">已掌握</option>
            </select>
            <input type="text" id="errorNote" placeholder="错题备注（可选）" style="flex:1;min-width:120px;">
            <button class="btn btn-sm btn-mint" data-add-error>添加</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📰</span>备考资讯推荐</div>
          <div id="examNews">
            ${data.examTips.map(tip => `<div class="list-item"><div class="list-desc">💡 ${tip}</div></div>`).join('')}
          </div>
          <p style="color:#7a7a99;font-size:12px;margin-top:8px;">每天早上8点自动更新四川省考、国考最新资讯</p>
        </div>

        ${resetButtonHTML()}
      `;

      attachTaskEvents(el, 'workTasks.xingce');
      attachTaskEvents(el, 'workTasks.shenlun');
      attachReset(el, 'workTasks.xingce');

      el.querySelector('[data-random-xingce]').addEventListener('click', () => {
        data.xingce.sort(() => Math.random() - 0.5);
        save();
        renderPage('workTasks');
        Toast.show('已随机轮换行测任务顺序');
      });

      const imgInput = el.querySelector('#errorImgInput');
      let errorImgBase64 = '';
      imgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { errorImgBase64 = ev.target.result; };
        reader.readAsDataURL(file);
      });

      el.querySelector('[data-add-error]').addEventListener('click', () => {
        const level = el.querySelector('#errorLevel').value;
        const note = el.querySelector('#errorNote').value.trim();
        if (!errorImgBase64 && !note) {
          Toast.show('请上传图片或填写备注');
          return;
        }
        if (!data.errorQuestions) data.errorQuestions = [];
        data.errorQuestions.push({ img: errorImgBase64, level, note, date: new Date().toISOString().split('T')[0] });
        el.querySelector('#errorNote').value = '';
        errorImgBase64 = '';
        imgInput.value = '';
        save();
        renderPage('workTasks');
        Toast.show('错题已保存');
      });

      el.querySelectorAll('[data-del-error]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.delError);
          data.errorQuestions.splice(idx, 1);
          save();
          renderPage('workTasks');
        });
      });
    },

    // 2. 每日生活管理
    lifeManage(el) {
      const data = appData.lifeManage;
      el.innerHTML = `
        <div class="page-header" style="position:relative;">
          <div>
            <h1 class="page-title">🏠 每日生活管理</h1>
            <p class="page-subtitle">让生活更有仪式感</p>
          </div>
          <button class="btn btn-orange btn-sm" id="randomLifeBtn" style="position:absolute;right:0;top:8px;">🎲 随机生成</button>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🍽️</span>今日三餐</div>
          <div id="todayMeals">
            <div class="stat-card" style="margin-bottom:8px;"><div class="stat-icon">🌅</div><div class="stat-content"><div class="stat-label">早餐</div><div class="stat-value" style="font-size:15px;">${data.todayBreakfast || '点击生成'}</div></div></div>
            <div class="stat-card" style="margin-bottom:8px;"><div class="stat-icon">☀️</div><div class="stat-content"><div class="stat-label">午餐</div><div class="stat-value" style="font-size:15px;">${data.todayLunch || '点击生成'}</div></div></div>
            <div class="stat-card"><div class="stat-icon">🌙</div><div class="stat-content"><div class="stat-label">晚餐</div><div class="stat-value" style="font-size:15px;">${data.todayDinner || '点击生成'}</div></div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🧹</span>今日家务</div>
          <div id="todayChore" style="padding:12px;background:rgba(255,204,230,0.15);border-radius:10px;font-size:15px;">${data.todayChore || '点击右上角随机生成'}</div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">💧</span>饮水记录</div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            ${Array.from({ length: 8 }, (_, i) => `
              <div class="task-checkbox ${i < data.water ? 'checked' : ''}" style="width:44px;height:44px;" data-water="${i}">${i < data.water ? '✓' : ''}</div>
            `).join('')}
          </div>
          <p style="color:#7a7a99;font-size:13px;margin-top:10px;">今日已饮水 ${data.water} 杯</p>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">😌</span>放松时刻</div>
          <div id="todayRelax" style="padding:12px;background:rgba(126,232,199,0.12);border-radius:10px;font-size:15px;margin-bottom:10px;">${data.todayRelax || '点击右上角随机生成'}</div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🛏️</span>睡眠记录</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <div style="flex:1;min-width:120px;"><span class="form-label">入睡时间</span><input type="time" id="bedTime" value="${data.sleep.bedTime || ''}"></div>
            <div style="flex:1;min-width:120px;"><span class="form-label">起床时间</span><input type="time" id="wakeTime" value="${data.sleep.wakeTime || ''}"></div>
          </div>
          <div style="margin-top:10px;"><span class="form-label">睡眠质量</span>
            <div class="chip-group" id="sleepQuality">
              ${[1, 2, 3, 4, 5].map(s => `<span class="chip ${data.sleep.quality === s ? 'active' : ''}" data-sleep="${s}">${'⭐'.repeat(s)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📝</span>简易记录</div>
          <textarea id="lifeNotes" placeholder="记录今天的生活点滴...">${data.notes || ''}</textarea>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">⚙️</span>自定义偏好</div>
          <div class="form-group"><span class="form-label">忌口食物</span><input type="text" id="foodAvoid" placeholder="如：海鲜、香菜..." value="${data.foodAvoid || ''}"></div>
          <div class="form-group"><span class="form-label">饮食偏好</span><input type="text" id="foodPrefer" placeholder="如：清淡、高蛋白..." value="${data.foodPrefer || ''}"></div>
        </div>

        ${resetButtonHTML()}
      `;

      const randomize = () => {
        const avoid = (data.foodAvoid || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
        const prefer = (data.foodPrefer || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
        const filter = arr => {
          let list = arr.filter(item => !avoid.some(a => item.includes(a)));
          if (prefer.length) {
            const matched = list.filter(item => prefer.some(p => item.includes(p)));
            if (matched.length) list = matched;
          }
          return list;
        };
        const breakfast = filter(WBData.lifeManage.meals.breakfast);
        const lunch = filter(WBData.lifeManage.meals.lunch);
        const dinner = filter(WBData.lifeManage.meals.dinner);
        data.todayBreakfast = breakfast[Math.floor(Math.random() * breakfast.length)] || WBData.lifeManage.meals.breakfast[0];
        data.todayLunch = lunch[Math.floor(Math.random() * lunch.length)] || WBData.lifeManage.meals.lunch[0];
        data.todayDinner = dinner[Math.floor(Math.random() * dinner.length)] || WBData.lifeManage.meals.dinner[0];
        data.todayChore = WBData.lifeManage.chores[Math.floor(Math.random() * WBData.lifeManage.chores.length)];
        data.todayRelax = WBData.lifeManage.relax[Math.floor(Math.random() * WBData.lifeManage.relax.length)];
        save();
        renderPage('lifeManage');
        Toast.show('已生成今日生活安排');
      };

      el.querySelector('#randomLifeBtn').addEventListener('click', randomize);

      el.querySelectorAll('[data-water]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.water);
          data.water = data.water === idx + 1 ? idx : idx + 1;
          save();
          renderPage('lifeManage');
        });
      });

      el.querySelectorAll('#sleepQuality .chip').forEach(chip => {
        chip.addEventListener('click', () => {
          data.sleep.quality = parseInt(chip.dataset.sleep);
          save();
          renderPage('lifeManage');
        });
      });

      ['bedTime', 'wakeTime', 'lifeNotes', 'foodAvoid', 'foodPrefer'].forEach(id => {
        const input = el.querySelector('#' + id);
        if (!input) return;
        input.addEventListener('change', () => {
          if (id === 'bedTime') data.sleep.bedTime = input.value;
          else if (id === 'wakeTime') data.sleep.wakeTime = input.value;
          else if (id === 'lifeNotes') data.notes = input.value;
          else if (id === 'foodAvoid') data.foodAvoid = input.value;
          else if (id === 'foodPrefer') data.foodPrefer = input.value;
          save();
        });
      });

      attachReset(el, 'wellness.tasks', () => {
        data.water = 0;
        data.todayBreakfast = '';
        data.todayLunch = '';
        data.todayDinner = '';
        data.todayChore = '';
        data.todayRelax = '';
        save();
        renderPage('lifeManage');
      });
    },

    // 3. 每日减脂饮食
    diet(el) {
      const data = appData.diet;
      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">🥗 每日减脂饮食</h1><p class="page-subtitle">吃得干净，瘦得健康</p></div></div>

        <div class="card">
          <div class="card-title"><span class="icon">📋</span>今日减脂推荐</div>
          <div class="stat-card" style="margin-bottom:8px;"><div class="stat-icon">🌅</div><div class="stat-content"><div class="stat-label">早餐</div><div class="stat-value" style="font-size:15px;">${data.breakfast}</div></div></div>
          <div class="stat-card" style="margin-bottom:8px;"><div class="stat-icon">☀️</div><div class="stat-content"><div class="stat-label">午餐</div><div class="stat-value" style="font-size:15px;">${data.lunch}</div></div></div>
          <div class="stat-card" style="margin-bottom:8px;"><div class="stat-icon">🌙</div><div class="stat-content"><div class="stat-label">晚餐</div><div class="stat-value" style="font-size:15px;">${data.dinner}</div></div></div>
          <div class="stat-card"><div class="stat-icon">🍎</div><div class="stat-content"><div class="stat-label">加餐</div><div class="stat-value" style="font-size:15px;">${data.snack}</div></div></div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🔥</span>热量计算</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <input type="text" id="calFood" list="foodList" placeholder="食材名称" style="flex:1;min-width:120px;">
            <datalist id="foodList">${Object.keys(data.calories).map(f => `<option value="${f}">`).join('')}</datalist>
            <input type="number" id="calWeight" placeholder="克数" style="width:90px;">
            <button class="btn btn-mint" id="addCal">计算</button>
          </div>
          <div id="calResult" style="margin-top:12px;"></div>
          <div id="calList" style="margin-top:12px;">
            ${(data.calList || []).map((c, i) => `
              <div class="list-item" style="display:flex;justify-content:space-between;align-items:center;">
                <span>${c.name} ${c.weight}g ≈ ${c.total} kcal</span>
                <button class="btn btn-sm btn-outline" data-del-cal="${i}">删除</button>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:12px;text-align:center;">
            <div class="stat-value" id="calTotal">今日摄入：${(data.calList || []).reduce((s, c) => s + c.total, 0)} kcal</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📝</span>饮食记录</div>
          <div id="dietRecords">
            ${(data.records || []).map((r, i) => `
              <div class="list-item" style="display:flex;justify-content:space-between;align-items:center;">
                <div><div class="list-title">${r.text}</div><div class="list-meta">${r.time}</div></div>
                <div class="task-checkbox ${r.done ? 'checked' : ''}" data-diet="${i}">${r.done ? '✓' : ''}</div>
              </div>
            `).join('') || '<p style="color:#7a7a99;font-size:14px;">暂无记录</p>'}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <input type="text" id="dietRecordInput" placeholder="记录吃了什么..." style="flex:1;">
            <button class="btn btn-primary" id="addDietRecord">添加</button>
          </div>
        </div>

        <div class="page-footer">
          <button class="btn btn-primary" id="exportDiet" style="width:100%;margin-bottom:10px;">📤 导出每日饮食报告</button>
          <button class="btn btn-outline" data-reset style="width:100%;">🔄 重置今日记录</button>
        </div>
      `;

      el.querySelector('#addCal').addEventListener('click', () => {
        const name = el.querySelector('#calFood').value.trim();
        const weight = parseFloat(el.querySelector('#calWeight').value);
        if (!name || !weight || !data.calories[name]) {
          Toast.show('请选择列表中的食材并输入克数');
          return;
        }
        if (!data.calList) data.calList = [];
        const total = Math.round(data.calories[name] * weight / 100);
        data.calList.push({ name, weight, total });
        el.querySelector('#calFood').value = '';
        el.querySelector('#calWeight').value = '';
        save();
        renderPage('diet');
      });

      el.querySelectorAll('[data-del-cal]').forEach(btn => {
        btn.addEventListener('click', () => {
          data.calList.splice(parseInt(btn.dataset.delCal), 1);
          save();
          renderPage('diet');
        });
      });

      el.querySelector('#addDietRecord').addEventListener('click', () => {
        const input = el.querySelector('#dietRecordInput');
        const text = input.value.trim();
        if (!text) return;
        if (!data.records) data.records = [];
        data.records.push({ text, time: new Date().toLocaleString('zh-CN'), done: false });
        input.value = '';
        save();
        renderPage('diet');
      });

      el.querySelectorAll('[data-diet]').forEach(cb => {
        cb.addEventListener('click', () => {
          const idx = parseInt(cb.dataset.diet);
          data.records[idx].done = !data.records[idx].done;
          save();
          renderPage('diet');
        });
      });

      el.querySelector('#exportDiet').addEventListener('click', () => {
        const total = (data.calList || []).reduce((s, c) => s + c.total, 0);
        const report = `【张张每日减脂饮食报告】\n日期：${new Date().toLocaleDateString('zh-CN')}\n\n推荐饮食：\n早餐：${data.breakfast}\n午餐：${data.lunch}\n晚餐：${data.dinner}\n加餐：${data.snack}\n\n实际记录：\n${(data.records || []).map(r => `${r.done ? '[✓]' : '[ ]'} ${r.text} (${r.time})`).join('\n')}\n\n热量统计：${total} kcal\n\n继续保持，你超棒的！🌙`;
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `张张饮食报告_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.show('饮食报告已导出');
      });

      el.querySelector('[data-reset]').addEventListener('click', () => {
        data.records = [];
        data.calList = [];
        save();
        renderPage('diet');
        Toast.show('已重置');
      });
    },

    // 4. 运动塑形锻炼
    exercise(el) {
      const data = appData.exercise;
      const day = new Date().getDay();
      const plan = data.weeklyPlan[day];
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      if (!data.completed) data.completed = {};
      const todayKey = new Date().toISOString().split('T')[0];
      if (!data.completed[todayKey]) data.completed[todayKey] = [];

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">💪 运动塑形锻炼</h1><p class="page-subtitle">${dayNames[day]}专属计划 · 美少女战士养成中</p></div></div>

        <div class="card">
          <div class="card-title"><span class="icon">📅</span>今日运动计划</div>
          ${plan.map((item, i) => `
            <div class="task-item">
              <div class="task-checkbox ${data.completed[todayKey].includes(item) ? 'checked' : ''}" data-exercise="${item}">${data.completed[todayKey].includes(item) ? '✓' : ''}</div>
              <div class="task-text ${data.completed[todayKey].includes(item) ? 'completed' : ''}" style="flex:1;">${item}</div>
              <button class="btn btn-sm btn-primary" data-video="${item}">▶️ 跟练</button>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">➕</span>自定义运动</div>
          <div class="task-list">
            ${data.custom.map((c, i) => `
              <div class="task-item">
                <div class="task-checkbox ${data.completed[todayKey].includes(c.name) ? 'checked' : ''}" data-custom-exercise="${c.name}">${data.completed[todayKey].includes(c.name) ? '✓' : ''}</div>
                <div class="task-text ${data.completed[todayKey].includes(c.name) ? 'completed' : ''}" style="flex:1;">${c.name}</div>
                <button class="btn btn-sm btn-outline" data-del-custom="${i}">删除</button>
              </div>
            `).join('') || '<p style="color:#7a7a99;font-size:14px;">暂无自定义项目</p>'}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <input type="text" id="customExercise" placeholder="添加自定义运动项目..." style="flex:1;">
            <button class="btn btn-mint" id="addExercise">添加</button>
          </div>
        </div>

        ${resetButtonHTML()}
      `;

      el.querySelectorAll('[data-exercise]').forEach(cb => {
        cb.addEventListener('click', () => {
          const item = cb.dataset.exercise;
          const idx = data.completed[todayKey].indexOf(item);
          if (idx > -1) data.completed[todayKey].splice(idx, 1);
          else data.completed[todayKey].push(item);
          save();
          renderPage('exercise');
        });
      });

      el.querySelectorAll('[data-video]').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.dataset.video;
          let url = data.videoMap['帕梅拉'];
          for (const key in data.videoMap) {
            if (item.includes(key)) { url = data.videoMap[key]; break; }
          }
          Modal.show(`
            <div class="modal-title">▶️ ${item}</div>
            <div class="video-player" id="videoScreen">🎬</div>
            <div class="video-controls">
              <button class="btn btn-sm btn-primary" id="videoPlayPause">⏸ 暂停</button>
              <select class="btn-sm" id="videoSpeed" style="width:auto;border-radius:18px;padding:6px 10px;">
                <option value="0.5">0.5x</option><option value="1.0" selected>1.0x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2.0">2.0x</option>
              </select>
            </div>
            <p style="color:#7a7a99;font-size:13px;margin-top:10px;">视频源将跳转至B站对应教学视频：</p>
            <a href="${url}" target="_blank" class="btn btn-primary" style="width:100%;margin-top:8px;">去B站观看</a>
            <div class="modal-actions"><button class="btn btn-sm" data-cancel>关闭</button></div>
          `);
          let playing = true;
          const playBtn = document.getElementById('videoPlayPause');
          const screen = document.getElementById('videoScreen');
          playBtn.addEventListener('click', () => {
            playing = !playing;
            playBtn.textContent = playing ? '⏸ 暂停' : '▶️ 播放';
            screen.textContent = playing ? '🎬' : '⏸';
            Toast.show(playing ? '继续播放' : '已暂停');
          });
          document.getElementById('videoSpeed').addEventListener('change', (e) => {
            Toast.show('播放速度：' + e.target.value + 'x');
          });
        });
      });

      el.querySelectorAll('[data-custom-exercise]').forEach(cb => {
        cb.addEventListener('click', () => {
          const item = cb.dataset.customExercise;
          const idx = data.completed[todayKey].indexOf(item);
          if (idx > -1) data.completed[todayKey].splice(idx, 1);
          else data.completed[todayKey].push(item);
          save();
          renderPage('exercise');
        });
      });

      el.querySelectorAll('[data-del-custom]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.delCustom);
          const removed = data.custom[idx].name;
          data.custom.splice(idx, 1);
          data.completed[todayKey] = data.completed[todayKey].filter(x => x !== removed);
          save();
          renderPage('exercise');
        });
      });

      el.querySelector('#addExercise').addEventListener('click', () => {
        const input = el.querySelector('#customExercise');
        const name = input.value.trim();
        if (!name) return;
        data.custom.push({ name });
        input.value = '';
        save();
        renderPage('exercise');
      });

      attachReset(el, 'wellness.tasks', () => {
        data.completed[todayKey] = [];
        save();
        renderPage('exercise');
      });
    },

    // 5. 自媒体每日灵感
    inspiration(el) {
      const data = appData.inspiration;
      const sortedHot = [...data.hotRemix].sort((a, b) => b.heat - a.heat);

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">💡 自媒体每日灵感</h1><p class="page-subtitle">记录灵感，捕捉爆款</p></div></div>

        <div class="card">
          <div class="card-title"><span class="icon">💭</span>每日选题灵感</div>
          <div class="chip-group">
            ${data.topics.map(t => `<span class="chip">${t}</span>`).join('')}
          </div>
          <button class="btn btn-sm btn-outline" id="refreshTopics">🔄 刷新选题</button>
          <textarea id="topicInput" placeholder="写下你的选题灵感..." style="margin-top:12px;">${data.myTopic || ''}</textarea>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🔥</span>爆款热点视频二创 <span style="font-size:12px;color:#7a7a99;font-weight:400;">（已按热度排序）</span></div>
          <div id="hotList">
            ${sortedHot.map(h => `
              <div class="list-item">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="chip ${h.heat >= 90 ? 'active' : ''}">${h.tag}</span>
                  <span style="font-size:12px;color:#ff9a52;font-weight:600;">🔥 ${h.heat}</span>
                </div>
                <div class="list-title" style="margin-top:6px;">${h.title}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📊</span>内容复盘</div>
          <textarea id="reviewInput" placeholder="记录今天发布内容的数据、心得、改进方向...">${data.review || ''}</textarea>
          <div style="margin-top:10px;display:flex;gap:8px;">
            <button class="btn btn-primary" id="saveReview">保存复盘</button>
            <button class="btn btn-mint" id="markReviewDone">标记完成</button>
          </div>
        </div>
      `;

      el.querySelector('#refreshTopics').addEventListener('click', () => {
        data.topics.sort(() => Math.random() - 0.5);
        save();
        renderPage('inspiration');
        Toast.show('选题已刷新');
      });

      const topicInput = el.querySelector('#topicInput');
      topicInput.addEventListener('input', () => {
        data.myTopic = topicInput.value;
        save();
      });

      const reviewInput = el.querySelector('#reviewInput');
      el.querySelector('#saveReview').addEventListener('click', () => {
        data.review = reviewInput.value;
        save();
        Toast.show('复盘已保存');
      });
      el.querySelector('#markReviewDone').addEventListener('click', () => {
        data.reviewDone = true;
        save();
        Toast.show('已标记完成');
      });
    },

    // 6. 热点新闻
    news(el) {
      const data = appData.news;
      const savedTags = appData.newsTags || [];
      const tags = ['全部', '公考', '自媒体', '养生', '理财'];
      const filtered = savedTags.length && !savedTags.includes('全部')
        ? data.filter(n => savedTags.includes(n.category))
        : data;

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">🔥 热点新闻</h1><p class="page-subtitle">关注你感兴趣的领域</p></div></div>

        <div class="card">
          <div class="card-title"><span class="icon">🏷️</span>兴趣标签</div>
          <div class="chip-group">
            ${tags.map(t => `<span class="chip ${savedTags.includes(t) ? 'active' : ''}" data-tag="${t}">${t}</span>`).join('')}
          </div>
        </div>

        <div id="newsList">
          ${filtered.map(n => `
            <div class="list-item" data-news="${n.id}" style="cursor:pointer;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div class="list-title" style="flex:1;">${n.title}</div>
                <span class="chip" style="margin-left:8px;">${n.category}</span>
              </div>
              <div class="list-meta">${n.time} · 🔥 ${n.heat}</div>
            </div>
          `).join('')}
        </div>
      `;

      el.querySelectorAll('[data-tag]').forEach(chip => {
        chip.addEventListener('click', () => {
          const tag = chip.dataset.tag;
          if (!appData.newsTags) appData.newsTags = [];
          if (tag === '全部') appData.newsTags = ['全部'];
          else {
            appData.newsTags = appData.newsTags.filter(t => t !== '全部');
            if (appData.newsTags.includes(tag)) appData.newsTags = appData.newsTags.filter(t => t !== tag);
            else appData.newsTags.push(tag);
            if (!appData.newsTags.length) appData.newsTags = ['全部'];
          }
          save();
          renderPage('news');
        });
      });

      el.querySelectorAll('[data-news]').forEach(item => {
        item.addEventListener('click', () => {
          const news = data.find(n => n.id == item.dataset.news);
          Modal.show(`
            <div class="modal-title">${news.title}</div>
            <div class="list-meta" style="margin-bottom:10px;">${news.time} · ${news.category} · 🔥 ${news.heat}</div>
            <p style="line-height:1.7;">${news.content}</p>
            <div class="modal-actions"><button class="btn btn-sm" data-cancel>关闭</button></div>
          `);
        });
      });
    },

    // 7. 成长书籍推荐
    books(el) {
      const data = appData.books;
      const readTags = [...new Set(data.filter(b => b.status === '已读').map(b => b.tag))];
      const recommendations = WBData.books.filter(b => readTags.includes(b.tag) && !data.find(d => d.id === b.id));

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">📚 成长书籍推荐</h1><p class="page-subtitle">每月更新，按阅读偏好推荐</p></div></div>

        ${recommendations.length ? `
        <div class="card">
          <div class="card-title"><span class="icon">✨</span>猜你喜欢</div>
          ${recommendations.map(b => `
            <div class="list-item">
              <div class="list-title">${b.title} <span class="chip">${b.tag}</span></div>
              <div class="list-meta">${b.author}</div>
            </div>
          `).join('')}
        </div>` : ''}

        <div class="card">
          <div class="card-title"><span class="icon">📖</span>我的书单</div>
          ${data.map((b, i) => `
            <div class="list-item">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div style="flex:1;">
                  <div class="list-title">${b.title} <span class="chip">${b.tag}</span></div>
                  <div class="list-meta">${b.author}</div>
                </div>
                <select class="book-status" data-book="${i}" style="width:auto;min-width:80px;">
                  <option value="未读" ${b.status === '未读' ? 'selected' : ''}>未读</option>
                  <option value="在读" ${b.status === '在读' ? 'selected' : ''}>在读</option>
                  <option value="已读" ${b.status === '已读' ? 'selected' : ''}>已读</option>
                </select>
              </div>
              <textarea class="book-note" data-book="${i}" placeholder="写下读书笔记..." style="margin-top:8px;min-height:60px;">${b.note || ''}</textarea>
            </div>
          `).join('')}
        </div>
      `;

      el.querySelectorAll('.book-status').forEach(sel => {
        sel.addEventListener('change', () => {
          data[sel.dataset.book].status = sel.value;
          save();
          renderPage('books');
        });
      });

      el.querySelectorAll('.book-note').forEach(ta => {
        ta.addEventListener('input', () => {
          data[ta.dataset.book].note = ta.value;
          save();
        });
      });
    },

    // 8. 理财存钱
    finance(el) {
      const data = appData.finance;
      const totalIncome = data.records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const totalExpense = data.records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
      const savedTotal = data.goal.saved + (totalIncome - totalExpense);
      const progress = Math.min(100, (savedTotal / data.goal.target) * 100);
      const alreadyWarned = data.warned80 || false;

      if (progress >= 80 && !alreadyWarned) {
        data.warned80 = true;
        save();
        setTimeout(() => {
          Modal.show(`
            <div class="modal-title">🎉 目标进度提醒</div>
            <p>你的「${data.goal.name}」存钱进度已达到 <strong>${Math.round(progress)}%</strong>，离目标越来越近啦！</p>
            <div class="modal-actions"><button class="btn btn-primary" data-cancel>继续加油</button></div>
          `);
        }, 500);
      }

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">💰 理财存钱</h1><p class="page-subtitle">积少成多，未来可期</p></div></div>

        <div class="card" style="text-align:center;">
          <div class="card-title" style="justify-content:center;"><span class="icon">🎯</span>${data.goal.name}</div>
          ${ringProgress(progress)}
          <div style="margin-top:10px;">
            <div class="stat-value">¥${savedTotal.toFixed(2)} / ¥${data.goal.target}</div>
            <div class="stat-label">完成度 ${Math.round(progress)}%</div>
          </div>
          ${progress >= 80 ? '<div style="margin-top:10px;color:#ff9a52;font-weight:600;">🎉 即将达成目标！</div>' : ''}
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📝</span>记一笔</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <select id="finType" style="width:auto;min-width:80px;"><option value="income">收入</option><option value="expense">支出</option></select>
            <input type="number" id="finAmount" placeholder="金额" style="flex:1;min-width:100px;">
            <input type="text" id="finNote" placeholder="备注" style="flex:1;min-width:100px;">
            <button class="btn btn-primary" id="addFin">添加</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📋</span>收支明细</div>
          ${data.records.slice().reverse().map((r, i) => `
            <div class="list-item" style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div class="list-title">${r.note}</div>
                <div class="list-meta">${r.date}</div>
              </div>
              <div style="font-weight:700;color:${r.type === 'income' ? '#4ad3a8' : '#ff9a52'};">
                ${r.type === 'income' ? '+' : '-'}¥${r.amount.toFixed(2)}
              </div>
            </div>
          `).join('') || '<p style="color:#7a7a99;font-size:14px;">暂无记录</p>'}
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🎯</span>理财目标</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <input type="text" id="goalName" value="${data.goal.name}" placeholder="目标名称" style="flex:1;min-width:120px;">
            <input type="number" id="goalTarget" value="${data.goal.target}" placeholder="目标金额" style="flex:1;min-width:120px;">
            <button class="btn btn-mint" id="saveGoal">保存</button>
          </div>
        </div>
      `;

      el.querySelector('#addFin').addEventListener('click', () => {
        const type = el.querySelector('#finType').value;
        const amount = parseFloat(el.querySelector('#finAmount').value);
        const note = el.querySelector('#finNote').value.trim();
        if (!amount || !note) { Toast.show('请填写完整'); return; }
        data.records.push({ id: Date.now(), type, amount, note, date: new Date().toISOString().split('T')[0] });
        save();
        renderPage('finance');
      });

      el.querySelector('#saveGoal').addEventListener('click', () => {
        data.goal.name = el.querySelector('#goalName').value;
        data.goal.target = parseFloat(el.querySelector('#goalTarget').value) || 10000;
        data.warned80 = false;
        save();
        renderPage('finance');
        Toast.show('目标已更新');
      });
    },

    // 9. 赚钱信息差
    moneyInfo(el) {
      const data = appData.moneyInfo;

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">💎 赚钱信息差</h1><p class="page-subtitle">发现机会，轻量尝试</p></div></div>

        <div id="moneyList">
          ${data.map((m, i) => `
            <div class="list-item">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div class="list-title" style="flex:1;">${m.title}</div>
                <button class="btn btn-sm ${m.collected ? 'btn-primary' : 'btn-outline'}" data-collect="${i}">${m.collected ? '★' : '☆'}</button>
              </div>
              <div class="list-desc">${m.content}</div>
              <div class="list-meta">来源：${m.source} · ${m.time}</div>
              <div style="margin-top:8px;display:flex;gap:8px;">
                <button class="btn btn-sm btn-outline" data-share="${i}">📤 分享</button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">➕</span>添加信息差</div>
          <input type="text" id="miTitle" placeholder="标题" style="margin-bottom:8px;">
          <textarea id="miContent" placeholder="内容详情..." style="margin-bottom:8px;min-height:60px;"></textarea>
          <input type="text" id="miSource" placeholder="来源" style="margin-bottom:8px;">
          <button class="btn btn-primary" id="addMoneyInfo">保存</button>
        </div>
      `;

      el.querySelectorAll('[data-collect]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.collect);
          data[idx].collected = !data[idx].collected;
          save();
          renderPage('moneyInfo');
        });
      });

      el.querySelectorAll('[data-share]').forEach(btn => {
        btn.addEventListener('click', () => {
          const m = data[parseInt(btn.dataset.share)];
          const text = `【赚钱信息差】${m.title}\n${m.content}\n来源：${m.source} ${m.time}`;
          navigator.clipboard?.writeText(text).then(() => Toast.show('已复制到剪贴板'));
        });
      });

      el.querySelector('#addMoneyInfo').addEventListener('click', () => {
        const title = el.querySelector('#miTitle').value.trim();
        const content = el.querySelector('#miContent').value.trim();
        const source = el.querySelector('#miSource').value.trim();
        if (!title || !content) { Toast.show('请填写标题和内容'); return; }
        data.unshift({ id: Date.now(), title, content, source: source || '用户添加', time: new Date().toLocaleDateString('zh-CN'), collected: false });
        save();
        renderPage('moneyInfo');
      });
    },

    // 10. 自我提升
    selfImprovement(el) {
      const data = appData.selfImprovement;
      if (!data.checkins) data.checkins = {};
      const today = new Date().toISOString().split('T')[0];

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">🌟 自我提升</h1><p class="page-subtitle">修身修心，多维成长</p></div></div>

        <div class="card">
          <div class="card-title"><span class="icon">🧘</span>修身修心功课</div>
          ${taskListHTML(data.spiritual.map((s, i) => ({ text: s, done: !!data.checkins[`${today}-sp${i}`] })), 'selfImprovement.spiritual')}
          <div style="margin-top:10px;">
            <input type="text" id="newSpirit" placeholder="添加自定义功课..." style="flex:1;">
            <button class="btn btn-sm btn-primary" id="addSpirit" style="margin-top:8px;">添加</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🎨</span>艺术技能 · 小白课程推荐</div>
          ${Object.entries(data.courses).map(([key, c]) => `
            <div class="list-item">
              <div class="list-title">${c.name}</div>
              <div class="list-meta">平台：${c.platform}</div>
              <div class="list-desc">${c.desc}</div>
              <a href="${c.url}" target="_blank" class="btn btn-sm btn-primary" style="margin-top:8px;">去学习</a>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📅</span>近30天打卡日历</div>
          <div class="calendar-grid" id="checkinCalendar"></div>
        </div>

        ${resetButtonHTML()}
      `;

      el.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('click', () => {
          const idx = parseInt(cb.dataset.index);
          const key = `${today}-sp${idx}`;
          data.checkins[key] = !data.checkins[key];
          save();
          renderPage('selfImprovement');
        });
      });

      el.querySelector('#addSpirit').addEventListener('click', () => {
        const input = el.querySelector('#newSpirit');
        const text = input.value.trim();
        if (!text) return;
        data.spiritual.push(text);
        input.value = '';
        save();
        renderPage('selfImprovement');
      });

      const calendar = el.querySelector('#checkinCalendar');
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      calendar.innerHTML = days.map(d => `<div class="calendar-day header">${d}</div>`).join('');
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const checked = Object.keys(data.checkins).some(k => k.startsWith(key) && data.checkins[k]);
        const isToday = i === 0;
        calendar.innerHTML += `<div class="calendar-day ${checked ? 'checked' : 'missed'}" style="${isToday ? 'border:2px solid var(--accent-pink);' : ''}">${d.getDate()}</div>`;
      }

      attachReset(el, 'selfImprovement.spiritual', () => {
        data.checkins = {};
        save();
        renderPage('selfImprovement');
      });
    },

    // 11. 博客精选
    blogs(el) {
      const data = appData.blogs;

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">📰 博客精选</h1><p class="page-subtitle">每周更新 · 公考 · 自媒体 · 成长</p></div></div>

        ${data.map(b => `
          <div class="list-item">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="flex:1;">
                <div class="list-title">${b.title}</div>
                <div class="list-meta">${b.source} · ${b.category} · ${b.date}</div>
              </div>
              <button class="btn btn-sm ${b.collected ? 'btn-primary' : 'btn-outline'}" data-collect-blog="${b.id}">${b.collected ? '★' : '☆'}</button>
            </div>
            <div style="margin-top:8px;display:flex;gap:8px;">
              <button class="btn btn-sm btn-primary" data-read-blog="${b.id}">阅读详情</button>
            </div>
          </div>
        `).join('')}
      `;

      el.querySelectorAll('[data-collect-blog]').forEach(btn => {
        btn.addEventListener('click', () => {
          const b = data.find(x => x.id == btn.dataset.collectBlog);
          b.collected = !b.collected;
          save();
          renderPage('blogs');
        });
      });

      el.querySelectorAll('[data-read-blog]').forEach(btn => {
        btn.addEventListener('click', () => {
          const b = data.find(x => x.id == btn.dataset.readBlog);
          Modal.show(`
            <div class="modal-title">${b.title}</div>
            <div class="list-meta" style="margin-bottom:10px;">${b.source} · ${b.category} · ${b.date}</div>
            <p style="line-height:1.7;">这是一篇精选${b.category}领域博客文章。持续学习，每天进步一点点！</p>
            <a href="${b.url}" target="_blank" class="btn btn-primary" style="width:100%;margin-top:10px;">去原文阅读</a>
            <div class="modal-actions"><button class="btn btn-sm" data-cancel>关闭</button></div>
          `);
        });
      });
    },

    // 12. 养生
    wellness(el) {
      const data = appData.wellness;

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">🍵 养生</h1><p class="page-subtitle">照顾好自己的身心</p></div></div>

        <div class="card">
          <div class="card-title"><span class="icon">💡</span>今日养生建议</div>
          ${data.tips.map(t => `<div class="list-item"><div class="list-desc">${t}</div></div>`).join('')}
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">🌿</span>今日养生任务</div>
          ${taskListHTML(data.tasks, 'wellness.tasks', { deletable: false })}
          ${taskListHTML(data.custom.map(c => ({ text: c.text, done: c.done })), 'wellness.custom')}
          <div style="display:flex;gap:8px;margin-top:12px;">
            <input type="text" id="customWellness" placeholder="添加自定义养生任务..." style="flex:1;">
            <button class="btn btn-mint" id="addWellness">添加</button>
          </div>
        </div>

        ${resetButtonHTML()}
      `;

      attachTaskEvents(el, 'wellness.tasks');
      el.querySelectorAll('[data-index]').forEach(cb => {
        if (cb.closest('.task-list')?.dataset.key === 'wellness.custom') {
          cb.addEventListener('click', () => {
            const idx = parseInt(cb.dataset.index);
            data.custom[idx].done = !data.custom[idx].done;
            save();
            renderPage('wellness');
          });
        }
      });

      el.querySelector('#addWellness').addEventListener('click', () => {
        const input = el.querySelector('#customWellness');
        const text = input.value.trim();
        if (!text) return;
        data.custom.push({ text, done: false });
        input.value = '';
        save();
        renderPage('wellness');
      });

      attachReset(el, 'wellness.tasks');
    },

    // 13. 我的树洞
    treeHole(el) {
      const data = appData.treeHole;
      const moods = [
        { label: '开心', class: 'mood-happy' },
        { label: '平静', class: 'mood-calm' },
        { label: '焦虑', class: 'mood-anxious' },
        { label: '疲惫', class: 'mood-tired' },
        { label: '兴奋', class: 'mood-excited' }
      ];
      let selectedMood = moods[1];

      el.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">🌳 我的树洞</h1><p class="page-subtitle">在这里，你可以对自己说任何话</p></div></div>

        <div class="card">
          <div class="card-title"><span class="icon">😊</span>今日心情</div>
          <div class="chip-group" id="moodSelector">
            ${moods.map(m => `<span class="chip ${m.class} ${m.label === selectedMood.label ? 'active' : ''}" data-mood="${m.label}">${m.label}</span>`).join('')}
          </div>
          <textarea id="treeInput" placeholder="写下今天的心情、想法或秘密..." style="margin-top:10px;"></textarea>
          <button class="btn btn-primary" id="saveTree" style="width:100%;margin-top:12px;">保存到树洞</button>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📊</span>月度情绪报告</div>
          <div id="moodReport"></div>
        </div>

        <div class="card">
          <div class="card-title"><span class="icon">📜</span>历史记录</div>
          <div id="treeHistory">
            ${data.entries.slice().reverse().map(e => `
              <div class="list-item">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <span class="chip ${e.moodColor}">${e.mood}</span>
                  <span class="list-meta">${e.date}</span>
                </div>
                <div class="list-desc">${e.text}</div>
              </div>
            `).join('') || '<p style="color:#7a7a99;font-size:14px;">还没有记录哦</p>'}
          </div>
        </div>
      `;

      el.querySelectorAll('#moodSelector .chip').forEach(chip => {
        chip.addEventListener('click', () => {
          selectedMood = moods.find(m => m.label === chip.dataset.mood);
          el.querySelectorAll('#moodSelector .chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        });
      });

      el.querySelector('#saveTree').addEventListener('click', () => {
        const text = el.querySelector('#treeInput').value.trim();
        if (!text) { Toast.show('写点什么吧'); return; }
        data.entries.push({
          id: Date.now(),
          date: new Date().toLocaleDateString('zh-CN'),
          mood: selectedMood.label,
          moodColor: selectedMood.class,
          text
        });
        save();
        renderPage('treeHole');
        Toast.show('已保存到树洞');
      });

      const reportEl = el.querySelector('#moodReport');
      const counts = {};
      data.entries.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
      if (!Object.keys(counts).length) {
        reportEl.innerHTML = '<p style="color:#7a7a99;font-size:14px;">记录越多，报告越丰富</p>';
      } else {
        const total = data.entries.length;
        reportEl.innerHTML = Object.entries(counts).map(([mood, count]) => {
          const m = moods.find(x => x.label === mood) || moods[1];
          const pct = Math.round((count / total) * 100);
          return `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <span class="chip ${m.class}">${mood}</span>
              <div style="flex:1;height:10px;background:#f0f0f5;border-radius:5px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--accent-pink),var(--accent-blue));"></div>
              </div>
              <span style="font-size:13px;color:#7a7a99;min-width:40px;text-align:right;">${count}次</span>
            </div>
          `;
        }).join('');
      }
    }
  };

  // ==================== 初始化 ====================
  function init() {
    renderSidebar();
    switchPage('workTasks');

    // 每天早上8点模拟更新考试资讯
    const now = new Date();
    if (now.getHours() >= 8) {
      const today = now.toISOString().split('T')[0];
      if (appData.lastExamUpdate !== today) {
        appData.lastExamUpdate = today;
        appData.workTasks.examTips.unshift(`【${today} 8:00 更新】今日时政热点与备考提醒已送达`);
        if (appData.workTasks.examTips.length > 6) appData.workTasks.examTips.pop();
        save();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
