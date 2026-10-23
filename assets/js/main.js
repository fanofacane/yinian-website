/* 一念智能 官网脚本 */

// 表单提交地址：接入表单服务（如自建接口、腾讯问卷、金数据等）后填写。
// 留空时，表单不会发送数据，而是提示访客通过电话或微信联系。
var FORM_ENDPOINT = '';

(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  // 顶部导航滚动阴影
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 移动端菜单
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 滚动渐显
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // 数字滚动
  var nums = document.querySelectorAll('[data-count]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var start = null;
    var dur = 1200;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); nio.unobserve(e.target); }
      });
    }, { threshold: .4 });
    nums.forEach(function (el) { nio.observe(el); });
  }

  // 服务页锚点导航高亮
  var svcLinks = document.querySelectorAll('.svc-nav a');
  if (svcLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    svcLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          svcLinks.forEach(function (a) { a.classList.remove('active'); });
          var link = map[e.target.id];
          if (link) {
            link.classList.add('active');
            link.scrollIntoView({ block: 'nearest', inline: 'center' });
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) sio.observe(sec);
    });
  }

  // 案例筛选
  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      document.querySelectorAll('[data-services]').forEach(function (card) {
        var list = card.getAttribute('data-services').split(' ');
        card.hidden = !(f === 'all' || list.indexOf(f) > -1);
      });
    });
  });

  // 联系表单
  var form = document.getElementById('contact-form');
  if (form) {
    var msg = form.querySelector('.form-msg');
    var phoneRe = /^1[3-9]\d{9}$/;

    function setInvalid(field, bad) {
      field.classList.toggle('invalid', bad);
    }
    function validate() {
      var ok = true;
      form.querySelectorAll('[data-required]').forEach(function (input) {
        var field = input.closest('.field');
        var v = input.value.trim();
        var bad = !v || (input.name === 'phone' && !phoneRe.test(v.replace(/[\s-]/g, '')));
        setInvalid(field, bad);
        if (bad) ok = false;
      });
      var consent = form.querySelector('#consent');
      var cWrap = consent.closest('.consent');
      cWrap.classList.toggle('invalid', !consent.checked);
      if (!consent.checked) ok = false;
      return ok;
    }
    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      el.addEventListener('input', function () {
        var field = el.closest('.field');
        if (field && field.classList.contains('invalid')) validate();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg';
      if (!validate()) {
        var first = form.querySelector('.invalid input, .invalid textarea, .invalid select, .consent.invalid input');
        if (first) first.focus();
        return;
      }
      var data = new FormData(form);
      var services = data.getAll('service');
      var payload = {};
      data.forEach(function (v, k) { if (k !== 'service') payload[k] = v; });
      payload.service = services.join('、');

      if (!FORM_ENDPOINT) {
        msg.textContent = '在线表单暂未开通，请直接致电或添加微信与我们联系，我们会尽快回复。';
        msg.classList.add('show', 'warn');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = '提交中…';
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('bad status');
        form.reset();
        msg.textContent = '提交成功！我们会尽快与您联系。';
        msg.classList.add('show', 'ok');
      }).catch(function () {
        msg.textContent = '提交失败，请稍后重试，或直接致电 / 添加微信联系我们。';
        msg.classList.add('show', 'warn');
      }).then(function () {
        btn.disabled = false;
        btn.textContent = '提交咨询';
      });
    });
  }
})();
