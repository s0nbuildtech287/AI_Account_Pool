import { useState, useEffect } from 'react';

const KNOWN_LOGOS = {
  cursor: 'https://www.cursor.com/favicon.ico',
  codex: 'https://cdn.openai.com/API/logo-small.png',
  windsurf: 'https://windsurf.com/favicon.ico',
  'v0': 'https://v0.dev/favicon.ico',
  lovable: 'https://lovable.dev/favicon.ico',
  bolt: 'https://bolt.new/favicon.ico',
  replit: 'https://replit.com/public/icons/favicon-96x96.png',
  gemini: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
  perplexity: 'https://www.perplexity.ai/favicon.ico',
  chatgpt: 'https://chat.openai.com/favicon.ico',
  claude: 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/claude.svg',
  grok: 'https://x.ai/favicon.ico',
  copilot: 'https://copilot.microsoft.com/favicon.ico',
  kiro: 'https://kiro.dev/favicon.ico',
};

const guessLogo = (platform) => {
  if (!platform) return '';
  const key = platform.toLowerCase().trim();
  if (KNOWN_LOGOS[key]) return KNOWN_LOGOS[key];
  const domain = key.replace(/\s+/g, '') + '.com';
  return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64';
};

const logoFor = (acc) => {
  return acc.logo || guessLogo(acc.platform);
};

const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
};

const fmtCD = (ms) => {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}n ${String(rh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
};

function App() {
  // Accounts state
  const [accounts, setAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aip_v3') || '[]');
    } catch (e) {
      return [];
    }
  });

  // UI state
  const [filter, setFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [viewMode, setViewMode] = useState('flat');
  const [now, setNow] = useState(Date.now());
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aip_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  });

  // Modal state
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalIoOpen, setModalIoOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state
  const [fPlatform, setFPlatform] = useState('');
  const [fLogo, setFLogo] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fNote, setFNote] = useState('');
  const [fStatus, setFStatus] = useState('ready');
  const [fDur, setFDur] = useState('24');
  const [fUnit, setFUnit] = useState('3600000');

  // Import/Export modal state
  const [ioMode, setIoMode] = useState('export'); // 'import' | 'export'
  const [ioJson, setIoJson] = useState('');
  const [ioMsg, setIoMsg] = useState('');
  const [ioTitle, setIoTitle] = useState('Export JSON');

  // Persist accounts
  useEffect(() => {
    localStorage.setItem('aip_v3', JSON.stringify(accounts));
  }, [accounts]);

  // Tick for countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Esc to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalAddOpen(false);
        setModalIoOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate cropped favicon from logo
  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(size / img.width, size / img.height) * 2.0;
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (size - w) / 2;
      const y = (size - h) / 2;
      ctx.drawImage(img, x, y, w, h);
      const faviconEl = document.getElementById('favicon');
      if (faviconEl) {
        faviconEl.href = canvas.toDataURL('image/png');
      }
    };
    img.src = '/logo/logo-removebg-preview.png';
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('aip_theme', next);
  };

  const getAccountStatus = (acc, currentTime) => {
    if (acc.status === 'ready') return 'ready';
    if (acc.status === 'cooling') {
      if (acc.resetAt && currentTime >= acc.resetAt) return 'expired';
      return 'cooling';
    }
    return 'expired';
  };

  const markUsed = (id) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    const dur = prompt('Cooldown bao nhiêu? (giờ, hoặc ngày kiểu 7d)', '24');
    if (!dur) return;
    const ms = dur.trim().endsWith('d')
      ? parseFloat(dur) * 86400000
      : parseFloat(dur) * 3600000;
    if (!ms || ms <= 0) return;

    setAccounts(
      accounts.map((a) =>
        a.id === id ? { ...a, status: 'cooling', resetAt: Date.now() + ms } : a
      )
    );
  };

  const markCooling = (id) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    const dur = prompt('Chờ reset bao nhiêu giờ?', '24');
    if (!dur) return;
    const ms = parseFloat(dur) * 3600000;
    if (!ms || ms <= 0) return;

    setAccounts(
      accounts.map((a) =>
        a.id === id ? { ...a, status: 'cooling', resetAt: Date.now() + ms } : a
      )
    );
  };

  const markReady = (id) => {
    setAccounts(
      accounts.map((a) =>
        a.id === id ? { ...a, status: 'ready', resetAt: null } : a
      )
    );
  };

  const delAccount = (id) => {
    if (!confirm('Xoá account này?')) return;
    setAccounts(accounts.filter((a) => a.id !== id));
  };

  const openAdd = () => {
    setEditId(null);
    setFPlatform('');
    setFLogo('');
    setFEmail('');
    setFNote('');
    setFStatus('ready');
    setFDur('24');
    setFUnit('3600000');
    setModalAddOpen(true);
  };

  const editAccount = (id) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    setEditId(id);
    setFPlatform(acc.platform || '');
    setFLogo(acc.logo || '');
    setFEmail(acc.email || '');
    setFNote(acc.note || '');
    setFStatus(acc.status || 'ready');
    // For duration, if cooling, check resetAt
    if (acc.status === 'cooling' && acc.resetAt) {
      const diff = acc.resetAt - Date.now();
      const hours = Math.ceil(diff / 3600000);
      setFDur(String(hours > 0 ? hours : 24));
      setFUnit('3600000');
    } else {
      setFDur('24');
      setFUnit('3600000');
    }
    setModalAddOpen(true);
  };

  const saveAccount = () => {
    if (!fPlatform.trim() && !fEmail.trim()) {
      alert('Nhập ít nhất platform hoặc email.');
      return;
    }
    let resetAt = null;
    if (fStatus === 'cooling') {
      resetAt = Date.now() + parseFloat(fDur) * parseFloat(fUnit);
    }

    if (editId) {
      setAccounts(
        accounts.map((a) =>
          a.id === editId
            ? {
                ...a,
                platform: fPlatform.trim(),
                email: fEmail.trim(),
                note: fNote.trim(),
                logo: fLogo.trim(),
                status: fStatus,
                resetAt,
              }
            : a
        )
      );
    } else {
      setAccounts([
        ...accounts,
        {
          id: uid(),
          platform: fPlatform.trim(),
          email: fEmail.trim(),
          note: fNote.trim(),
          logo: fLogo.trim(),
          status: fStatus,
          resetAt,
          createdAt: Date.now(),
        },
      ]);
    }
    setModalAddOpen(false);
  };

  const doExport = () => {
    const json = JSON.stringify(accounts, null, 2);
    setIoMode('export');
    setIoTitle('Export JSON');
    setIoMsg(`${accounts.length} account — Copy hoặc tải file về.`);
    setIoJson(json);
    setModalIoOpen(true);
  };

  const copyJSON = () => {
    navigator.clipboard
      .writeText(ioJson)
      .then(() => {
        setIoMsg('✅ Đã copy vào clipboard!');
      })
      .catch(() => {
        const el = document.getElementById('io-json');
        if (el) {
          el.select();
          document.execCommand('copy');
          setIoMsg('✅ Đã copy vào clipboard!');
        }
      });
  };

  const downloadJSON = () => {
    const blob = new Blob([ioJson], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ai-accounts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const openImport = () => {
    setIoMode('import');
    setIoTitle('Import JSON');
    setIoMsg('Dán JSON vào đây rồi chọn chế độ nhập bên dưới.');
    setIoJson('');
    setModalIoOpen(true);
  };

  const doImport = (mode) => {
    let parsed;
    try {
      parsed = JSON.parse(ioJson.trim());
    } catch (e) {
      alert('JSON không hợp lệ.');
      return;
    }
    if (!Array.isArray(parsed)) {
      alert('Dữ liệu phải là mảng JSON.');
      return;
    }
    const cleanParsed = parsed.map((a) => ({
      id: a.id || uid(),
      platform: a.platform || '',
      email: a.email || '',
      note: a.note || '',
      logo: a.logo || '',
      status: a.status || 'ready',
      resetAt: a.resetAt || null,
      createdAt: a.createdAt || Date.now(),
    }));

    if (mode === 'replace') {
      if (!confirm(`Thay thế toàn bộ ${accounts.length} account hiện tại?`))
        return;
      setAccounts(cleanParsed);
    } else {
      const ex = new Set(accounts.map((a) => a.id));
      let added = 0;
      const merged = [...accounts];
      cleanParsed.forEach((a) => {
        if (!ex.has(a.id)) {
          merged.push(a);
          added++;
        }
      });
      alert(`Merge: thêm ${added}, bỏ qua ${cleanParsed.length - added} trùng.`);
      setAccounts(merged);
    }
    setModalIoOpen(false);
  };

  // Get distinct platforms for filter
  const getPlatforms = () => {
    const seen = new Set();
    const list = [];
    accounts.forEach((a) => {
      const p = a.platform || '';
      if (p && !seen.has(p)) {
        seen.add(p);
        list.push(a);
      }
    });
    return list.sort((a, b) =>
      (a.platform || '').localeCompare(b.platform || '')
    );
  };

  const distinctPlatforms = getPlatforms();

  // Statistics
  const readyCount = accounts.filter(
    (a) => getAccountStatus(a, now) === 'ready'
  ).length;
  const coolingCount = accounts.filter(
    (a) => getAccountStatus(a, now) === 'cooling'
  ).length;
  const expiredCount = accounts.filter(
    (a) => getAccountStatus(a, now) === 'expired'
  ).length;

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    const status = getAccountStatus(a, now);
    const stOk = filter === 'all' || status === filter;
    const pfOk = platformFilter === 'all' || a.platform === platformFilter;
    return stOk && pfOk;
  });

  // Group accounts if viewMode is 'group'
  const groupedAccounts = {};
  if (viewMode === 'group') {
    filteredAccounts.forEach((a) => {
      const k = a.platform || '(Không rõ)';
      if (!groupedAccounts[k]) groupedAccounts[k] = [];
      groupedAccounts[k].push(a);
    });
  }
  const groupKeys = Object.keys(groupedAccounts).sort();

  // Render card JSX
  const renderCard = (acc) => {
    const st = getAccountStatus(acc, now);
    const dotClass =
      st === 'ready'
        ? 'dot-ready'
        : st === 'cooling'
        ? 'dot-cooling'
        : 'dot-expired';
    const logo = logoFor(acc);

    let timerHtml = null;
    if (st === 'ready') {
      timerHtml = (
        <div className="timer-block">
          <i
            className="ti ti-circle-check"
            aria-hidden="true"
            style={{ color: 'var(--green)', fontSize: '14px' }}
          ></i>
          <span className="timer-label">Sẵn sàng sử dụng</span>
          <span className="timer-val tv-ready">✓</span>
        </div>
      );
    } else if (st === 'cooling') {
      const rem = acc.resetAt - now;
      timerHtml = (
        <div className="timer-block">
          <i
            className="ti ti-hourglass"
            aria-hidden="true"
            style={{ fontSize: '14px', color: 'var(--amber)' }}
          ></i>
          <span className="timer-label">Reset sau</span>
          <span className="timer-val tv-cooling">{fmtCD(rem)}</span>
        </div>
      );
    } else {
      timerHtml = (
        <div className="timer-block">
          <i
            className="ti ti-alert-circle"
            aria-hidden="true"
            style={{ fontSize: '14px', color: 'var(--red)' }}
          ></i>
          <span className="timer-label">Hết giới hạn</span>
          <span className="timer-val tv-expired">Hết</span>
        </div>
      );
    }

    let actions = null;
    if (st === 'ready') {
      actions = (
        <button className="act-btn primary" onClick={() => markUsed(acc.id)}>
          <i className="ti ti-player-play" aria-hidden="true"></i> Dùng ngay
        </button>
      );
    } else if (st === 'cooling') {
      actions = (
        <button className="act-btn" onClick={() => markReady(acc.id)}>
          <i className="ti ti-check" aria-hidden="true"></i> Ready ngay
        </button>
      );
    } else {
      actions = (
        <>
          <button
            className="act-btn primary"
            onClick={() => markCooling(acc.id)}
          >
            <i className="ti ti-refresh" aria-hidden="true"></i> Bắt đầu chờ
          </button>
          <button className="act-btn" onClick={() => markReady(acc.id)}>
            Ready
          </button>
        </>
      );
    }

    const initials = (acc.platform || '?').slice(0, 2).toUpperCase();

    return (
      <div
        className="card"
        key={acc.id}
        data-id={acc.id}
        data-status={st}
        style={{
          '--card-accent':
            st === 'ready'
              ? 'var(--green)'
              : st === 'cooling'
              ? 'var(--amber)'
              : 'var(--red)',
        }}
      >
        <div className="card-top">
          <div className="card-logo-wrap">
            {logo ? (
              <img
                className="card-logo"
                src={logo}
                alt={acc.platform || ''}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const av = document.getElementById(`av-${acc.id}`);
                  if (av) av.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="card-logo-avatar"
              id={`av-${acc.id}`}
              style={{ display: logo ? 'none' : 'flex' }}
            >
              {initials}
            </div>
            <span className="platform-name">{acc.platform || '—'}</span>
          </div>
          <div className="card-top-right">
            <div className={`status-dot ${dotClass}`} title={st}></div>
            <button
              className="del-btn"
              onClick={() => delAccount(acc.id)}
              aria-label="Xoá account"
            >
              <i className="ti ti-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card-info">
          <div className="card-email">{acc.email || '—'}</div>
          <div className="card-note">{acc.note || ''}</div>
        </div>
        {timerHtml}
        <div className="card-actions">
          {actions}
          <button
            className="act-btn"
            onClick={() => editAccount(acc.id)}
            style={{ marginLeft: 'auto' }}
            aria-label="Sửa"
          >
            <i className="ti ti-pencil" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    );
  };

  const autoLogoSrc = fLogo || (fPlatform ? guessLogo(fPlatform) : '');

  return (
    <div className="app" id="app">
      {/* Header */}
      <div className="hdr">
        <div className="hdr-left">
          <div className="hdr-brand">
            <div
              className="hdr-icon"
              style={{
                background: 'none',
                boxShadow: 'none',
                padding: 0,
                overflow: 'hidden',
                width: '52px',
                height: '52px',
                flexShrink: 0,
              }}
            >
              <img
                src="/logo/logo-removebg-preview.png"
                alt="Logo"
                style={{
                  width: '130%',
                  height: '130%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  margin: '-15%',
                  display: 'block',
                }}
              />
            </div>
            <div>
              <div className="hdr-title">AI Account Pool</div>
              <span className="hdr-sub">Quản lý tài khoản AI</span>
            </div>
          </div>
          <div className="stats-row" id="stats">
            <span className="stat-pill s-ready">
              <i className="ti ti-check" aria-hidden="true"></i>
              {readyCount} ready
            </span>
            <span className="stat-pill s-cooling">
              <i className="ti ti-clock" aria-hidden="true"></i>
              {coolingCount} chờ
            </span>
            <span className="stat-pill s-expired">
              <i className="ti ti-alert-triangle" aria-hidden="true"></i>
              {expiredCount} hết hạn
            </span>
          </div>
        </div>
        <div className="hdr-actions">
          <button
            className="theme-btn"
            onClick={toggleTheme}
            title="Chuyển theme"
            aria-label="Chuyển theme sáng/tối"
          >
            <i
              className={theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon'}
              id="theme-icon"
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </div>

      {/* Platform filter */}
      <div className="platform-section">
        <div className="platform-filter" id="platform-filter">
          <button
            className={`pf-btn${platformFilter === 'all' ? ' active' : ''}`}
            onClick={() => setPlatformFilter('all')}
          >
            <i
              className="ti ti-apps"
              aria-hidden="true"
              style={{ fontSize: '14px' }}
            ></i>
            Tất cả <span className="pf-count">{accounts.length}</span>
          </button>
          {distinctPlatforms.map((a) => {
            const logo = logoFor(a);
            const cnt = accounts.filter(
              (x) => x.platform === a.platform
            ).length;
            const active = platformFilter === a.platform;
            const initials = (a.platform || '?').slice(0, 2).toUpperCase();

            return (
              <button
                key={a.id}
                className={`pf-btn${active ? ' active' : ''}`}
                onClick={() => setPlatformFilter(a.platform)}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt=""
                    onError={(e) => {
                      e.target.outerHTML = `<div class="pf-avatar">${initials}</div>`;
                    }}
                  />
                ) : (
                  <div className="pf-avatar">{initials}</div>
                )}
                {a.platform} <span className="pf-count">{cnt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="filter-group">
          <button
            className={`filter-btn${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn${filter === 'ready' ? ' active' : ''}`}
            onClick={() => setFilter('ready')}
          >
            Ready
          </button>
          <button
            className={`filter-btn${filter === 'cooling' ? ' active' : ''}`}
            onClick={() => setFilter('cooling')}
          >
            Đang chờ
          </button>
          <button
            className={`filter-btn${filter === 'expired' ? ' active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Hết hạn
          </button>
        </div>

        <div className="divider"></div>

        <div className="view-toggle">
          <button
            className={`vt-btn${viewMode === 'flat' ? ' active' : ''}`}
            id="vt-flat"
            onClick={() => setViewMode('flat')}
            title="Lưới phẳng"
          >
            <i className="ti ti-layout-grid" aria-hidden="true"></i>
          </button>
          <button
            className={`vt-btn${viewMode === 'group' ? ' active' : ''}`}
            id="vt-group"
            onClick={() => setViewMode('group')}
            title="Nhóm platform"
          >
            <i className="ti ti-layout-list" aria-hidden="true"></i>
          </button>
        </div>

        <div className="toolbar-right">
          <button className="icon-btn" onClick={openImport}>
            <i className="ti ti-upload" aria-hidden="true"></i>{' '}
            <span>Import</span>
          </button>
          <button className="icon-btn" onClick={doExport}>
            <i className="ti ti-download" aria-hidden="true"></i>{' '}
            <span>Export</span>
          </button>
          <button className="icon-btn primary" onClick={openAdd}>
            <i className="ti ti-plus" aria-hidden="true"></i> <span>Thêm</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div id="content">
        {filteredAccounts.length === 0 ? (
          <div className="grid">
            <div className="empty">
              <i className="ti ti-inbox empty-icon" aria-hidden="true"></i>
              <div className="empty-title">Không có account nào</div>
              <div>Thêm account mới hoặc thay đổi bộ lọc</div>
            </div>
          </div>
        ) : viewMode === 'flat' ? (
          <div className="grid">
            {filteredAccounts.map((acc) => renderCard(acc))}
          </div>
        ) : (
          groupKeys.map((k) => {
            const sample = groupedAccounts[k][0];
            const logo = logoFor(sample);
            const initials = (k || '?').slice(0, 2).toUpperCase();
            const logoEl = logo ? (
              <img
                src={logo}
                alt=""
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="group-avatar">{initials}</div>
            );

            return (
              <div key={k}>
                <div className="group-hdr">
                  {logoEl}
                  {k}
                  <span className="group-count">
                    {groupedAccounts[k].length}
                  </span>
                </div>
                <div className="grid">
                  {groupedAccounts[k].map((acc) => renderCard(acc))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalAddOpen && (
        <div
          className="overlay"
          id="modal-add"
          onClick={() => setModalAddOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <i
                  className={editId ? 'ti ti-edit' : 'ti ti-user-plus'}
                  id="modal-icon-el"
                  aria-hidden="true"
                ></i>
              </div>
              <h3 id="modal-title">
                {editId ? 'Sửa account' : 'Thêm account mới'}
              </h3>
            </div>

            <div className="field">
              <label>Platform</label>
              <input
                id="f-platform"
                list="platforms-list"
                placeholder="Cursor, Codex, Windsurf…"
                value={fPlatform}
                onChange={(e) => setFPlatform(e.target.value)}
              />
              <datalist id="platforms-list">
                <option value="Cursor" />
                <option value="Codex" />
                <option value="Windsurf" />
                <option value="v0" />
                <option value="Lovable" />
                <option value="Bolt" />
                <option value="Replit" />
                <option value="Gemini" />
                <option value="Kiro" />
                <option value="Perplexity" />
                <option value="ChatGPT" />
                <option value="Claude" />
                <option value="Grok" />
                <option value="Copilot" />
              </datalist>
            </div>

            <div className="field">
              <label>
                Logo URL{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>
                  (tuỳ chọn)
                </span>
              </label>
              <input
                id="f-logo"
                placeholder="https://…"
                value={fLogo}
                onChange={(e) => setFLogo(e.target.value)}
              />
              <div className="logo-preview-row">
                {autoLogoSrc ? (
                  <img
                    id="logo-preview"
                    className="logo-preview"
                    src={autoLogoSrc}
                    alt=""
                  />
                ) : null}
                <span className="logo-hint" id="logo-hint">
                  {fLogo
                    ? ''
                    : autoLogoSrc
                    ? `Tự động: ${autoLogoSrc}`
                    : 'Để trống — tự lấy favicon'}
                </span>
              </div>
            </div>

            <div className="field">
              <label>Email / Tên account</label>
              <input
                id="f-email"
                placeholder="email@example.com hoặc tên bất kỳ"
                value={fEmail}
                onChange={(e) => setFEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Ghi chú</label>
              <textarea
                id="f-note"
                placeholder="Mật khẩu, token, ghi chú…"
                value={fNote}
                onChange={(e) => setFNote(e.target.value)}
              ></textarea>
            </div>

            <div className="section-sep">Trạng thái</div>

            <div className="field">
              <label>Trạng thái ban đầu</label>
              <select
                id="f-status"
                value={fStatus}
                onChange={(e) => setFStatus(e.target.value)}
              >
                <option value="ready">✅ Ready</option>
                <option value="cooling">⏳ Đang chờ reset</option>
                <option value="expired">❌ Hết hạn</option>
              </select>
            </div>

            {fStatus === 'cooling' && (
              <div className="field" id="cooling-block">
                <label>Thời gian còn lại đến khi reset</label>
                <div className="reset-row">
                  <input
                    type="number"
                    id="f-dur"
                    min="1"
                    value={fDur}
                    onChange={(e) => setFDur(e.target.value)}
                  />
                  <select
                    id="f-unit"
                    value={fUnit}
                    onChange={(e) => setFUnit(e.target.value)}
                  >
                    <option value="3600000">giờ</option>
                    <option value="86400000">ngày</option>
                    <option value="604800000">tuần</option>
                  </select>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="act-btn"
                onClick={() => setModalAddOpen(false)}
              >
                <i className="ti ti-x" aria-hidden="true"></i> Huỷ
              </button>
              <button className="act-btn primary" onClick={saveAccount}>
                <i className="ti ti-device-floppy" aria-hidden="true"></i> Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {modalIoOpen && (
        <div
          className="overlay"
          id="modal-io"
          onClick={() => setModalIoOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <i
                  className={ioMode === 'export' ? 'ti ti-download' : 'ti ti-upload'}
                  id="io-icon"
                  aria-hidden="true"
                ></i>
              </div>
              <h3 id="io-title">{ioTitle}</h3>
            </div>
            <div className="info-msg" id="io-msg">
              {ioMsg}
            </div>
            <div className="field">
              <label id="io-label">
                {ioMode === 'export' ? 'Dữ liệu JSON' : 'JSON cần import'}
              </label>
              <textarea
                className="json-area"
                id="io-json"
                spellCheck="false"
                value={ioJson}
                onChange={(e) => setIoJson(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-footer" id="io-btns">
              {ioMode === 'export' ? (
                <>
                  <button
                    className="act-btn"
                    onClick={() => setModalIoOpen(false)}
                  >
                    <i className="ti ti-x"></i> Đóng
                  </button>
                  <button className="act-btn primary" onClick={copyJSON}>
                    <i className="ti ti-copy"></i> Copy
                  </button>
                  <button className="act-btn primary" onClick={downloadJSON}>
                    <i className="ti ti-download"></i> Tải file
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="act-btn"
                    onClick={() => setModalIoOpen(false)}
                  >
                    <i className="ti ti-x"></i> Huỷ
                  </button>
                  <button className="act-btn" onClick={() => doImport('merge')}>
                    <i className="ti ti-git-merge"></i> Merge
                  </button>
                  <button
                    className="act-btn primary"
                    onClick={() => doImport('replace')}
                  >
                    <i className="ti ti-replace"></i> Thay thế
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
