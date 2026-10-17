/* বন্ধুত্ব আদালত — অ্যাপ লজিক। সবকিছু ব্রাউজারেই চলে; কোনো তথ্য সার্ভারে পাঠানো হয় না। */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[d]; }); }

  var VIOLATIONS = [
    { id: 'disrespect', label: 'অসম্মানজনক আচরণ', hint: 'চোখ উল্টানো, দীর্ঘশ্বাস, ভাব নেওয়া।', legal: 'ধারা ১০১: অসম্মানজনক আচরণ, যার মধ্যে উদ্দেশ্যমূলকভাবে চোখ উল্টানো ও ভাব নেওয়া অন্তর্ভুক্ত।', short: 'অসম্মানজনক আচরণ' },
    { id: 'insult', label: 'বাদীকে অপমান করা', hint: 'লাইসেন্সবিহীন রোস্টিং।', legal: 'ধারা ২০২: পূর্ব লিখিত অনুমতি ছাড়া বাদীকে অপমান করা।', short: 'অনুমতি ছাড়া আমাকে অপমান করা' },
    { id: 'ignore', label: 'মেসেজ উপেক্ষা করা', hint: 'সিন করে রেখে দেওয়া।', legal: 'ধারা ৩০৩: মেসেজ উপেক্ষা করা, বিশেষ করে “সিন” করে উত্তর না দেওয়া।', short: 'আমার মেসেজ সিন করে রেখে দেওয়া' },
    { id: 'food', label: 'খাবার চুরি করা', hint: 'অথবা ফুচকা-চিপস ভাগ না দেওয়া।', legal: 'ধারা ৪২০: খাবার চুরি করা এবং/অথবা ফুচকা, চিপস বা চা ভাগ না দেওয়া।', short: 'আমার খাবার চুরি করা' },
    { id: 'promises', label: 'কথা দিয়ে কথা না রাখা', hint: '“দোস্ত, পাঁচ মিনিটে আসছি।”', legal: 'ধারা ৫০৫: কথা দিয়ে কথা না রাখা, বিশেষত বিখ্যাত “দোস্ত, পাঁচ মিনিটে আসছি।”', short: 'কথা দিয়ে কথা না রাখা' },
    { id: 'annoying', label: 'অকারণে বিরক্ত করা', hint: 'নিয়মিত। সৃজনশীলভাবে।', legal: 'ধারা ৬০৬: অকারণে, নিয়মিত এবং অত্যন্ত সৃজনশীলভাবে বিরক্ত করা।', short: 'অকারণে বিরক্ত করা' },
    { id: 'other', label: 'অন্যান্য মজার অপরাধ', hint: 'লিখতেও লজ্জা লাগে।', legal: 'ধারা ৭০৭: অন্যান্য মজার অপরাধ, যা দাপ্তরিক নথিতে লেখাও লজ্জাজনক।', short: 'অন্যান্য মজার অপরাধ' }
  ];
  var PUNISHMENTS = [
    { id: 'fine', label: '১,০০০ টাকার মজার জরিমানা দেওয়া', hint: 'চা, প্রশংসা বা কাল্পনিক টাকায় পরিশোধযোগ্য।', legal: 'অভিযুক্ত **১,০০০ টাকার মজার জরিমানা** পরিশোধ করবেন, যা চা, প্রশংসা অথবা কাল্পনিক মুদ্রায় পরিশোধযোগ্য।', short: 'তোমাকে ১,০০০ টাকার মজার জরিমানা দিতে হবে' },
    { id: 'biryani', label: 'বাদীকে কাচ্চি বিরিয়ানি খাওয়ানো', hint: 'বোরহানিসহ।', legal: 'অভিযুক্ত বাদীকে **কাচ্চি বিরিয়ানি খাওয়াবেন,** বোরহানি ও ফিরনিসহ। কোনো দর-কষাকষি চলবে না।', short: 'আমাকে কাচ্চি বিরিয়ানি খাওয়াতে হবে' },
    { id: 'group', label: 'পুরো বন্ধু-গ্রুপকে চা-সিঙ্গারা খাওয়ানো', hint: 'হ্যাঁ, সবাইকে।', legal: 'অভিযুক্ত **পুরো বন্ধু-গ্রুপকে চা-সিঙ্গারা খাওয়াবেন,** যারা কিছুই করেনি তারাও অন্তর্ভুক্ত।', short: 'পুরো গ্রুপকে চা-সিঙ্গারা খাওয়াতে হবে' },
    { id: 'right', label: 'সবার সামনে স্বীকার করা যে বাদী সবসময় ঠিক', hint: 'অন্তত একজন সাক্ষীর সামনে।', legal: 'অভিযুক্ত অন্তত একজন সাক্ষীর সামনে **প্রকাশ্যে স্বীকার করবেন যে বাদী সবসময় ঠিক।**', short: 'সবার সামনে স্বীকার করতে হবে যে আমি সবসময় ঠিক' },
    { id: 'apology', label: 'নাটকীয়ভাবে ক্ষমা চাওয়া', hint: 'বাংলা সিনেমার স্টাইলে।', legal: 'অভিযুক্ত **বাংলা সিনেমার স্টাইলে নাটকীয়ভাবে ক্ষমা চাইবেন,** হাঁটু গেড়ে, কাঁপা গলায় এবং অন্তত এক ফোঁটা চোখের জলসহ।', short: 'বাংলা সিনেমার স্টাইলে নাটকীয়ভাবে ক্ষমা চাইতে হবে' }
  ];
  var TOTAL = 7, MAX_NAME = 40, MAX_CUSTOM = 120, MAX_FILE = 10 * 1024 * 1024, MAX_DIM = 1000;
  var TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  function fresh() { return { complainant: '', accused: '', photo: null, photoPreview: '', noPhoto: false, violations: [], custom: '', punishment: '', number: '', numberLatin: '', date: null }; }
  var state = fresh();
  var step = 1, docCanvas = null, docJpeg = '';

  function clean(v) { return String(v || '').replace(/[\u0000-\u001F\u007F]/g, '').replace(/\*+/g, '*').replace(/\s+/g, ' ').trim(); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  function showView(name, push) {
    $$('.view').forEach(function (v) { v.hidden = v.id !== 'view-' + name; });
    document.body.classList.toggle('has-print', name === 'result' && !!docJpeg);
    window.scrollTo(0, 0);
    if (push !== false && location.hash !== '#' + name) { try { history.pushState(null, '', '#' + name); } catch (e) { } }
  }
  function route() {
    var h = (location.hash || '#home').slice(1);
    if (h === 'result') { if (docJpeg) showView('result', false); else showView('home', false); }
    else if (h === 'create') { showView('create', false); setStep(step); }
    else showView('home', false);
  }

  function buildOptions() {
    function make(wrap, list, type, name) {
      list.forEach(function (o) {
        var label = document.createElement('label'); label.className = 'option' + (type === 'radio' ? ' radio' : '');
        var input = document.createElement('input'); input.type = type; input.name = name; input.value = o.id;
        var box = document.createElement('span'); box.className = 'box'; box.setAttribute('aria-hidden', 'true');
        var text = document.createElement('span'); text.className = 'option-text';
        var st = document.createElement('strong'); st.textContent = o.label;
        var sm = document.createElement('small'); sm.textContent = o.hint;
        text.appendChild(st); text.appendChild(sm);
        label.appendChild(input); label.appendChild(box); label.appendChild(text);
        input.addEventListener('change', function () { $$('input[name="' + name + '"]').forEach(function (i) { i.parentNode.classList.toggle('checked', i.checked); }); clearError(); });
        wrap.appendChild(label);
      });
    }
    make($('#violation-options'), VIOLATIONS, 'checkbox', 'violation');
    make($('#punishment-options'), PUNISHMENTS, 'radio', 'punishment');
  }

  function setStep(n) {
    step = n;
    $$('.step').forEach(function (s) { s.hidden = +s.dataset.step !== n; });
    $$('#progress span').forEach(function (s, i) { s.className = i + 1 < n ? 'done' : i + 1 === n ? 'current' : ''; });
    $('#step-num').textContent = bn(n);
    $('#btn-back').textContent = n === 1 ? 'বাতিল' : 'পেছনে';
    $('#btn-next').textContent = n === TOTAL ? 'চুক্তিনামা তৈরি করুন' : (n === 5 && !$('#custom').value.trim() ? 'এড়িয়ে যান' : 'পরবর্তী');
    clearError();
    if (n === TOTAL) renderReview();
    var cur = $('.step[data-step="' + n + '"]');
    var focusEl = $('input.line-input, textarea', cur) || $('h2', cur);
    if (!$('#view-create').hidden && focusEl) setTimeout(function () { try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); } }, 30);
  }

  function nameCheck(v, who) {
    if (!v) return who === 1 ? 'আদালতের আপনার নাম প্রয়োজন। ডাকনাম হলেও চলবে।' : 'আদালতের অভিযুক্তের নাম প্রয়োজন।';
    if (v.length > MAX_NAME) return 'নামটি আদালতের ধৈর্যের চেয়েও লম্বা (সর্বোচ্চ ৪০ অক্ষর)।';
    if (!/[A-Za-z0-9\u00C0-\uFFFF]/.test(v)) return 'এটা নামের মতো দেখাচ্ছে না। অন্তত একটি অক্ষর লিখুন।';
    return '';
  }
  function readStep(n) {
    var err = '';
    if (n === 1) { state.complainant = clean($('#complainant').value); err = nameCheck(state.complainant, 1); }
    if (n === 2) {
      state.accused = clean($('#accused').value); err = nameCheck(state.accused, 2);
      if (!err && state.accused.toLowerCase() === state.complainant.toLowerCase()) err = 'নিজের বিরুদ্ধে মামলা করা যায় না। আত্মসমালোচনার জন্য আলাদা আদালত আছে।';
    }
    if (n === 3 && !state.photo && !state.noPhoto) err = 'অভিযুক্তের একটি ছবি আপলোড করুন, অথবা “ছবি ছাড়াই এগিয়ে যান” বাছাই করুন।';
    if (n === 4) {
      state.violations = $$('input[name="violation"]:checked').map(function (i) { return i.value; });
      if (!state.violations.length) err = 'অন্তত একটি অপরাধ বাছাই করুন। নিশ্চয়ই সে কিছু একটা করেছে।';
    }
    if (n === 5) { state.custom = clean($('#custom').value); if (state.custom.length > MAX_CUSTOM) err = '১২০ অক্ষরের মধ্যে লিখুন। আদালতের মনোযোগ খুব কম সময় থাকে।'; }
    if (n === 6) { var p = $('input[name="punishment"]:checked'); state.punishment = p ? p.value : ''; if (!state.punishment) err = 'একটি শাস্তি বাছাই করুন। আদালত শাস্তি দিতেই চায়।'; }
    var field = { 1: '#complainant', 2: '#accused', 5: '#custom' }[n];
    if (field) $(field).setAttribute('aria-invalid', err ? 'true' : 'false');
    return err;
  }
  function showError(msg) {
    $('#form-error').textContent = 'আপত্তি! ' + msg;
    var p = $('#complaint-form'); p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake');
  }
  function clearError() { $('#form-error').textContent = ''; }

  function renderReview() {
    var dl = $('#review'); dl.textContent = '';
    function row(label, content, goto) {
      var d = document.createElement('div'); d.className = 'review-row';
      var dt = document.createElement('dt'); dt.textContent = label;
      var dd = document.createElement('dd');
      if (typeof content === 'string') dd.textContent = content; else dd.appendChild(content);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn-link'; b.textContent = 'সম্পাদনা';
      b.setAttribute('aria-label', label + ' সম্পাদনা'); b.addEventListener('click', function () { setStep(goto); });
      d.appendChild(dt); d.appendChild(dd); d.appendChild(b); dl.appendChild(d);
    }
    row('বাদী', state.complainant, 1);
    row('বিবাদী', state.accused, 2);
    if (state.photo) { var im = document.createElement('img'); im.className = 'review-thumb'; im.alt = 'অভিযুক্তের ছবি'; im.src = state.photoPreview; row('ছবি', im, 3); }
    else row('ছবি', 'ছবি নেই (পরিচয় গোপন)', 3);
    var ul = document.createElement('ul');
    state.violations.forEach(function (id) { var li = document.createElement('li'); li.textContent = byId(VIOLATIONS, id).label; ul.appendChild(li); });
    row('অপরাধসমূহ', ul, 4);
    row('অতিরিক্ত অসদাচরণ', state.custom || 'কিছু জানানো হয়নি', 5);
    row('শাস্তি', byId(PUNISHMENTS, state.punishment).label + ' (সাথে ১,০০০ টাকার মজার জরিমানা)', 6);
  }

  function isImageSig(b) {
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return true;
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return true;
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true;
    return false;
  }
  function readHead(file) {
    return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(new Uint8Array(fr.result)); }; fr.onerror = rej; fr.readAsArrayBuffer(file.slice(0, 16)); });
  }
  function loadImage(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); res(img); };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
  }
  function handleFile(file) {
    clearError();
    if (!file) return;
    var name = file.name || '';
    if (!/\.(jpe?g|png|webp)$/i.test(name) || (file.type && TYPES.indexOf(file.type) < 0)) return showError('প্রমাণ হিসেবে শুধু JPG, JPEG, PNG বা WebP ছবি গ্রহণযোগ্য।');
    if (file.size > MAX_FILE) return showError('ছবিটি ১০ MB-এর চেয়ে বড়। অনুগ্রহ করে ছোট একটি ছবি দিন।');
    if (file.size < 64) return showError('ফাইলটি খালি মনে হচ্ছে।');
    var dz = $('#dropzone'); dz.classList.add('busy'); $('#dz-title').textContent = 'প্রমাণ পরীক্ষা করা হচ্ছে…';
    readHead(file).then(function (head) {
      if (!isImageSig(head)) throw new Error('sig');
      return loadImage(file);
    }).then(function (img) {
      var w = img.naturalWidth, h = img.naturalHeight;
      if (w < 32 || h < 32) throw new Error('small');
      var k = Math.min(1, MAX_DIM / Math.max(w, h)), c = document.createElement('canvas');
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
      state.photo = c; state.photoPreview = c.toDataURL('image/jpeg', 0.85); state.noPhoto = false;
      renderPhoto();
    }).catch(function (e) {
      showError(e && e.message === 'sig' ? 'ফাইলটি নিজেকে ছবি দাবি করছে, কিন্তু আসলে ছবি নয়। ভালো চেষ্টা!' : e && e.message === 'small' ? 'ছবিটি এত ছোট যে অভিযুক্তকে চেনা যাচ্ছে না।' : 'আদালত ছবিটি খুলতে পারেনি। অন্য একটি JPG, PNG বা WebP চেষ্টা করুন।');
    }).then(function () { dz.classList.remove('busy'); $('#dz-title').textContent = 'ছবি বাছাই করতে ট্যাপ করুন'; $('#photo-input').value = ''; });
  }
  function renderPhoto() {
    var has = !!state.photo;
    $('#dropzone').hidden = has; $('#photo-preview').hidden = !has; $('#no-photo').hidden = has;
    if (has) $('#photo-thumb').src = state.photoPreview; else $('#photo-thumb').removeAttribute('src');
  }

  function makeNumber() {
    var a = new Uint8Array(6); (window.crypto || window.msCrypto).getRandomValues(a);
    var mid = String((a[0] * 256 + a[1]) % 10000).padStart(4, '0'), end = String((a[2] * 7 + a[3] * 3 + a[4]) % 1000).padStart(3, '0');
    var y = new Date().getFullYear();
    state.numberLatin = 'BA-' + y + '-' + mid + '-' + end;
    return 'বআ-' + bn(y) + '-' + bn(mid) + '-' + bn(end);
  }
  function fmtDate(d) {
    try { return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(d); }
    catch (e) { var m = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']; return bn(d.getDate()) + ' ' + m[d.getMonth()] + ', ' + bn(d.getFullYear()); }
  }
  function certData() {
    var off = state.violations.map(function (id) { return byId(VIOLATIONS, id).legal; });
    if (state.custom) off.push('ধারা ৮০৮: বাদী কর্তৃক বর্ণিত অতিরিক্ত অসদাচরণ: “' + state.custom + '”');
    return { complainant: state.complainant, accused: state.accused, photo: state.photo, offenses: off, punishment: byId(PUNISHMENTS, state.punishment).legal, number: state.number, date: fmtDate(state.date) };
  }
  function buildMessage() {
    var list = state.violations.map(function (id) { return byId(VIOLATIONS, id).short; });
    if (state.custom) list.push('“' + state.custom.replace(/[।.!?]+$/, '') + '”');
    var listTxt = list.length > 1 ? list.slice(0, -1).join(', ') + ' এবং ' + list[list.length - 1] : list[0];
    return 'প্রিয় ' + state.accused + ',\n\nবন্ধুত্ব আদালত সকল প্রমাণ পর্যালোচনা করে তোমাকে ' + listTxt + '-এর অপরাধে দোষী সাব্যস্ত করেছে।\n\nতোমাকে ১,০০০ টাকা বন্ধুত্ব জরিমানা করা হলো, এবং ' + byId(PUNISHMENTS, state.punishment).short + '।\n\nচুক্তিনামা নং ' + state.number + '। তুমি আপিল করতে, নাটকীয়ভাবে অভিযোগ করতে অথবা সবকিছু অস্বীকার করতে পারো।\n\n(শুধুমাত্র বিনোদনের জন্য। আইনত বাধ্যতামূলক চুক্তি নয়।)\n— ' + state.complainant;
  }
  function generate() {
    state.number = makeNumber(); state.date = new Date(); docJpeg = ''; docCanvas = null;
    $('#doc-img').hidden = true; $('#doc-status').hidden = false; $('#doc-status-text').textContent = 'আদালত বিবেচনা করছে…';
    $('#result-number').textContent = state.number;
    $('#message').textContent = buildMessage();
    showView('result');
    window.FC.renderCertificate(certData(), 2).then(function (canvas) {
      docCanvas = canvas; docJpeg = canvas.toDataURL('image/jpeg', 0.92);
      var img = $('#doc-img'); img.src = docJpeg; img.hidden = false;
      $('#doc-status').hidden = true; $('#print-sheet').src = docJpeg;
      document.body.classList.add('has-print');
    }).catch(function () {
      $('#doc-status-text').textContent = 'আদালতের কোথাও একটু গোলমাল হয়েছে। “চুক্তিনামা সম্পাদনা” চেপে আবার চেষ্টা করুন।';
    });
  }

  var toastTimer;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3200); }
  function download(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }
  function fileBase() { return 'bondhutto-chuktinama-' + state.numberLatin; }
  function needDoc() { if (!docCanvas) { toast('চুক্তিনামা এখনো তৈরি হচ্ছে। একটু অপেক্ষা করুন।'); return false; } return true; }
  function onPdf() {
    if (!needDoc()) return;
    try { download(window.FC.pdfFromCanvas(docCanvas, 'Bondhutto Adalot Agreement ' + state.numberLatin), fileBase() + '.pdf'); toast('PDF ডাউনলোড হয়েছে। চরম নাটকীয়তার সাথে পাঠিয়ে দিন।'); }
    catch (e) { toast('PDF ডাউনলোড হয়নি। প্রিন্ট খোলা হচ্ছে: “Save as PDF” বাছাই করুন।'); setTimeout(function () { window.print(); }, 600); }
  }
  function onPng() {
    if (!needDoc()) return;
    if (docCanvas.toBlob) docCanvas.toBlob(function (b) { if (b) download(b, fileBase() + '.png'); else toast('ছবি ডাউনলোড হয়নি। প্রিন্ট করে দেখুন।'); }, 'image/png');
    else { var a = document.createElement('a'); a.href = docJpeg; a.download = fileBase() + '.jpg'; a.click(); }
  }
  function onPrint() { if (!needDoc()) return; window.print(); }
  function onCopy() {
    var text = $('#message').textContent;
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) { } ta.remove();
      toast(ok ? 'মেসেজ কপি হয়েছে। আত্মবিশ্বাসের সাথে পাঠিয়ে দিন।' : 'কপি হয়নি। মেসেজটি সিলেক্ট করে নিজে কপি করুন।');
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast('মেসেজ কপি হয়েছে। আত্মবিশ্বাসের সাথে পাঠিয়ে দিন।'); }, fallback);
    else fallback();
  }
  function onShare() { navigator.share({ title: 'বন্ধুত্ব আদালতের রায়', text: $('#message').textContent }).catch(function () { }); }
  function resetAll() {
    $('#complaint-form').reset();
    $$('.option').forEach(function (o) { o.classList.remove('checked'); });
    $$('[aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
    state = fresh(); docCanvas = null; docJpeg = '';
    $('#print-sheet').removeAttribute('src'); $('#doc-img').removeAttribute('src');
    $('#custom-count').textContent = '০'; renderPhoto();
  }
  function startFlow() { showView('create'); setStep(step); }

  function init() {
    buildOptions();
    $('#year').textContent = bn(new Date().getFullYear());
    $$('[data-action="start"]').forEach(function (b) { b.addEventListener('click', startFlow); });
    $$('[data-nav="home"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); showView('home'); }); });
    $('#complaint-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var err = readStep(step);
      if (err) return showError(err);
      if (step < TOTAL) setStep(step + 1); else generate();
    });
    $('#btn-back').addEventListener('click', function () { if (step > 1) setStep(step - 1); else showView('home'); });
    $('#custom').addEventListener('input', function () {
      $('#custom-count').textContent = bn(this.value.length);
      if (step === 5) $('#btn-next').textContent = this.value.trim() ? 'পরবর্তী' : 'এড়িয়ে যান';
    });
    ['#complainant', '#accused'].forEach(function (s) { $(s).addEventListener('input', clearError); });
    var input = $('#photo-input'), dz = $('#dropzone');
    input.addEventListener('change', function () { handleFile(input.files && input.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); }); });
    dz.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files; if (f && f.length) handleFile(f[0]); });
    $('#photo-replace').addEventListener('click', function () { input.click(); });
    $('#photo-remove').addEventListener('click', function () { state.photo = null; state.photoPreview = ''; renderPhoto(); });
    $('#no-photo').addEventListener('click', function () { state.noPhoto = true; state.photo = null; renderPhoto(); setStep(4); });
    $('#act-pdf').addEventListener('click', onPdf);
    $('#act-print').addEventListener('click', onPrint);
    $('#act-png').addEventListener('click', onPng);
    $('#act-copy').addEventListener('click', onCopy);
    if (navigator.share) { $('#act-share').hidden = false; $('#act-share').addEventListener('click', onShare); }
    $('#act-edit').addEventListener('click', function () { showView('create'); setStep(TOTAL); });
    $('#act-reset').addEventListener('click', function () {
      if (!window.confirm('নতুন করে শুরু করবেন? বর্তমান চুক্তিনামা ও ছবি মুছে যাবে।')) return;
      resetAll(); showView('create'); setStep(1);
    });
    window.addEventListener('popstate', route);
    route();
    var y = new Date().getFullYear();
    window.FC.renderCertificate({
      sample: true, complainant: 'রাহাত চৌধুরী', accused: 'তানভীর “ফুচকা চোর” আহমেদ', photo: null,
      offenses: [VIOLATIONS[2].legal, VIOLATIONS[1].legal, VIOLATIONS[3].legal],
      punishment: PUNISHMENTS[1].legal, number: 'বআ-' + bn(y) + '-নমুনা-০০১', date: fmtDate(new Date())
    }, 1).then(function (c) { $('#sample-img').src = c.toDataURL('image/jpeg', 0.9); }).catch(function () { });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
