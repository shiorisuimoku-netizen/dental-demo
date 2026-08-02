/* 文字サイズの切り替え（標準／大／特大）
 *
 * 整形外科は高齢の来院者が多い。ブラウザの拡大機能を知らない方も多いので、
 * ページ内に切り替えを置く。選んだサイズは localStorage に残し、
 * 次に開いたときも維持する（毎回押し直させない）。
 *
 * 外部ライブラリは使わない。この程度の機能で読み込みを増やす必要がない。
 */
(function () {
  var KEY = 'aobano-font-size';
  var SIZES = ['normal', 'large', 'xlarge'];

  function apply(size) {
    var el = document.documentElement;
    el.classList.remove('font-large', 'font-xlarge');
    if (size === 'large') el.classList.add('font-large');
    if (size === 'xlarge') el.classList.add('font-xlarge');
    // どれが選ばれているかを支援技術にも伝える
    document.querySelectorAll('.font-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.size === size));
    });
  }

  // 保存された設定があれば、描画前に近いタイミングで当てる
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* プライベートモード等では無視 */ }
  apply(SIZES.indexOf(saved) >= 0 ? saved : 'normal');

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('.font-switch button');
    if (!btn) return;
    var size = btn.dataset.size;
    apply(size);
    try { localStorage.setItem(KEY, size); } catch (e) { /* 保存できなくても表示は変わる */ }
  });
})();
