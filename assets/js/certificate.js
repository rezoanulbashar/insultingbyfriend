/* বন্ধুত্ব আদালত — চুক্তিনামা রেন্ডারার (A4 অনুপাতে ক্যানভাসে আঁকা) */
(function () {
  'use strict';
  var C = { paper: '#F8F2E2', green: '#0F3D2E', green2: '#165A42', red: '#A3162B', stamp: '#C8202F', gold: '#B4873A', goldD: '#8C6526', goldL: '#D9B76A', ink: '#24282A', muted: '#5E5A54' };
  var F = {
    serif: '"Noto Serif Bengali", "Hind Siliguri", "Noto Sans Bengali", Vrinda, serif',
    sans: '"Hind Siliguri", "Noto Sans Bengali", Vrinda, sans-serif',
    script: 'Galada, "Hind Siliguri", "Noto Sans Bengali", cursive'
  };
  var DW = 1000, DH = 1414;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var fontsReady = null;
  function ensureFonts() {
    if (fontsReady) return fontsReady;
    if (!document.fonts || !document.fonts.load) { fontsReady = Promise.resolve(); return fontsReady; }
    var bn = 'বন্ধুত্ব আদালত চুক্তিনামা ১২৩ অভিযুক্ত', list = ['700 30px "Noto Serif Bengali"', '400 20px "Noto Serif Bengali"', '400 20px "Hind Siliguri"', '600 20px "Hind Siliguri"', '700 20px "Hind Siliguri"', '400 30px Galada'];
    var jobs = [];
    list.forEach(function (f) { jobs.push(document.fonts.load(f, bn).catch(function () {})); jobs.push(document.fonts.load(f, 'AaBb').catch(function () {})); });
    fontsReady = Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 3500); })]);
    return fontsReady;
  }
  function fit(ctx, text, maxW, size, weight, fam, min) {
    var s = size; ctx.font = weight + ' ' + s + 'px ' + fam;
    while (ctx.measureText(text).width > maxW && s > min) { s -= 1; ctx.font = weight + ' ' + s + 'px ' + fam; }
    return s;
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function diamond(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill(); }
  function graphemes(t) {
    if (window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(t), function (s) { return s.segment; });
    return t.split(/(\s+)/).filter(Boolean);
  }

  function layout(ctx, text, maxW, fs) {
    var words = [];
    text.split(/(\*\*[^*]+\*\*)/).forEach(function (p) {
      if (!p) return; var b = /^\*\*[\s\S]*\*\*$/.test(p);
      (b ? p.slice(2, -2) : p).split(/\s+/).forEach(function (t) { if (t) words.push({ t: t, b: b }); });
    });
    var f = function (b) { return (b ? '700 ' : '400 ') + fs + 'px ' + F.serif; };
    ctx.font = f(false); var sp = ctx.measureText(' ').width;
    var lines = [[]], w = 0;
    function push(o) { var cur = lines[lines.length - 1]; var add = (cur.length ? sp : 0) + o.w; if (cur.length && w + add > maxW) { lines.push([o]); w = o.w; } else { cur.push(o); w += add; } }
    words.forEach(function (wd) {
      ctx.font = f(wd.b); var t = wd.t, ww = ctx.measureText(t).width;
      if (ww > maxW) { var chunk = ''; graphemes(t).forEach(function (ch) { if (ctx.measureText(chunk + ch).width > maxW) { push({ t: chunk, b: wd.b, w: ctx.measureText(chunk).width }); chunk = ch; } else chunk += ch; }); t = chunk; ww = ctx.measureText(t).width; }
      push({ t: t, b: wd.b, w: ww });
    });
    return { lines: lines, sp: sp, f: f };
  }
  function drawLayout(ctx, L, x, y, lh) {
    L.lines.forEach(function (line, i) {
      var cx = x;
      line.forEach(function (o) { ctx.font = L.f(o.b); ctx.fillStyle = o.b ? C.red : C.ink; ctx.fillText(o.t, cx, y + i * lh); cx += o.w + L.sp; });
    });
  }

  function drawPhoto(ctx, img, x, y, w, h, sample) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (img) {
      var sw = img.width, sh = img.height, r = Math.max(w / sw, h / sh), cw = w / r, ch = h / r;
      ctx.drawImage(img, (sw - cw) / 2, Math.max(0, (sh - ch) * 0.3), cw, ch, x, y, w, h);
    } else {
      ctx.fillStyle = C.green; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 8;
      for (var i = -h; i < w + h; i += 22) { ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i - h, y + h); ctx.stroke(); }
      ctx.fillStyle = C.goldL; ctx.textAlign = 'center';
      ctx.font = '700 120px ' + F.serif; ctx.fillText('?', x + w / 2, y + h / 2 + 34);
      ctx.font = '600 15px ' + F.sans; ctx.fillText(sample ? 'অভিযুক্তের ছবি' : 'পরিচয় গোপন', x + w / 2, y + h - 24);
    }
    ctx.restore();
  }

  function drawStamp(ctx, cx, cy, rot, sc) {
    var w = 400, h = 160, k = 2, s = document.createElement('canvas');
    s.width = w * k; s.height = h * k; var g = s.getContext('2d'); g.scale(k, k);
    g.fillStyle = 'rgba(248,242,226,0.8)'; rr(g, 6, 6, w - 12, h - 12, 12); g.fill();
    g.strokeStyle = C.stamp; g.fillStyle = C.stamp;
    g.lineWidth = 7; rr(g, 6, 6, w - 12, h - 12, 12); g.stroke();
    g.lineWidth = 2; rr(g, 18, 18, w - 36, h - 36, 6); g.stroke();
    g.textAlign = 'center';
    g.font = '700 70px ' + F.serif; g.fillText('দোষী', w / 2, 92);
    fit(g, 'বিরক্তিকর হওয়ার অপরাধে', w - 60, 24, '700', F.sans, 14); g.fillText('বিরক্তিকর হওয়ার অপরাধে', w / 2, 128);
    g.globalCompositeOperation = 'destination-out'; var r = rng(11);
    for (var i = 0; i < 650; i++) { g.globalAlpha = 0.25 + r() * 0.75; g.beginPath(); g.arc(r() * w, r() * h, r() * 1.7 + 0.3, 0, 7); g.fill(); }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = 0.9;
    ctx.drawImage(s, -w / 2, -h / 2, w, h); ctx.restore();
  }

  function circleText(ctx, text, cx, cy, r) {
    var parts = graphemes(text), ws = parts.map(function (c) { return ctx.measureText(c).width; });
    var total = ws.reduce(function (a, b) { return a + b; }, 0), extra = Math.max(0, (2 * Math.PI * r - total) / parts.length);
    var a = -Math.PI / 2; ctx.save(); ctx.translate(cx, cy); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    parts.forEach(function (c, i) { var ang = (ws[i] + extra) / r; ctx.save(); ctx.rotate(a + ang / 2 + Math.PI / 2); ctx.fillText(c, 0, -r); ctx.restore(); a += ang; });
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }

  function drawSeal(ctx, cx, cy) {
    ctx.fillStyle = C.green;
    [[-1, -0.35], [1, 0.35]].forEach(function (d) {
      ctx.save(); ctx.translate(cx + d[0] * 18, cy + 40); ctx.rotate(d[1]);
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.lineTo(16, 70); ctx.lineTo(0, 58); ctx.lineTo(-16, 70); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    var n = 44, R = 80, r = 73;
    var grad = ctx.createRadialGradient(cx - 25, cy - 30, 5, cx, cy, R);
    grad.addColorStop(0, '#F3DDA2'); grad.addColorStop(0.6, C.goldL); grad.addColorStop(1, C.gold);
    ctx.fillStyle = grad; ctx.beginPath();
    for (var i = 0; i < n * 2; i++) { var a = i / (n * 2) * Math.PI * 2, rad = i % 2 ? r : R; ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 66, 0, 7); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, 44, 0, 7); ctx.stroke();
    ctx.fillStyle = C.stamp; ctx.beginPath(); ctx.arc(cx, cy - 4, 20, 0, 7); ctx.fill();
    ctx.fillStyle = C.green; ctx.font = '700 12.5px ' + F.sans;
    circleText(ctx, 'বন্ধুত্ব আদালত ✦ দাপ্তরিক সিলমোহর ✦ ', cx, cy, 55);
    ctx.textAlign = 'center'; ctx.fillStyle = C.paper; ctx.font = '700 17px ' + F.serif; ctx.fillText('বআ', cx, cy + 2);
    ctx.fillStyle = C.green; ctx.font = '600 9.5px ' + F.sans; ctx.fillText('স্থাপিত: চিরকাল', cx, cy + 32);
  }

  function render(d, scale) {
    scale = scale || 2;
    var canvas = document.createElement('canvas');
    canvas.width = Math.round(DW * scale); canvas.height = Math.round(DH * scale);
    var ctx = canvas.getContext('2d'); ctx.scale(scale, scale); ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, DW, DH);
    var vg = ctx.createRadialGradient(DW / 2, DH / 2, DH * 0.25, DW / 2, DH / 2, DH * 0.75);
    vg.addColorStop(0, 'rgba(255,255,255,0.25)'); vg.addColorStop(1, 'rgba(150,110,50,0.16)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, DW, DH);
    var r = rng(42); ctx.fillStyle = 'rgba(120,90,40,0.05)';
    for (var i = 0; i < 2600; i++) ctx.fillRect(r() * DW, r() * DH, 1 + r() * 1.5, 1 + r() * 1.5);
    if (d.sample) {
      ctx.save(); ctx.translate(DW / 2, DH / 2); ctx.rotate(-0.6); ctx.fillStyle = 'rgba(163,22,43,0.06)';
      ctx.font = '700 260px ' + F.serif; ctx.textAlign = 'center'; ctx.fillText('নমুনা', 0, 90); ctx.restore();
    }

    // border
    ctx.strokeStyle = C.green; ctx.lineWidth = 12; ctx.strokeRect(22, 22, DW - 44, DH - 44);
    ctx.fillStyle = C.goldL;
    for (var bx = 34; bx < DW - 22; bx += 14) { ctx.fillRect(bx - 1, 21, 2, 2); ctx.fillRect(bx - 1, DH - 23, 2, 2); }
    for (var by = 34; by < DH - 22; by += 14) { ctx.fillRect(21, by - 1, 2, 2); ctx.fillRect(DW - 23, by - 1, 2, 2); }
    ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.strokeRect(36, 36, DW - 72, DH - 72);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(42, 42, DW - 84, DH - 84);
    [[42, 42], [DW - 42, 42], [42, DH - 42], [DW - 42, DH - 42]].forEach(function (p) {
      ctx.fillStyle = C.paper; ctx.fillRect(p[0] - 13, p[1] - 13, 26, 26);
      ctx.fillStyle = C.gold; diamond(ctx, p[0], p[1], 11); ctx.fillStyle = C.paper; diamond(ctx, p[0], p[1], 5); ctx.fillStyle = C.red; diamond(ctx, p[0], p[1], 2.5);
    });

    // stamp-paper band (parody of non-judicial stamp paper)
    var bg = ctx.createLinearGradient(0, 56, 0, 96); bg.addColorStop(0, C.green2); bg.addColorStop(1, C.green);
    ctx.fillStyle = bg; ctx.fillRect(56, 56, DW - 112, 40);
    ctx.strokeStyle = 'rgba(217,183,106,0.25)'; ctx.lineWidth = 1;
    for (var wv = 0; wv < 3; wv++) { ctx.beginPath(); for (var wx = 56; wx <= DW - 56; wx += 4) { var wy = 76 + Math.sin((wx + wv * 9) / 11) * (6 + wv * 3); if (wx === 56) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy); } ctx.stroke(); }
    ctx.fillStyle = C.goldL; ctx.font = '600 17px ' + F.sans; ctx.textAlign = 'center';
    ctx.fillText('নন-জুডিশিয়াল মজার স্ট্যাম্প  ·  মূল্য: এক কাপ চা', DW / 2, 82);
    ctx.beginPath(); ctx.arc(90, 76, 13, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(DW - 90, 76, 13, 0, 7); ctx.fill();
    ctx.fillStyle = C.green; ctx.font = '700 15px ' + F.sans; ctx.fillText('৳', 90, 81); ctx.fillText('৳', DW - 90, 81);

    // header
    ctx.fillStyle = C.green; ctx.font = '600 16px ' + F.sans;
    ctx.fillText('মহামান্য বন্ধুত্ব আদালত · চায়ের দোকান বেঞ্চ, ঢাকা', DW / 2, 134);
    ctx.fillStyle = C.red; fit(ctx, 'দাপ্তরিক বন্ধুত্ব অসদাচরণ চুক্তিনামা', 820, 46, '700', F.serif, 30);
    ctx.fillText('দাপ্তরিক বন্ধুত্ব অসদাচরণ চুক্তিনামা', DW / 2, 192);
    ctx.fillStyle = C.muted; ctx.font = '400 15px ' + F.sans;
    ctx.fillText('(বন্ধুত্ব দণ্ডবিধি, ধারা ৪২০ সহ অন্যান্য প্রাসঙ্গিক ধারার অধীনে)', DW / 2, 222);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(300, 244); ctx.lineTo(480, 244); ctx.moveTo(520, 244); ctx.lineTo(700, 244); ctx.stroke();
    ctx.fillStyle = C.gold; diamond(ctx, 500, 244, 6); diamond(ctx, 300, 244, 3); diamond(ctx, 700, 244, 3);

    ctx.fillStyle = C.green; ctx.font = '600 15px ' + F.sans; ctx.textAlign = 'left';
    ctx.fillText('চুক্তিনামা নং: ' + d.number, 80, 276);
    ctx.textAlign = 'right'; ctx.fillText('তারিখ: ' + d.date, 920, 276);
    ctx.strokeStyle = 'rgba(15,61,46,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(80, 290); ctx.lineTo(920, 290); ctx.stroke();

    // parties
    ctx.textAlign = 'left';
    ctx.fillStyle = C.red; ctx.font = '700 16px ' + F.sans; ctx.fillText('পক্ষগণ:', 80, 328);
    ctx.fillStyle = C.goldD; ctx.font = '500 17px ' + F.sans; ctx.fillText('বাদী (অভিযোগকারী)', 80, 356);
    ctx.fillStyle = C.green; fit(ctx, d.complainant, 560, 34, '700', F.serif, 18); ctx.fillText(d.complainant, 80, 398);
    ctx.strokeStyle = 'rgba(15,61,46,0.35)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(80, 412); ctx.lineTo(640, 412); ctx.stroke();
    ctx.fillStyle = C.red; ctx.font = '700 16px ' + F.sans; ctx.fillText('বনাম', 80, 444);
    ctx.fillStyle = C.goldD; ctx.font = '500 17px ' + F.sans; ctx.fillText('বিবাদী (অভিযুক্ত বন্ধু)', 80, 472);
    ctx.fillStyle = C.green; fit(ctx, d.accused, 560, 34, '700', F.serif, 18); ctx.fillText(d.accused, 80, 514);
    ctx.beginPath(); ctx.moveTo(80, 528); ctx.lineTo(640, 528); ctx.stroke(); ctx.setLineDash([]);

    // portrait
    var px = 692, py = 312, pw = 226, ph = 262;
    ctx.save(); ctx.shadowColor = 'rgba(15,61,46,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    ctx.fillStyle = C.gold; ctx.fillRect(px - 12, py - 12, pw + 24, ph + 24); ctx.restore();
    var fg = ctx.createLinearGradient(px - 12, py - 12, px + pw + 12, py + ph + 12);
    fg.addColorStop(0, '#E7C97F'); fg.addColorStop(0.5, C.gold); fg.addColorStop(1, '#9C7330');
    ctx.fillStyle = fg; ctx.fillRect(px - 12, py - 12, pw + 24, ph + 24);
    ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.strokeRect(px - 2, py - 2, pw + 4, ph + 4);
    drawPhoto(ctx, d.photo, px, py, pw, ph, d.sample);
    ctx.fillStyle = C.red; ctx.fillRect(px + 8, py + ph - 4, pw - 16, 38);
    ctx.strokeStyle = C.goldL; ctx.lineWidth = 1.5; ctx.strokeRect(px + 12, py + ph, pw - 24, 30);
    ctx.fillStyle = C.goldL; ctx.font = '700 17px ' + F.sans; ctx.textAlign = 'center'; ctx.fillText('অভিযুক্ত', px + pw / 2, py + ph + 21);
    ctx.textAlign = 'left';

    // notice
    ctx.fillStyle = C.red; ctx.font = '700 16px ' + F.sans; ctx.fillText('বন্ধুত্ব আদালতের নোটিশ', 80, 568);
    var notice = layout(ctx, 'যেহেতু অভিযুক্ত বন্ধু এক বা একাধিক বন্ধুত্ব-অসদাচরণ করেছেন বলে অভিযোগ উঠেছে, সেহেতু বন্ধুত্ব আদালত এতদ্বারা এই অত্যন্ত নাটকীয় নোটিশ জারি করছে।', 560, 16, false);
    drawLayout(ctx, notice, 80, 598, 26);

    var divY = Math.max(668, 598 + notice.lines.length * 26 + 4);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(80, divY); ctx.lineTo(920, divY); ctx.stroke();
    ctx.fillStyle = C.gold; diamond(ctx, 500, divY, 4);

    var blocks = [
      { h: 'অনুচ্ছেদ ১ — অপরাধসমূহ', list: d.offenses },
      { h: 'অনুচ্ছেদ ২ — জরিমানা', p: 'অভিযুক্ত বন্ধুকে এতদ্বারা **১,০০০ টাকা বন্ধুত্ব জরিমানা** প্রদানের আদেশ দেওয়া হলো, যা সম্পূর্ণ হাসি-তামাশার উদ্দেশ্যে।' },
      { h: 'অনুচ্ছেদ ৩ — অতিরিক্ত শাস্তি', p: d.punishment },
      { h: 'অনুচ্ছেদ ৪ — বন্ধুত্বের অধিকার', p: 'অভিযুক্ত ব্যক্তি আপিল করার, নাটকীয়ভাবে অভিযোগ করার এবং সকল অভিযোগ অস্বীকার করার অধিকার সংরক্ষণ করেন।' },
      { h: 'অনুচ্ছেদ ৫ — চূড়ান্ত ঘোষণা', p: '“বন্ধুত্ব বজায় রেখে উভয় পক্ষ স্বীকার করছেন যে বন্ধুত্ব একটি গুরুতর বিষয়, কিন্তু এই চুক্তিনামা নিছক একটি মজা এবং এর মাধ্যমে আইনগতভাবে প্রয়োগযোগ্য কোনো আর্থিক দায় সৃষ্টি হয় না।”' }
    ];
    var BN = '০১২৩৪৫৬৭৮৯';
    var top = divY + 38, bottom = 1162;
    function pass(fs, draw) {
      var lh = fs * 1.58, hs = Math.max(12, fs * 0.95), y = top;
      blocks.forEach(function (b, bi) {
        if (draw) { ctx.fillStyle = C.red; ctx.font = '700 ' + hs + 'px ' + F.sans; ctx.fillText(b.h, 80, y); }
        y += fs * 0.4 + lh * 0.9;
        if (b.list) {
          b.list.forEach(function (item, ii) {
            var L = layout(ctx, item, 795, fs);
            if (draw) { ctx.fillStyle = C.red; ctx.font = '700 ' + fs + 'px ' + F.serif; ctx.fillText(String(ii + 1).replace(/\d/g, function (x) { return BN[x]; }) + '.', 90, y); drawLayout(ctx, L, 125, y, lh); }
            y += L.lines.length * lh;
          });
        } else {
          var L2 = layout(ctx, b.p, 840, fs);
          if (draw) drawLayout(ctx, L2, 80, y, lh);
          y += L2.lines.length * lh;
        }
        if (bi < blocks.length - 1) y += fs * 0.6;
      });
      return y - lh;
    }
    var fs = 16.5; while (fs > 10.5 && pass(fs, false) > bottom) fs -= 0.5;
    pass(fs, true);

    // bottom
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(80, 1180); ctx.lineTo(920, 1180); ctx.stroke();
    ctx.strokeStyle = C.green; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(80, 1236); ctx.lineTo(330, 1236); ctx.moveTo(370, 1236); ctx.lineTo(620, 1236); ctx.moveTo(80, 1318); ctx.lineTo(330, 1318); ctx.stroke();
    ctx.fillStyle = C.red; ctx.font = '400 20px ' + F.sans; ctx.fillText('×', 84, 1230); ctx.fillText('×', 374, 1230);
    ctx.fillStyle = C.ink; ctx.font = '500 14px ' + F.sans;
    ctx.fillText('বাদীর স্বাক্ষর', 80, 1256); ctx.fillText('বিবাদীর স্বাক্ষর (প্রতিবাদসহ)', 370, 1256);
    ctx.fillStyle = C.green;
    fit(ctx, d.complainant, 250, 13, '600', F.sans, 9); ctx.fillText(d.complainant, 80, 1276);
    fit(ctx, d.accused, 250, 13, '600', F.sans, 9); ctx.fillText(d.accused, 370, 1276);
    ctx.save(); ctx.translate(96, 1313); ctx.rotate(-0.05); ctx.fillStyle = C.green; ctx.font = '400 29px ' + F.script; ctx.fillText('গোঁসা মিয়া', 0, 0); ctx.restore();
    ctx.fillStyle = C.ink; ctx.font = '500 14px ' + F.sans; ctx.fillText('মাননীয় বিচারপতি গোঁসা মিয়া, সভাপতি', 80, 1338);
    ctx.fillStyle = C.muted; ctx.font = '400 14px ' + F.sans;
    ctx.fillText('মামলার অবস্থা: চলমান। আপিল গ্রহণযোগ্য', 370, 1298); ctx.fillText('শুধুমাত্র চা-সিঙ্গারাসহ।', 370, 1318);
    drawSeal(ctx, 810, 1252);
    drawStamp(ctx, 772, 482, -0.2, 0.74);

    ctx.fillStyle = C.red; ctx.font = '600 12.5px ' + F.sans; ctx.textAlign = 'center';
    ctx.fillText('শুধুমাত্র বিনোদনের জন্য · আইনত বাধ্যতামূলক চুক্তি নয় · কোনো প্রকৃত টাকা পাওনা নেই', DW / 2, 1362);
    return canvas;
  }

  window.FC = window.FC || {};
  window.FC.renderCertificate = function (data, scale) { return ensureFonts().then(function () { return render(data, scale); }); };
})();
