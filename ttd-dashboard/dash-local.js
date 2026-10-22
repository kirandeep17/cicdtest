// Minimal stand-in for the claude.ai dashboard runtime, so the page runs locally.
// Implements the parts the page uses: dash.data, dash.onData, dash.calc, dash.colors.
(() => {
  // Where each dataset comes from. A dataset in window.DASH_DATA (data.js) is used
  // directly, so the page works when opened as a file; otherwise it is fetched.
  const SOURCES = {
    taxonomies: 'data/taxonomies.json',
  };

  const store = {};      // id -> {status, data, columns, message}
  const calcs = {};      // id -> {inputs, fn}
  const listeners = [];

  const rowsOf = (json) => (Array.isArray(json) ? json : json.rows || json.data || json.results || []);
  const columnsOf = (rows) => (rows.length ? Object.keys(rows[0]) : []);

  function load(id) {
    if (store[id]) return;
    store[id] = { status: 'loading', data: [], columns: [], meta: [] };
    const inline = window.DASH_DATA && window.DASH_DATA[id];
    const got = inline ? Promise.resolve(inline) : fetch(SOURCES[id]).then((r) => {
      if (!r.ok) throw new Error(`${SOURCES[id]}: HTTP ${r.status}`);
      return r.json();
    });
    got.then((json) => {
      const rows = rowsOf(json);
      store[id] = { status: 'ok', data: rows, columns: columnsOf(rows), meta: [] };
    }).catch((err) => {
      console.error(err);
      store[id] = { status: 'error', data: [], columns: [], meta: [], message: String(err.message || err) };
    }).then(notify);
  }

  function data(id) {
    if (calcs[id]) {
      const { inputs, fn } = calcs[id];
      const ins = inputs.map(data);
      const bad = ins.find((d) => d.status !== 'ok');
      if (bad) return { status: bad.status, data: [], columns: [], meta: [] };
      try {
        const out = fn(...ins.map((d) => d.data));
        return { status: 'ok', data: out, columns: Array.isArray(out) ? columnsOf(out) : [], meta: [] };
      } catch (err) {
        console.error(err);
        return { status: 'error', data: [], columns: [], meta: [], message: String(err) };
      }
    }
    if (!(id in SOURCES) && !(window.DASH_DATA && id in window.DASH_DATA)) {
      return { status: 'missing', data: [], columns: [], meta: [] };
    }
    load(id);
    return { refreshing: false, ...store[id] };
  }

  let queued = false;
  function notify() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; listeners.forEach((fn) => fn()); });
  }

  let lastWidth = 0;
  window.addEventListener('resize', () => {
    const w = document.getElementById('dash-root').clientWidth;
    if (w !== lastWidth) { lastWidth = w; notify(); }
  });

  window.dash = {
    data,
    onData(fn) { listeners.push(fn); fn(); },
    calc(id, { inputs, fn }) { calcs[id] = { inputs, fn }; },
    loader() {},
    refresh() { Object.keys(store).forEach((k) => delete store[k]); notify(); },
    params: () => ({}), setParams() {}, resetParams() {}, setLink() {},
    colors: ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)',
      'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)'],
  };
})();
