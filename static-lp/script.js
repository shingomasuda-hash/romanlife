/* =========================================================================
   ロマンライフ 説明会・オープン・カンパニー2026 ／ LP スクリプト
   ・開催日／時間／締切のデータ管理
   ・日程カードとフォームの連動
   ・入力 → 確認 → 完了 のフロー
   ========================================================================= */
(function () {
  'use strict';

  /* =======================================================================
     1. 開催日データ（★変更はここだけ）
        締切は JST の絶対時刻で持つため、端末のタイムゾーンに依存しません。
     ======================================================================= */
  var EVENT_DATES = [
    {
      id: '2026-08-31',
      displayDate: '2026年8月31日（月）',
      monthDay: '8月31日',
      monthDayWeek: '8月31日（月）',
      ymd: '2026.08.31',
      weekday: 'MON',
      readable: '2026年8月31日 月曜日',
      sessions: [
        { id: 'morning', label: '午前の部', time: '10:00〜13:00' },
        { id: 'afternoon', label: '午後の部', time: '14:30〜17:30' }
      ],
      deadline: '2026-08-30T12:00:00+09:00',
      deadlineDisplay: '2026年8月30日（日）12:00',
      deadlineShort: '8月30日（日）12:00'
    },
    {
      id: '2026-09-04',
      displayDate: '2026年9月4日（金）',
      monthDay: '9月4日',
      monthDayWeek: '9月4日（金）',
      ymd: '2026.09.04',
      weekday: 'FRI',
      readable: '2026年9月4日 金曜日',
      sessions: [
        { id: 'morning', label: '午前の部', time: '10:00〜13:00' },
        { id: 'afternoon', label: '午後の部', time: '14:30〜17:30' }
      ],
      deadline: '2026-09-03T12:00:00+09:00',
      deadlineDisplay: '2026年9月3日（木）12:00',
      deadlineShort: '9月3日（木）12:00'
    }
  ];

  var DEADLINE_NOTE = '開催日前日の12:00（正午）で受付を締め切ります。';

  /* -----------------------------------------------------------------------
     送信先の設定
     ★ ENTRY_API に送信先エンドポイントを設定してください。
       null のあいだは送信せず、確認画面から完了画面へ進むだけの動作になります
       （ダミーの外部URLは設定していません）。

       送信するデータの形は buildPayload() を参照してください。
       サーバー側でも必ず、締切・必須項目・値の妥当性を再検証してください。
     ----------------------------------------------------------------------- */
  var ENTRY_API = '/api/event-entry';   // 同一オリジンの受け口へ送信します
  var PRIVACY_POLICY_URL = '';   // 例: 'https://www.romanlife.co.jp/privacy/'

  /* =======================================================================
     2. ユーティリティ
     ======================================================================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function smoothTo(el, block) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: block || 'start' });
  }
  function isClosed(d, now) {
    return (now || new Date()).getTime() >= new Date(d.deadline).getTime();
  }
  function allClosed(now) {
    return EVENT_DATES.every(function (d) { return isClosed(d, now); });
  }
  function getDate(id) {
    for (var i = 0; i < EVENT_DATES.length; i++) if (EVENT_DATES[i].id === id) return EVENT_DATES[i];
    return null;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function icon(name, size) {
    return '<svg width="' + (size || 16) + '" height="' + (size || 16) +
      '" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  /* =======================================================================
     3. スクロール表示アニメーション
     ======================================================================= */
  (function reveal() {
    if (reduceMotion()) return;
    document.documentElement.classList.add('js');
    function start() {
      var targets = $$('[data-reveal]');
      if (!('IntersectionObserver' in window)) {
        targets.forEach(function (el) { el.classList.add('is-in'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
      targets.forEach(function (el) { io.observe(el); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  })();

  /* =======================================================================
     4. 日程カード（SECTION 08）
     ======================================================================= */
  function renderScheduleCards() {
    var wrap = $('#sch-cards');
    if (!wrap) return;
    var now = new Date();

    wrap.innerHTML = EVENT_DATES.map(function (d) {
      var closed = isClosed(d, now);
      var times = d.sessions.map(function (s, i) {
        return '' +
          '<li class="sch-time">' +
            '<span class="sch-tico">' + icon(i === 0 ? 'sun' : 'moon', 19) + '</span>' +
            '<span class="sch-tlabel">' + esc(s.label) + '</span>' +
            '<span class="sch-ttime">' + esc(s.time) + '</span>' +
          '</li>';
      }).join('');

      return '' +
      '<article class="sch-card' + (closed ? ' is-closed' : '') + '" data-reveal aria-labelledby="sch-' + d.id + '">' +
        (closed ? '<p class="sch-tag">' + icon('alert', 13) + '受付終了</p>' : '') +
        '<p class="sch-en" aria-hidden="true">' + d.ymd + '<span>' + d.weekday + '</span></p>' +
        '<h3 class="sch-ja" id="sch-' + d.id + '">' + esc(d.displayDate) + '</h3>' +
        '<div class="sch-dots" aria-hidden="true"></div>' +
        '<ul class="sch-times">' + times + '</ul>' +
        '<div class="deadline">' +
          '<span class="deadline-en">Entry Deadline</span>' +
          '<p class="deadline-top">' + icon('cal', 19) +
            '<span class="deadline-date">' + esc(d.deadlineShort.replace('12:00', '')) + '<b>12:00</b>締切</span>' +
          '</p>' +
          '<p class="deadline-note">' + DEADLINE_NOTE + '</p>' +
        '</div>' +
        (closed
          ? '<p class="sch-closed">' + icon('alert', 18) + '受付終了</p>'
          : '<div class="sch-action">' +
              '<button type="button" class="btn btn-green" data-pick="' + d.id + '">' +
                esc(d.monthDay) + 'の説明会を選択する' +
                '<span class="arw">' + icon('chev', 17) + '</span>' +
              '</button>' +
            '</div>') +
      '</article>';
    }).join('');

    if (allClosed(now)) {
      var hint = $('#sch-hint');
      if (hint) {
        hint.className = 'all-closed';
        hint.innerHTML = icon('alert', 20) + '<span>本イベントの参加申込み受付は終了しました。</span>';
      }
    }

    // 日程カード → フォーム連動
    $$('[data-pick]', wrap).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-pick');
        var sel = $('#eventDate');
        if (sel) {
          sel.value = id;
          clearError('eventDate');
        }
        track('schedule_card_click', { eventDateId: id });
        smoothTo($('#entry-form'), 'start');
        // スクロールが落ち着いたころに「参加希望時間」へ視線を誘導
        window.setTimeout(function () {
          var s = $('#session');
          if (!s) return;
          smoothTo($('#field-session'), 'center');
          s.focus({ preventScroll: true });
        }, 700);
      });
    });
  }

  /* =======================================================================
     5. 最終CTAの日程表示
     ======================================================================= */
  function renderFinalDates() {
    var wrap = $('#final-dates');
    if (!wrap) return;
    var now = new Date();
    wrap.innerHTML = EVENT_DATES.map(function (d, i) {
      var closed = isClosed(d, now);
      return '' +
      '<div class="final-date">' +
        '<p class="final-dlabel">参加希望日' + '①②③④⑤'.charAt(i) + '</p>' +
        '<p class="final-drow">' +
          '<span class="final-dico">' + icon('cal', 18) + '</span>' +
          '<span class="final-dtext">' +
            '<span class="sr-only">' + esc(d.readable) + '</span>' +
            '<span aria-hidden="true">' + esc(d.monthDay) + '<small>（' + d.displayDate.slice(-2, -1) + '）</small></span>' +
          '</span>' +
        '</p>' +
        '<p class="final-ddl">' +
          (closed
            ? '<span class="final-closed">受付終了</span>'
            : '締切　<b>' + esc(d.deadlineShort) + '</b>') +
        '</p>' +
      '</div>';
    }).join('');
  }

  /* =======================================================================
     6. フォーム
     ======================================================================= */
  var FIELDS = [
    { key: 'eventDate',      label: '参加希望日',            row: 'field-eventDate' },
    { key: 'session',        label: '参加希望時間',          row: 'field-session' },
    { key: 'lastName',       label: '氏名（姓）',            row: 'field-name' },
    { key: 'firstName',      label: '氏名（名）',            row: 'field-name' },
    { key: 'lastKana',       label: '氏名フリガナ（姓）',    row: 'field-kana' },
    { key: 'firstKana',      label: '氏名フリガナ（名）',    row: 'field-kana' },
    { key: 'school',         label: '大学・大学院・学校名',  row: 'field-school' },
    { key: 'faculty',        label: '学部・学科・研究科',    row: 'field-faculty' },
    { key: 'graduation',     label: '卒業予定年月',          row: 'field-graduation' },
    { key: 'graduationOther',label: '卒業予定年月（その他）',row: 'field-graduationOther' },
    { key: 'email',          label: 'メールアドレス',        row: 'field-email' },
    { key: 'phone',          label: '電話番号',              row: 'field-phone' },
    { key: 'referral',       label: 'このイベントを知ったきっかけ', row: 'field-referral' },
    { key: 'referralOther',  label: 'きっかけ（その他）',    row: 'field-referralOther' },
    { key: 'question',       label: '当日聞いてみたいこと',  row: 'field-question' },
    { key: 'privacy',        label: '個人情報の取り扱いへの同意', row: 'field-privacy' }
  ];

  var KANA = /^[ァ-ヶー゠-ヿ\s　]+$/;
  var NG = /<[^>]*>|javascript:|data:text\/html/i;
  var QUESTION_MAX = 500;

  var section = $('#entry-form');
  var form = $('#entry');
  var panels = {
    input: $('#panel-input'),
    confirm: $('#panel-confirm'),
    done: $('#panel-done'),
    closed: $('#panel-closed')
  };
  var statusEl = $('#form-status');
  var submissionId = '';
  var sending = false;
  var renderedAt = Date.now();

  function normalizePhone(v) {
    return String(v || '')
      .replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xfee0); })
      .replace(/[-‐‑–—ー－()（）\s　.]/g, '');
  }

  function val(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    return String(el.value || '').trim();
  }

  function readForm() {
    var o = {};
    FIELDS.forEach(function (f) { o[f.key] = val(f.key); });
    o.companyName = val('companyName');
    return o;
  }

  /* --- バリデーション（クライアント側。サーバー側でも必ず再検証すること） --- */
  function validate(d) {
    var e = {};
    var now = new Date();

    if (!d.eventDate) e.eventDate = '参加希望日を選択してください。';
    else if (!getDate(d.eventDate)) e.eventDate = '参加希望日を選択してください。';
    else if (isClosed(getDate(d.eventDate), now)) e.eventDate = 'この日程は受付を終了しました。別の日程を選択してください。';

    if (!d.session) e.session = '参加希望時間を選択してください。';

    if (!d.lastName) e.lastName = '姓を入力してください。';
    if (!d.firstName) e.firstName = '名を入力してください。';
    if (!d.lastKana) e.lastKana = '姓のフリガナを入力してください。';
    else if (!KANA.test(d.lastKana)) e.lastKana = '姓のフリガナはカタカナで入力してください。';
    if (!d.firstKana) e.firstKana = '名のフリガナを入力してください。';
    else if (!KANA.test(d.firstKana)) e.firstKana = '名のフリガナはカタカナで入力してください。';

    if (!d.school) e.school = '学校名を入力してください。';
    if (!d.faculty) e.faculty = '学部・学科・研究科を入力してください。';
    if (!d.graduation) e.graduation = '卒業予定年月を選択してください。';
    if (d.graduation === 'その他' && !d.graduationOther) e.graduationOther = '卒業予定年月を入力してください。';

    if (!d.email) e.email = 'メールアドレスを入力してください。';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = '正しいメールアドレスを入力してください。';

    if (!d.phone) e.phone = '電話番号を入力してください。';
    else if (!/^0\d{9,10}$/.test(normalizePhone(d.phone))) e.phone = '正しい電話番号を入力してください。（例：09012345678）';

    if (!d.referral) e.referral = 'このイベントを知ったきっかけを選択してください。';
    if (d.referral === 'その他' && !d.referralOther) e.referralOther = 'きっかけの詳細を入力してください。';

    if (d.question && d.question.length > QUESTION_MAX) e.question = QUESTION_MAX + '文字以内で入力してください。';
    if (!d.privacy) e.privacy = '個人情報の取り扱いへの同意が必要です。';

    // 不正な入力の混入チェック
    ['lastName', 'firstName', 'lastKana', 'firstKana', 'school', 'faculty', 'graduationOther', 'referralOther', 'question'].forEach(function (k) {
      if (d[k] && NG.test(d[k])) e[k] = '使用できない文字が含まれています。';
    });

    return e;
  }

  /* --- エラー表示 --- */
  function clearError(key) {
    var f = FIELDS.filter(function (x) { return x.key === key; })[0];
    if (!f) return;
    var row = document.getElementById(f.row);
    if (!row) return;
    var el = document.getElementById(key);
    if (el) el.removeAttribute('aria-invalid');
    var msg = row.querySelector('[data-err="' + key + '"]');
    if (msg) msg.remove();
    if (!row.querySelector('.f-err')) row.classList.remove('has-error');
  }

  function showErrors(errs) {
    $$('.f-err').forEach(function (n) { n.remove(); });
    $$('.f-row').forEach(function (r) { r.classList.remove('has-error'); });
    $$('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });

    var keys = FIELDS.map(function (f) { return f.key; }).filter(function (k) { return errs[k]; });

    keys.forEach(function (k) {
      var f = FIELDS.filter(function (x) { return x.key === k; })[0];
      var row = document.getElementById(f.row);
      if (!row) return;
      row.classList.add('has-error');
      var el = document.getElementById(k);
      if (el) el.setAttribute('aria-invalid', 'true');
      var p = document.createElement('p');
      p.className = 'f-err';
      p.setAttribute('data-err', k);
      p.id = 'err-' + k;
      p.innerHTML = icon('alert', 15) + '<span>' + esc(errs[k]) + '</span>';
      row.appendChild(p);
      if (el) el.setAttribute('aria-describedby', 'err-' + k);
    });

    var box = $('#err-summary');
    if (!keys.length) { box.hidden = true; box.innerHTML = ''; return; }

    box.hidden = false;
    box.className = 'err-summary';
    box.setAttribute('role', 'alert');
    box.innerHTML =
      icon('alert', 20) +
      '<div><h3>入力内容に' + keys.length + '件の確認が必要な項目があります</h3><ul>' +
      keys.map(function (k) {
        var f = FIELDS.filter(function (x) { return x.key === k; })[0];
        return '<li><a href="#' + k + '" data-jump="' + k + '">' + esc(f.label) + '：' + esc(errs[k]) + '</a></li>';
      }).join('') +
      '</ul></div>';

    $$('[data-jump]', box).forEach(function (a) {
      a.addEventListener('click', function (ev) { ev.preventDefault(); focusField(a.getAttribute('data-jump')); });
    });

    smoothTo(box, 'center');
    window.setTimeout(function () { focusField(keys[0]); }, 320);
  }

  function focusField(key) {
    var el = document.getElementById(key);
    var f = FIELDS.filter(function (x) { return x.key === key; })[0];
    var row = f ? document.getElementById(f.row) : null;
    smoothTo(row || el, 'center');
    window.setTimeout(function () { if (el) el.focus({ preventScroll: true }); }, 220);
  }

  /* --- ステップ表示 --- */
  function setStep(step) {
    section.setAttribute('data-step', step);
    Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = (k !== step); });

    var order = ['input', 'confirm', 'done'];
    var cur = order.indexOf(step);
    $$('[data-step-item]').forEach(function (li) {
      var i = order.indexOf(li.getAttribute('data-step-item'));
      li.classList.toggle('is-now', i === cur);
      li.classList.toggle('is-done', i < cur);
      if (i === cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    var bar = $('#steps-bar');
    if (bar) bar.hidden = (step === 'closed');

    // 画面の切り替わりをURLにも反映する。
    // 入力→確認→完了はページ遷移をしないため、そのままではURLが変わらず、
    // 計測ツールから「同じページ」にしか見えない。ハッシュだけを書き換えて
    // 別ページとして扱えるようにする（再読み込みしても同じページに戻ります）。
    // 履歴には積まないため、ブラウザの「戻る」の動きは変わりません。
    var HASH = { confirm: '#entry-confirm', done: '#entry-complete' };
    var next = HASH[step];
    var ours = (location.hash === '#entry-confirm' || location.hash === '#entry-complete');
    if ((next || ours) && window.history && history.replaceState) {
      try {
        history.replaceState(history.state, '', location.pathname + location.search + (next || ''));
      } catch (e) { /* 対応していない環境では何もしません */ }
    }
  }

  /* --- 確認画面 --- */
  function reviewRows(d) {
    var date = getDate(d.eventDate);
    var ses = date && date.sessions.filter(function (s) { return s.id === d.session; })[0];
    return [
      ['参加希望日', date ? date.displayDate : ''],
      ['参加希望時間', ses ? ses.label + '　' + ses.time : ''],
      ['氏名', d.lastName + '　' + d.firstName],
      ['氏名フリガナ', d.lastKana + '　' + d.firstKana],
      ['大学・大学院・学校名', d.school],
      ['学部・学科・研究科', d.faculty],
      ['卒業予定年月', d.graduation === 'その他' ? 'その他（' + d.graduationOther + '）' : d.graduation],
      ['メールアドレス', d.email],
      ['電話番号', normalizePhone(d.phone)],
      ['このイベントを知ったきっかけ', d.referral === 'その他' ? 'その他（' + d.referralOther + '）' : d.referral],
      ['当日聞いてみたいこと', d.question],
      ['個人情報の取り扱いへの同意', d.privacy ? '同意する' : '未同意']
    ];
  }

  function renderConfirm(d) {
    var date = getDate(d.eventDate);
    panels.confirm.innerHTML =
      '<h3 class="done-title" tabindex="-1" id="confirm-h">入力内容の確認</h3>' +
      '<p class="confirm-lead">まだお申し込みは完了していません。内容をご確認のうえ、「この内容で申し込む」を押してください。</p>' +
      '<dl class="review">' +
        reviewRows(d).map(function (r) {
          var empty = !String(r[1]).trim();
          return '<div class="review-row"><dt>' + esc(r[0]) + '</dt>' +
                 '<dd' + (empty ? ' class="empty"' : '') + '>' + (empty ? '（未入力）' : esc(r[1])) + '</dd></div>';
        }).join('') +
      '</dl>' +
      (date ? '<p class="confirm-lead" style="margin-top:20px;margin-bottom:0">' +
        esc(date.displayDate) + '開催分の申込締切は ' + esc(date.deadlineDisplay) + ' です。' + DEADLINE_NOTE + '</p>' : '') +
      '<div id="send-error"></div>' +
      '<div class="f-actions two">' +
        '<button class="btn btn-outline" type="button" id="btn-back">入力内容を修正する</button>' +
        '<button class="btn btn-green" type="button" id="btn-send">この内容で申し込む' +
          '<span class="arw">' + icon('chev', 17) + '</span></button>' +
      '</div>' +
      '<p class="f-foot">「この内容で申し込む」を押すと、入力内容が送信されます。</p>';

    $('#btn-back').addEventListener('click', function () {
      setStep('input');
      smoothTo(section, 'start');
    });
    $('#btn-send').addEventListener('click', function () { send(d); });

    window.setTimeout(function () { $('#confirm-h').focus(); }, 60);
  }

  /* --- 送信 --- */
  function buildPayload(d) {
    var date = getDate(d.eventDate);
    var ses = date && date.sessions.filter(function (s) { return s.id === d.session; })[0];
    var p = new URLSearchParams(location.search);
    return {
      submissionId: submissionId,
      renderedAt: renderedAt,
      eventDateId: d.eventDate,
      eventDateDisplay: date ? date.displayDate : '',
      sessionId: d.session,
      sessionLabel: ses ? ses.label : '',
      sessionTime: ses ? ses.time : '',
      // 受け口（/api/event-entry）の項目名に合わせる
      name: (d.lastName + '　' + d.firstName).trim(),
      nameKana: (d.lastKana + '　' + d.firstKana).trim(),
      // 姓名を分けて保存したい場合のために、分割した値も送る
      lastName: d.lastName,
      firstName: d.firstName,
      lastKana: d.lastKana,
      firstKana: d.firstKana,
      school: d.school,
      faculty: d.faculty,
      graduation: d.graduation,
      graduationOther: d.graduationOther,
      email: d.email,
      phone: normalizePhone(d.phone),
      referral: d.referral,
      referralOther: d.referralOther,
      question: d.question,
      privacyAgreed: !!d.privacy,
      privacyAgreedAt: new Date().toISOString(),
      company: d.companyName,       // ハニーポット（サーバー側で空であることを確認）
      tracking: {
        utm_source: p.get('utm_source') || '',
        utm_medium: p.get('utm_medium') || '',
        utm_campaign: p.get('utm_campaign') || '',
        utm_content: p.get('utm_content') || '',
        utm_term: p.get('utm_term') || '',
        referrer: document.referrer || '',
        landingPage: location.origin + location.pathname
      }
    };
  }

  function showSendError(msg) {
    var box = $('#send-error');
    if (!box) return;
    box.className = 'err-summary';
    box.setAttribute('role', 'alert');
    box.style.marginTop = '20px';
    box.style.marginBottom = '0';
    box.innerHTML = icon('alert', 20) +
      '<div><h3>' + esc(msg) + '</h3>' +
      '<p style="font-size:13.5px;line-height:1.8;color:var(--error)">入力内容は保持されていますので、そのまま再度お試しいただけます。</p></div>';
  }

  /**
   * 申込完了後、専用URLのサンクスページへ移動します。
   *
   * 申込内容は sessionStorage に一時保存して受け渡します。
   * URLには氏名・メールアドレスなどを一切含めません
   * （URLは共有・履歴・アクセスログに残るため）。
   *
   * 保存や移動ができない環境では false を返し、
   * これまでどおりページ内で完了画面を表示します。
   */
  var THANKS_URL = '/thanks';
  var THANKS_KEY = 'romanlife:entry:done';

  function gotoThanks(d) {
    if (!THANKS_URL) return false;
    var date = getDate(d.eventDate);
    var ses = date && date.sessions.filter(function (s) { return s.id === d.session; })[0];
    try {
      window.sessionStorage.setItem(THANKS_KEY, JSON.stringify({
        receiptNumber: d.receiptNumber || '',
        eventDateDisplay: date ? date.displayDate : '',
        sessionDisplay: ses ? ses.label + '　' + ses.time : '',
        name: (d.lastName + '　' + d.firstName).trim()
      }));
      window.location.assign(THANKS_URL);
      return true;
    } catch (e) {
      return false;
    }
  }

  function send(d) {
    if (sending) return;                       // 二重送信防止
    sending = true;
    var btn = $('#btn-send');
    var back = $('#btn-back');
    btn.disabled = true; back.disabled = true;
    btn.innerHTML = '送信しています…';
    statusEl.textContent = '送信しています。しばらくお待ちください。';

    var payload = buildPayload(d);

    function ok() {
      sending = false;
      track('entry_complete', { eventDateId: d.eventDate, sessionId: d.session });
      trackPageView('/entry/complete', '申込完了｜ロマンライフ 説明会・オープン・カンパニー');
      if (gotoThanks(d)) return;   // サンクスページへ移動できたときはここで終了
      renderDone(d);
      setStep('done');
      smoothTo(section, 'start');
      statusEl.textContent = '申込みが完了しました。';
    }
    function ng(msg) {
      sending = false;
      btn.disabled = false; back.disabled = false;
      btn.innerHTML = 'この内容で申し込む<span class="arw">' + icon('chev', 17) + '</span>';
      statusEl.textContent = '';
      showSendError(msg || '送信中に問題が発生しました。時間をおいて再度お試しください。');
      track('entry_error', {});
    }

    // ENTRY_API 未設定のあいだは送信せず、画面遷移のみ行います。
    if (!ENTRY_API) {
      window.setTimeout(ok, 700);
      return;
    }

    fetch(ENTRY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (json) {
        if (!res.ok || !json || json.ok !== true) {
          ng(json && json.message);
          return;
        }
        // 受付番号は result 配下で返ります（旧形式のトップレベルにも念のため対応）
        var receipt = (json.result && json.result.receiptNumber) || json.receiptNumber;
        if (receipt) d.receiptNumber = receipt;
        ok();
      });
    }).catch(function () { ng(); });
  }

  /* --- 完了画面 --- */
  function renderDone(d) {
    var date = getDate(d.eventDate);
    var ses = date && date.sessions.filter(function (s) { return s.id === d.session; })[0];
    panels.done.innerHTML =
      '<div class="done">' +
        '<span class="done-mark" aria-hidden="true">' + icon('check', 32) + '</span>' +
        '<h3 class="done-title" tabindex="-1" id="done-h">お申し込みありがとうございます。</h3>' +
        '<p class="done-text">ロマンライフ 説明会・オープン・カンパニーへの参加申込みを受け付けました。<br>' +
          '当日の詳細については、株式会社ロマンライフの採用担当者よりご案内します。</p>' +
        '<div class="receipt">' +
          '<h3>お申し込み内容</h3>' +
          '<dl>' +
            '<div><dt>開催日</dt><dd>' + esc(date ? date.displayDate : '—') + '</dd></div>' +
            '<div><dt>時間帯</dt><dd>' + esc(ses ? ses.label + '　' + ses.time : '—') + '</dd></div>' +
            '<div><dt>お名前</dt><dd>' + esc(d.lastName + '　' + d.firstName) + '</dd></div>' +
            '<div><dt>会場</dt><dd>株式会社ロマンライフ 本社<br>マールブランシュ ロマンの森 2階</dd></div>' +
            (d.receiptNumber ? '<div><dt>受付番号</dt><dd>' + esc(d.receiptNumber) + '</dd></div>' : '') +
          '</dl>' +
        '</div>' +
        '<p class="done-mail">' + icon('mail', 17) +
          '<span>ご入力いただいたメールアドレス宛に、受付完了メールをお送りしています。' + '数分経っても届かない場合は、迷惑メールフォルダをご確認ください。</span></p>' +
        '<p class="done-foot">当日お会いできることを、社員一同楽しみにしています。</p>' +
        '<div class="done-actions"><a class="btn btn-outline" href="#top">ページの先頭へ戻る</a></div>' +
      '</div>';
    window.setTimeout(function () { $('#done-h').focus(); }, 60);
  }

  /* --- 初期化 --- */
  function initForm() {
    if (!form) return;

    // 参加希望日の選択肢
    var sel = $('#eventDate');
    var now = new Date();
    sel.innerHTML = '<option value="">選択してください</option>' +
      EVENT_DATES.map(function (d) {
        var c = isClosed(d, now);
        return '<option value="' + d.id + '"' + (c ? ' disabled' : '') + '>' +
          esc(d.displayDate) + (c ? '（受付終了）' : '　／　' + d.deadlineShort + '締切') + '</option>';
      }).join('');

    // プライバシーポリシーのリンク。
    // URL が未設定のときは何も出しません。取り扱いの内容は上の枠内に
    // 全文を記載しているため、リンクがなくても同意の判断ができます。
    // （架空のURLは置かない方針）
    var slot = $('#policy-slot');
    if (PRIVACY_POLICY_URL) {
      slot.innerHTML = '<br><a href="' + esc(PRIVACY_POLICY_URL) + '" target="_blank" rel="noopener noreferrer">' +
        'プライバシーポリシーはこちら ' + icon('ext', 13) + '<span class="sr-only">（新しいタブで開きます）</span></a>';
    } else {
      slot.innerHTML = '';
    }

    // 「その他」選択時の追加入力
    function toggleOther(selectId, rowId) {
      var s = document.getElementById(selectId);
      var row = document.getElementById(rowId);
      var apply = function () { row.hidden = (s.value !== 'その他'); };
      s.addEventListener('change', apply);
      apply();
    }
    toggleOther('graduation', 'field-graduationOther');
    toggleOther('referral', 'field-referralOther');

    // 文字数カウンタ
    var q = $('#question'), counter = $('#q-counter');
    q.addEventListener('input', function () {
      counter.textContent = q.value.length + ' / ' + QUESTION_MAX + '文字';
      counter.classList.toggle('over', q.value.length > QUESTION_MAX);
    });

    // 入力し直したらその項目のエラーを消す
    FIELDS.forEach(function (f) {
      var el = document.getElementById(f.key);
      if (!el) return;
      el.addEventListener('input', function () { clearError(f.key); });
      el.addEventListener('change', function () { clearError(f.key); });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = readForm();
      var errs = validate(d);
      if (Object.keys(errs).length) { showErrors(errs); return; }

      showErrors({});
      submissionId = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
      renderConfirm(d);
      setStep('confirm');
      track('form_confirm_view', {});
      trackPageView('/entry/confirm', '入力内容の確認｜ロマンライフ 説明会・オープン・カンパニー');
      smoothTo(section, 'start');
    });

    // 全日程が締切済みならフォームを閉じる
    if (allClosed(now)) setStep('closed');
  }

  /* =======================================================================
     7. スマートフォン固定CTA
        フォーム表示中・入力中・確認/完了画面では隠す
     ======================================================================= */
  function initStickyCta() {
    var bar = $('#sticky-cta');
    if (!bar || !section) return;
    var inForm = false, typing = false;

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        inForm = e[0].isIntersecting; apply();
      }, { rootMargin: '-8% 0px -8% 0px' }).observe(section);
    }

    new MutationObserver(apply).observe(section, { attributes: true, attributeFilter: ['data-step'] });

    document.addEventListener('focusin', function (e) {
      if (e.target && e.target.matches && e.target.matches('input, select, textarea')) { typing = true; apply(); }
    });
    document.addEventListener('focusout', function () { typing = false; apply(); });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        typing = window.visualViewport.height < window.innerHeight * 0.75; apply();
      });
    }

    function apply() {
      var step = section.getAttribute('data-step');
      var hide = inForm || typing || step === 'confirm' || step === 'done' || step === 'closed';
      bar.classList.toggle('is-hidden', hide);
      $$('a, button', bar).forEach(function (el) {
        if (hide) el.setAttribute('tabindex', '-1'); else el.removeAttribute('tabindex');
      });
    }
    apply();
  }

  /* =======================================================================
     8. 計測（Google Analytics 等は dataLayer 経由で後から追加できます）
     ======================================================================= */
  function track(name, payload) {
    window.dataLayer = window.dataLayer || [];
    var o = { event: name };
    for (var k in payload) if (Object.prototype.hasOwnProperty.call(payload, k)) o[k] = payload[k];
    window.dataLayer.push(o);
  }

  /**
   * 仮想ページビュー。
   *
   * 入力→確認→完了は同じURLのまま画面だけが切り替わるため、
   * このままでは計測ツールから「別のページ」として見えません。
   * 各ステップで擬似的なページのアドレスとタイトルを通知し、
   * タグマネージャー側でページビューとして扱えるようにします。
   */
  function trackPageView(path, title) {
    track('virtual_pageview', {
      pagePath: path,
      pageTitle: title,
      pageLocation: location.origin + path
    });
  }

  function initCtaTracking() {
    $$('[data-cta]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('cta_click', { location: a.getAttribute('data-cta') });
      });
    });
  }

  /* =======================================================================
     起動
     ======================================================================= */
  function boot() {
    renderScheduleCards();
    renderFinalDates();
    initForm();
    initStickyCta();
    initCtaTracking();

    // 日程カードは動的生成のため、reveal を再適用
    if (!reduceMotion() && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
      $$('#sch-cards [data-reveal]').forEach(function (el) { io.observe(el); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
