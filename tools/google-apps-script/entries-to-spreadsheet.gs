/**
 * 申込データをスプレッドシートへ自動追記する Google Apps Script。
 *
 * LP の申込フォーム → /api/event-entry → このWebアプリ → スプレッドシート
 * という流れで、送信のたびに1行ずつ追記されます。
 * メール本文の解析は行わないため、レイアウト変更や文字化けの影響を受けません。
 *
 * ------------------------------------------------------------------
 * 設置手順
 * ------------------------------------------------------------------
 * 1. 受け皿にするスプレッドシートを作成し、URLの /d/ と /edit の間にある
 *    IDを下の SHEET_ID に貼り付ける
 * 2. 推測されにくい文字列（英数字30文字程度）を TOKEN に設定する
 * 3. Apps Script エディタで「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *      次のユーザーとして実行 : 自分
 *      アクセスできるユーザー : 全員
 * 4. 発行されたURLの末尾に ?token=（2で決めた文字列）を付けたものを、
 *    Vercel の環境変数 ENTRY_WEBHOOK_URL に設定する
 *      例: https://script.google.com/macros/s/AKfy.../exec?token=xxxxxxxx
 * 5. LPから1件テスト送信し、シートに追記されることを確認する
 *
 * ※ スクリプトを修正したら、必ず「デプロイを管理」→ 鉛筆アイコン →
 *    バージョン「新バージョン」で再デプロイしてください（URLは変わりません）。
 */

/**
 * ★ 追記先のスプレッドシートID。
 * スプレッドシートの「拡張機能 → Apps Script」から作った場合は、
 * 空のままで構いません（そのスプレッドシートへ書き込みます）。
 */
var SHEET_ID = '';

/** ★ 合言葉。ENTRY_WEBHOOK_URL の ?token= と同じ値にする */
var TOKEN = '';

/**
 * 追記先のシート（タブ）名。存在しなければ自動で作成します。
 * 既存のタブへ書き込みたい場合は、そのタブ名に変えてください。
 */
var SHEET_NAME = '申込一覧';

/**
 * ★ 申込内容の通知先メールアドレス。カンマ区切りで複数指定できます。
 * 空にするとメールは送りません（スプレッドシートへの追記だけ行います）。
 *
 * 送信元は、このスクリプトを実行しているGoogleアカウントのアドレスになります。
 * 1日の送信上限は 100通（Gmail個人）／1,500通（Google Workspace）です。
 */
var NOTIFY_TO = 'saiyo@romanlife.co.jp,info@any-ware.jp';

/**
 * 動作確認用の自分の受信アドレス（testMailSelf / checkMail で使用）。
 * 本番の動作には影響しません。
 */
var MY_EMAIL = '';

var HEADERS = [
  '受付日時', '受付番号', '参加希望日', '参加希望時間',
  '氏名', 'フリガナ', '学校名', '学部・学科', '卒業予定年月',
  'メールアドレス', '電話番号', '知ったきっかけ', 'ご質問・ご要望',
  '個人情報の同意', '同意日時',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  '流入元', '着地ページ', '送信ID',
];

function doPost(e) {
  try {
    if (!TOKEN || !e || !e.parameter || e.parameter.token !== TOKEN) {
      return json({ ok: false, message: 'unauthorized' });
    }
    var data = JSON.parse(e.postData.contents);

    // 同じ送信IDが既にあれば追記しない（二重送信・再試行への備え）
    var sheet = getSheet();
    if (data.submissionId && isDuplicate(sheet, data.submissionId)) {
      return json({ ok: true, duplicated: true });
    }

    var src = data.source || {};
    sheet.appendRow([
      data.submittedAtJst || new Date(),
      data.receiptNumber || '',
      data.eventDateDisplay || '',
      [data.sessionLabel, data.sessionTime].filter(String).join(' '),
      data.name || '',
      data.nameKana || '',
      data.school || '',
      data.faculty || '',
      data.graduation || '',
      data.email || '',
      "'" + (data.phone || ''),   // 先頭の0が消えないよう文字列として入れる
      data.referral || '',
      data.question || '',
      data.privacyAgreed ? '同意済み' : '未同意',
      data.privacyAgreedAt || '',
      src.utm_source || '', src.utm_medium || '', src.utm_campaign || '',
      src.utm_content || '', src.utm_term || '',
      src.referrer || '', src.landingPage || '',
      data.submissionId || '',
    ]);

    // メール通知（失敗しても記録は残るよう、ここでは処理を止めない）
    try {
      sendNotification(data);
    } catch (mailErr) {
      Logger.log('メール送信に失敗しました: ' + mailErr);
    }
    return json({ ok: true });
  } catch (err) {
    // 失敗をLP側へ伝えるため、200で ok:false を返さずエラーとして扱う
    return json({ ok: false, message: String(err) });
  }
}

function getSheet() {
  // SHEET_ID 未設定なら、このスクリプトが紐づくスプレッドシートを使う
  var book = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!book) {
    throw new Error('スプレッドシートが見つかりません。SHEET_ID を設定してください。');
  }
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function isDuplicate(sheet, submissionId) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var col = HEADERS.indexOf('送信ID') + 1;
  var values = sheet.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === submissionId) return true;
  }
  return false;
}

/** 申込内容を担当者へメールで送る */
function sendNotification(data) {
  if (!NOTIFY_TO) return;
  var body = [
    'オープン・カンパニーの参加申込みがありました。',
    '',
    '受付番号：' + (data.receiptNumber || ''),
    '申込日時：' + (data.submittedAtJst || '') + '（日本時間）',
    '',
    '── 参加希望 ──',
    '参加希望日：' + (data.eventDateDisplay || ''),
    '参加希望時間：' + [data.sessionLabel, data.sessionTime].filter(String).join(' '),
    '',
    '── お申込者 ──',
    '氏名：' + (data.name || ''),
    'フリガナ：' + (data.nameKana || ''),
    '学校名：' + (data.school || ''),
    '学部・学科：' + (data.faculty || ''),
    '卒業予定年月：' + (data.graduation || ''),
    'メールアドレス：' + (data.email || ''),
    '電話番号：' + (data.phone || ''),
    '知ったきっかけ：' + (data.referral || ''),
    '',
    '── ご質問・ご要望 ──',
    data.question || '（記載なし）',
    '',
    '── 個人情報の取り扱い ──',
    (data.privacyAgreed ? '同意済み' : '未同意') + '（' + (data.privacyAgreedAt || '') + '）',
    '',
    '※このメールは申込フォームから自動送信されています。',
    '　一覧はスプレッドシートをご確認ください。',
  ].join('\n');

  var options = { name: 'ロマンライフ 申込フォーム' };
  // 申込者のアドレスが妥当なときだけ Reply-To を付ける
  // （届かないアドレスを入れると迷惑メール判定されやすいため）
  if (data.email && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(data.email)) {
    options.replyTo = data.email;
  }
  MailApp.sendEmail(
    NOTIFY_TO,
    '【オープン・カンパニー】新規申込み ' + (data.receiptNumber || '') +
      '　' + (data.name || '') + ' 様',
    body,
    options
  );
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * 動作確認用。Apps Script エディタ上でこの関数を実行すると、
 * テスト用の1行が追記されます（確認後は行を削除してください）。
 * LPから送信しなくても、シートの作成と書き込み権限を確かめられます。
 */
function testAppend() {
  var sheet = getSheet();
  var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  sheet.appendRow([
    now, 'TEST-0001', '（テスト）2026年8月11日（火）', '午前の部 10:00〜13:00',
    'テスト　太郎', 'テスト　タロウ', 'テスト大学', 'テスト学部',
    '2028年3月卒業予定', 'test@example.com', "'09000000000",
    'テスト', 'これはテスト行です。確認後は削除してください。',
    '同意済み', now,
    '', '', '', '', '', '', '', 'test-' + now,
  ]);
  Logger.log('テスト行を追記しました。「' + SHEET_NAME + '」シートを確認してください。');
}

/** メール送信だけを確認したいときに実行します */
function testMail() {
  sendNotification({
    receiptNumber: 'TEST-0001',
    submittedAtJst: Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'),
    eventDateDisplay: '（テスト）2026年8月11日（火）',
    sessionLabel: '午前の部', sessionTime: '10:00〜13:00',
    name: 'テスト　太郎', nameKana: 'テスト　タロウ',
    school: 'テスト大学', faculty: 'テスト学部',
    graduation: '2028年3月卒業予定',
    email: '', phone: '09000000000',
    referral: 'テスト', question: 'これはテスト送信です。',
    privacyAgreed: true, privacyAgreedAt: '',
  });
  Logger.log('テストメールを送信しました：' + NOTIFY_TO);
}

/**
 * メールが届かないときの切り分け用。
 * 送信元アカウント・残り送信可能数・宛先を実行ログへ出します。
 */
function checkMail() {
  Logger.log('送信元アカウント：' + Session.getActiveUser().getEmail());
  Logger.log('本日あと送れる通数：' + MailApp.getRemainingDailyQuota());
  Logger.log('通知先（NOTIFY_TO）：' + NOTIFY_TO);
  Logger.log('確認用アドレス（MY_EMAIL）：' + (MY_EMAIL || '未設定'));
}

/**
 * 自分宛だけに、余計な要素を省いたテキストメールを送ります。
 * これが届けば送信機能は正常で、原因は受信側の振り分けにあります。
 */
function testMailSelf() {
  if (!MY_EMAIL) {
    Logger.log('MY_EMAIL に自分の受信アドレスを設定してから実行してください。');
    return;
  }
  MailApp.sendEmail(
    MY_EMAIL,
    'テスト送信 ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'HH:mm:ss'),
    'Apps Script からのテスト送信です。これが届けば、メール送信の設定は正常です。'
  );
  Logger.log(MY_EMAIL + ' へ送信しました。受信トレイと迷惑メールを確認してください。');
}

/**
 * ブラウザで /exec を開いたときの応答。
 * デプロイが生きているかの確認用で、データは一切返しません。
 */
function doGet() {
  return ContentService
    .createTextOutput('OK: 申込データの受け口は動作しています。')
    .setMimeType(ContentService.MimeType.TEXT);
}
