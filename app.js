    (function () {
      'use strict';

      // ===== STATE =====
      let chars = JSON.parse(localStorage.getItem('mha5') || '[]');
      let idx = 0;
      let abs = [];
      let ini = [];
      let turn = 0;
      let mis = JSON.parse(localStorage.getItem('mha5_mis') || '[]');
      let enemies = JSON.parse(localStorage.getItem('mha5_en') || '[]');
      let npcs = [];
      let selMis = null;
      let mestreOn = false;
      let mapMode = 'char';
      let mapSize = 10;
      let mapData = [];
      let mapTok = {};
      let selR = -1, selC = -1;

      const presets = {
        deku: { nome: 'Izuku Midoriya', codinome: 'Deku', idade: 15, genero: 'Masculino', lado: 'Estudante U.A. (Herói)', ranking: 'Classe 1-A', lv: 3, xp: 180, apar: 'Cabelo verde', hist: 'OFA', hpA: 52, hpM: 52, stA: 28, stM: 28, qkA: 24, qkM: 24, aPod: 5, aVel: 3, aTec: 4, aInt: 5, aCoo: 5, sFor: 15, sAgi: 13, sRes: 14, sInt: 16, sCar: 13, sCon: 12, qNome: 'One For All', qTipo: 'Emitter', qComp: 'moderada', qDesc: 'Poder acumulado de gerações anteriores', qMec: 'Pode usar percentuais diferentes de poder (5% a 100%). Quanto maior o %, maior o dano e o risco de lesão.', qLim: 'Quebra ossos se usar acima do controle atual', qCusto: 3, qLv: 2, qXP: 30, qAlc: 'Corpo / Toque / Projétil', qDur: 'Instantâneo / Sustentado', abs: [{ n: 'Delaware Smash', d: 'Soco concentrado. Custo 3' }, { n: 'Full Cowling', d: '5-20%. Custo 1/turno' }], inv: 'Traje', notas: '', rel: 'All Might, Bakugo', rankP: 'B', rankPts: 40 },
        bakugo: { nome: 'Katsuki Bakugo', codinome: 'Dynamight', idade: 15, genero: 'Masculino', lado: 'Estudante U.A. (Herói)', ranking: 'Classe 1-A', lv: 3, xp: 210, apar: 'Loiro', hist: 'Nº1', hpA: 48, hpM: 48, stA: 30, stM: 30, qkA: 22, qkM: 22, aPod: 5, aVel: 4, aTec: 5, aInt: 4, aCoo: 2, sFor: 14, sAgi: 15, sRes: 13, sInt: 14, sCar: 11, sCon: 15, qNome: 'Explosion', qTipo: 'Emitter', qComp: 'simples', qDesc: 'Cria explosões a partir do suor nitroglicerina das mãos', qMec: 'Dano e área aumentam com o Nível do Quirk e suor acumulado.', qLim: 'Fadiga e necessidade de suor', qCusto: 2, qLv: 2, qXP: 40, qAlc: 'Mãos / Projétil curto-médio', qDur: 'Instantâneo', abs: [{ n: 'AP Shot', d: 'Feixe concentrado. Custo 2' }], inv: 'Granadas', notas: '', rel: 'Deku', rankP: 'B', rankPts: 55 },
        shigaraki: { nome: 'Tomura Shigaraki', codinome: 'Shigaraki', idade: 20, genero: 'Masculino', lado: 'Vilão', ranking: 'Líder', lv: 5, xp: 50, apar: 'Cabelo azul', hist: 'Destruir', hpA: 55, hpM: 55, stA: 25, stM: 25, qkA: 30, qkM: 30, aPod: 5, aVel: 3, aTec: 4, aInt: 4, aCoo: 1, sFor: 13, sAgi: 12, sRes: 14, sInt: 15, sCar: 12, sCon: 16, qNome: 'Decay', qTipo: 'Emitter', qComp: 'moderada', qDesc: 'Desintegra qualquer coisa que tocar com os cinco dedos', qMec: 'Pode expandir a área de efeito com prática. Em níveis altos, pode iniciar o Decay à distância em superfícies conectadas.', qLim: 'Precisa de contato com cinco dedos; resiste a materiais especiais', qCusto: 2, qLv: 3, qXP: 20, qAlc: 'Toque (pode escalar)', qDur: 'Instantâneo / Propagação', abs: [{ n: 'Decay Wave', d: 'Onda de desintegração. Custo 4' }], inv: '', notas: '', rel: 'AFO', orgV: 'Liga', objV: 'Destruir heróis', perigo: 'S', rankP: 'S', rankPts: 200 }
      };

      const fn = ['Kenji', 'Haru', 'Yuki', 'Ren', 'Sora', 'Aoi', 'Riku', 'Mei', 'Hana', 'Kaito'];
      const ln = ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto'];
      const quirks = [{ n: 'Hardening', d: 'Pele dura' }, { n: 'Electric', d: 'Eletricidade' }, { n: 'Invis', d: 'Invisível' }, { n: 'Teleport', d: 'Troca lugar' }, { n: 'Fire', d: 'Chamas' }, { n: 'Shadow', d: 'Sombras' }, { n: 'Acid', d: 'Ácido' }, { n: 'Tail', d: 'Cauda' }, { n: 'Engine', d: 'Velocidade' }, { n: 'Explosion', d: 'Explosões' }];

      // ===== HELPERS =====
      function $(id) { return document.getElementById(id); }
      function val(id) { return $(id) ? $(id).value : ''; }
      function set(id, v) { if ($(id)) $(id).value = v ?? ''; }
      function txt(id) { return $(id) ? $(id).textContent : '0'; }
      function mod(n) { return Math.floor((Number(n) - 10) / 2); }
      function rnd(n) { return Math.floor(Math.random() * n) + 1; }
      function log(id, msg) {
        const el = $(id); if (!el) return;
        const d = document.createElement('div');
        d.textContent = '[' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '] ' + msg;
        el.insertBefore(d, el.firstChild);
      }

      // ===== TABS =====
      document.querySelectorAll('.tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('on'); });
          document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('on'); });
          tab.classList.add('on');
          var p = $('p-' + tab.dataset.p);
          if (p) p.classList.add('on');
          if (tab.dataset.p === 'mapa') buildMap();
        });
      });

      // ===== LADO =====
      $('lado').addEventListener('change', function () {
        var v = this.value.indexOf('Vilão') >= 0 || this.value.indexOf('Liga') >= 0;
        $('vilBox').classList.toggle('hid', !v);
        $('idCard').classList.toggle('vil', v);
      });

      // ===== DATA =====
      function getData() {
        return {
          nome: val('nome'), codinome: val('codinome'), idade: val('idade'), genero: val('genero'), lado: val('lado'), ranking: val('ranking'),
          lv: +txt('lv') || 1, xp: +val('xp') || 0, apar: val('apar'), hist: val('hist'),
          hpA: +txt('hpA'), hpM: +txt('hpM'), stA: +txt('stA'), stM: +txt('stM'), qkA: +txt('qkA'), qkM: +txt('qkM'),
          aPod: +val('aPod'), aVel: +val('aVel'), aTec: +val('aTec'), aInt: +val('aInt'), aCoo: +val('aCoo'),
          sFor: +val('sFor'), sAgi: +val('sAgi'), sRes: +val('sRes'), sInt: +val('sInt'), sCar: +val('sCar'), sCon: +val('sCon'),
          qNome: val('qNome'), qTipo: val('qTipo'), qComp: val('qComp'), qDesc: val('qDesc'), qMec: val('qMec'), qLim: val('qLim'),
          qCusto: +val('qCusto'), qLv: +val('qLv') || 1, qXP: +val('qXP') || 0, qAlc: val('qAlc'), qDur: val('qDur'),
          abs: abs, inv: val('inv'), notas: val('notas'), rel: val('rel'), orgV: val('orgV'), objV: val('objV'), perigo: val('perigo'),
          agNome: val('agNome'), agLider: val('agLider'), agRank: val('agRank'), agRep: +val('agRep') || 0, agXP: +val('agXP') || 0, agMem: val('agMem'), agRec: val('agRec'),
          rankP: val('rankPessoal'), rankPts: +val('rankPts') || 0
        };
      }

      function load(d) {
        if (!d) return;
        set('nome', d.nome); set('codinome', d.codinome); set('idade', d.idade || 15); set('genero', d.genero || 'Masculino');
        set('lado', d.lado || 'Estudante U.A. (Herói)'); set('ranking', d.ranking);
        $('lv').textContent = d.lv || 1; set('xp', d.xp || 0); set('apar', d.apar); set('hist', d.hist);
        $('hpA').textContent = d.hpA ?? 30; $('hpM').textContent = d.hpM ?? 30;
        $('stA').textContent = d.stA ?? 20; $('stM').textContent = d.stM ?? 20;
        $('qkA').textContent = d.qkA ?? 15; $('qkM').textContent = d.qkM ?? 15;
        set('aPod', d.aPod ?? 3); set('aVel', d.aVel ?? 3); set('aTec', d.aTec ?? 3); set('aInt', d.aInt ?? 3); set('aCoo', d.aCoo ?? 3);
        set('sFor', d.sFor ?? 10); set('sAgi', d.sAgi ?? 10); set('sRes', d.sRes ?? 10); set('sInt', d.sInt ?? 10); set('sCar', d.sCar ?? 10); set('sCon', d.sCon ?? 10);
        set('qNome', d.qNome); set('qTipo', d.qTipo || 'Emitter'); set('qComp', d.qComp || 'complexa'); set('qDesc', d.qDesc); set('qMec', d.qMec);
        set('qLim', d.qLim); set('qCusto', d.qCusto ?? 2); set('qLv', d.qLv || 1); set('qXP', d.qXP || 0);
        set('qAlc', d.qAlc); set('qDur', d.qDur);
        abs = d.abs || [];
        set('inv', d.inv); set('notas', d.notas); set('rel', d.rel); set('orgV', d.orgV); set('objV', d.objV); set('perigo', d.perigo || 'A');
        set('agNome', d.agNome); set('agLider', d.agLider); set('agRank', d.agRank || 'B'); set('agRep', d.agRep || 20); set('agXP', d.agXP || 0); set('agMem', d.agMem); set('agRec', d.agRec);
        set('rankPessoal', d.rankP || 'B'); set('rankPts', d.rankPts || 0);
        var isV = (d.lado || '').indexOf('Vilão') >= 0 || (d.lado || '').indexOf('Liga') >= 0;
        $('vilBox').classList.toggle('hid', !isV); $('idCard').classList.toggle('vil', isV);
        updBars(); updXP(); updStats(); calcMods(); rendAb(); updQXP(); updAgRep();
      }

      function save() {
        var d = getData();
        if (chars[idx]) chars[idx] = d; else { chars.push(d); idx = chars.length - 1; }
        localStorage.setItem('mha5', JSON.stringify(chars));
        rendChips();
        alert('Salvo!');
      }

      function rendChips() {
        var el = $('charChips'); el.innerHTML = '';
        chars.forEach(function (c, i) {
          var chip = document.createElement('div');
          var isV = (c.lado || '').indexOf('Vilão') >= 0;
          chip.className = 'chip' + (i === idx ? ' on' : '') + (isV ? ' v' : '');
          chip.textContent = (c.codinome || c.nome || 'P' + (i + 1)) + (c.lv ? ' Nv.' + c.lv : '');
          chip.addEventListener('click', function () {
            if (chars[idx]) chars[idx] = getData();
            idx = i; load(chars[i]); rendChips();
          });
          el.appendChild(chip);
        });
      }

      // ===== RESOURCES =====
      function updBars() {
        [['hp', 'hpBar'], ['st', 'stBar'], ['qk', 'qkBar']].forEach(function (x) {
          var a = +txt(x[0] + 'A'), m = +txt(x[0] + 'M') || 1;
          $(x[1]).style.width = Math.max(0, Math.min(100, (a / m) * 100)) + '%';
        });
      }
      function adj(r, n) {
        if (n === 'max') { $(r + 'A').textContent = $(r + 'M').textContent; }
        else { var a = +txt(r + 'A') + Number(n); a = Math.max(0, Math.min(+txt(r + 'M'), a)); $(r + 'A').textContent = a; }
        updBars();
      }
      document.querySelectorAll('[data-r]').forEach(function (btn) {
        btn.addEventListener('click', function () { adj(btn.dataset.r, btn.dataset.n); });
      });

      // ===== XP =====
      function updXP() {
        var lv = +txt('lv') || 1, xp = +val('xp') || 0, need = lv * 100;
        $('xpNeed').textContent = need;
        var pct = Math.min(100, (xp / need) * 100);
        $('xpBar').style.width = pct + '%'; $('xpPct').textContent = Math.floor(pct) + '%';
        if (xp >= need) {
          xp -= need; lv++;
          $('lv').textContent = lv; set('xp', xp);
          alert('LEVEL UP! Nível ' + lv);
          $('hpM').textContent = +txt('hpM') + 3; $('hpA').textContent = $('hpM').textContent;
          $('stM').textContent = +txt('stM') + 1; $('stA').textContent = $('stM').textContent;
          $('qkM').textContent = +txt('qkM') + 1; $('qkA').textContent = $('qkM').textContent;
          updBars(); updXP();
        }
      }
      $('xp').addEventListener('input', updXP);
      $('xp10').addEventListener('click', function () { set('xp', (+val('xp') || 0) + 10); updXP(); });
      $('xp25').addEventListener('click', function () { set('xp', (+val('xp') || 0) + 25); updXP(); });
      $('xp50').addEventListener('click', function () { set('xp', (+val('xp') || 0) + 50); updXP(); });
      $('xp100').addEventListener('click', function () { set('xp', (+val('xp') || 0) + 100); updXP(); });

      // ===== STATS =====
      function updStats() {
        ['Pod', 'Vel', 'Tec', 'Int', 'Coo'].forEach(function (n) {
          var v = +val('a' + n) || 0; var b = $('b' + n); if (b) b.style.width = Math.min(100, v * 10) + '%';
        });
      }
      ['aPod', 'aVel', 'aTec', 'aInt', 'aCoo'].forEach(function (id) { $(id).addEventListener('input', updStats); });
      function calcMods() {
        var a = { Força: +val('sFor'), Agi: +val('sAgi'), Res: +val('sRes'), Int: +val('sInt'), Car: +val('sCar'), Ctrl: +val('sCon') };
        var h = ''; for (var k in a) { var m = mod(a[k]); h += k + ': ' + (m >= 0 ? '+' : '') + m + '  '; }
        $('mods').textContent = h;
      }
      ['sFor', 'sAgi', 'sRes', 'sInt', 'sCar', 'sCon'].forEach(function (id) { $(id).addEventListener('input', calcMods); });
      $('btnRecalc').addEventListener('click', function () {
        var res = +val('sRes'), pod = +val('aPod'), vel = +val('aVel'), con = +val('sCon'), tec = +val('aTec'), lv = +txt('lv') || 1;
        var hp = 10 + res * 2 + pod * 2 + lv * 3, st = 10 + res + vel + lv, qe = 5 + con + tec + lv;
        $('hpM').textContent = hp; $('hpA').textContent = hp; $('stM').textContent = st; $('stA').textContent = st; $('qkM').textContent = qe; $('qkA').textContent = qe;
        updBars();
      });

      // ===== QUIRK EVOLUTION =====
      function updQXP() {
        var qlv = +val('qLv') || 1, qxp = +val('qXP') || 0, need = qlv * 50;
        var pct = Math.min(100, (qxp / need) * 100);
        $('qXPBar').style.width = pct + '%'; $('qXPPct').textContent = Math.floor(pct) + '%';
      }
      $('qXP').addEventListener('input', updQXP);
      $('qLv').addEventListener('input', updQXP);
      $('qxp10').addEventListener('click', function () { set('qXP', (+val('qXP') || 0) + 10); updQXP(); });
      $('qxp25').addEventListener('click', function () { set('qXP', (+val('qXP') || 0) + 25); updQXP(); });
      $('btnEvolve').addEventListener('click', function () {
        var qlv = +val('qLv') || 1, qxp = +val('qXP') || 0, need = qlv * 50;
        if (qxp < need) { alert('Precisa de ' + need + ' QXP (tem ' + qxp + ')'); return; }
        set('qXP', qxp - need); set('qLv', qlv + 1); updQXP();
        alert('QUIRK EVOLUIU para nível ' + (qlv + 1) + '!\nPode reduzir uma limitação, aprimorar a mecânica complexa ou criar nova habilidade (com aprovação do Mestre).');
      });

      // Botão de exemplo de Quirk complexa (Medo Materializado)
      if ($('btnExMedo')) {
        $('btnExMedo').addEventListener('click', function () {
          set('qNome', 'Medo Materializado');
          set('qTipo', 'Composite / Especial');
          set('qComp', 'complexa');
          set('qDesc', 'O usuário sente o medo das pessoas próximas e materializa manifestações físicas desse medo (criaturas, objetos aterrorizantes, distorções do ambiente). Quanto mais intenso e compartilhado o medo, mais poderosas e duradouras as manifestações.');
          set('qMec', 'O Mestre determina a intensidade do medo presente (baixo / moderado / intenso / pânico coletivo) com base na situação, nas ações dos personagens e no estado emocional dos NPCs.\n\n• Medo baixo: manifestações fracas (1d6 de dano, poucos PV, duração curta).\n• Medo moderado: criaturas ou obstáculos sólidos com PV e ataques próprios (2d6 + modificadores).\n• Medo intenso / pânico: manifestações poderosas, área maior, efeitos de status (medo, paralisia, confusão) e maior duração.\n\nO usuário sempre sofre feedback emocional: teste de Resistência ou Controle Quirk. Em caso de falha, recebe dano mental ou condição (abalado, aterrorizado, etc.).\n\nSe o medo for superado (inspiração, coragem, derrota das manifestações), elas enfraquecem rapidamente ou podem se voltar contra o usuário.');
          set('qLim', 'Feedback emocional constante. Se tentar forçar manifestações sem medo real, o custo dobra e o risco de feedback aumenta. Manifestações podem ser destruídas ou dissipadas por coragem, luz forte, ou ações que reduzam o medo. O usuário sente parte do terror que materializa.');
          set('qCusto', 3);
          set('qLv', 1);
          set('qXP', 0);
          set('qAlc', 'Presença (raio de percepção emocional, cerca de 20-30m)');
          set('qDur', 'Enquanto o medo persistir / 1 cena (pode ser menor)');
          abs = [
            { n: 'Manifestação Básica', d: 'Cria uma ou mais manifestações baseadas no medo atual. Custo 3. Força depende da intensidade do medo.' },
            { n: 'Amplificar Terror', d: 'Aumenta artificialmente o medo de um alvo ou grupo (teste de Carisma ou Controle vs Resistência). Custo 4. Facilita manifestações mais fortes.' },
            { n: 'Encarnar o Medo', d: 'O usuário se funde temporariamente com a manifestação mais forte, ganhando poderes dela por alguns turnos. Custo 5 + risco alto de feedback permanente se falhar no controle.' }
          ];
          rendAb();
          updQXP();
          alert('Quirk "Medo Materializado" carregada!\nO Mestre controla a intensidade do medo dos NPCs e o feedback que você recebe.');
        });
      }

      // ===== ABILITIES =====
      function rendAb() {
        var el = $('abList'); el.innerHTML = '';
        abs.forEach(function (a, i) {
          var d = document.createElement('div'); d.className = 'ab';
          d.innerHTML = '<strong>' + a.n + '</strong><br><span style="font-size:.78rem;color:var(--m)">' + a.d + '</span> <button class="d" data-i="' + i + '" style="float:right;padding:.1rem .4rem;font-size:.7rem">✕</button>';
          el.appendChild(d);
        });
        el.querySelectorAll('button[data-i]').forEach(function (b) {
          b.addEventListener('click', function () { abs.splice(+b.dataset.i, 1); rendAb(); });
        });
      }
      $('btnAddAb').addEventListener('click', function () {
        var n = val('abN').trim(), d = val('abD').trim();
        if (!n) { alert('Nome'); return; }
        abs.push({ n: n, d: d }); set('abN', ''); set('abD', ''); rendAb();
      });

      // ===== COMBAT =====
      function clog(m) { log('cLog', m); }
      function doAtk(tipo) {
        var tec = mod(+val('sAgi')); // use tecnica via aTec mapped roughly
        var forca = mod(+val('sFor'));
        var con = mod(+val('sCon'));
        var poder = +val('aPod') || 3;
        var custo = 0, modAtk = Math.max(tec, forca), danoD = 6, danoM = Math.floor(poder / 2), nome = 'Básico', vant = false;
        if (tipo === 'esp') { custo = 3; danoD = 6; danoM = poder; nome = 'Especial'; }
        else if (tipo === 'quirk') { custo = +val('qCusto') || 2; modAtk = con; danoD = 8; danoM = Math.floor(con / 2) + Math.floor(poder / 2); nome = val('qNome') || 'Quirk'; }
        else if (tipo === 'plus') { custo = 5; vant = true; danoD = 6; danoM = poder; nome = 'PLUS ULTRA'; }
        if (custo > 0) {
          var a = +txt('qkA');
          if (a < custo) { clog('⚠️ Energia insuficiente!'); return; }
          $('qkA').textContent = a - custo; updBars();
        }
        var r1 = rnd(20), r2 = vant ? rnd(20) : 0, roll = vant ? Math.max(r1, r2) : r1;
        var total = roll + modAtk, crit = roll === 20, falha = roll === 1;
        var ca = +val('alvoCA') || 12, alvo = val('alvoNome') || 'Alvo';
        var res = $('atkRes'); res.classList.remove('hid', 'hit', 'miss', 'crit');
        var msg = '', dmg = 0;
        if (falha) {
          res.classList.add('miss'); msg = '❌ FALHA CRÍTICA vs ' + alvo; clog('❌ ' + nome + ' vs ' + alvo + ': FALHA CRÍTICA');
        } else if (total >= ca || crit) {
          if (tipo === 'esp' || tipo === 'plus') dmg = rnd(6) + rnd(6) + danoM; else dmg = rnd(danoD) + danoM;
          if (crit) dmg *= 2;
          res.classList.add(crit ? 'crit' : 'hit');
          msg = (crit ? '💥 CRÍTICO! ' : '✅ ACERTOU! ') + nome + ' vs ' + alvo + ' | ' + total + ' vs CA ' + ca + ' | Dano: ' + dmg;
          clog('✅ ' + nome + ' vs ' + alvo + ': ' + total + ' vs CA ' + ca + ' → Dano ' + dmg + (crit ? ' CRIT' : '') + (custo ? ' (−' + custo + ')' : ''));
          // auto-damage enemy if name matches
          enemies.forEach(function (e) {
            if (e.nome.toLowerCase() === alvo.toLowerCase()) { e.pv = Math.max(0, e.pv - dmg); if (e.pv <= 0) clog('☠️ ' + e.nome + ' derrotado!'); }
          });
          rendEn();
        } else {
          res.classList.add('miss'); msg = '❌ ERROU vs ' + alvo + ' | ' + total + ' vs CA ' + ca;
          clog('❌ ' + nome + ' vs ' + alvo + ': ' + total + ' vs CA ' + ca + ' → ERROU');
        }
        res.textContent = msg;
      }
      $('atkBas').addEventListener('click', function () { doAtk('bas'); });
      $('atkEsp').addEventListener('click', function () { doAtk('esp'); });
      $('atkQuirk').addEventListener('click', function () { doAtk('quirk'); });
      $('atkPlus').addEventListener('click', function () { doAtk('plus'); });
      $('actEsq').addEventListener('click', function () { clog('➤ Esquiva'); });
      $('actDef').addEventListener('click', function () { clog('➤ Defesa Total (+2 CA)'); });
      $('clrLog').addEventListener('click', function () { $('cLog').innerHTML = ''; });

      function rendIni() {
        var el = $('iList'); el.innerHTML = '';
        ini.forEach(function (c, i) {
          var li = document.createElement('li'); if (i === turn) li.classList.add('cur');
          li.innerHTML = '<span>' + c.name + '</span><span>' + c.val + '</span>'; el.appendChild(li);
        });
      }
      $('btnAddIni').addEventListener('click', function () {
        var n = val('iName').trim(); if (!n) return;
        var v = +val('iVal') || (rnd(20) + mod(+val('sAgi')));
        ini.push({ name: n, val: v }); ini.sort(function (a, b) { return b.val - a.val; });
        set('iName', ''); set('iVal', ''); rendIni();
      });
      $('btnNext').addEventListener('click', function () { if (!ini.length) return; turn = (turn + 1) % ini.length; rendIni(); clog('Turno: ' + ini[turn].name); });
      $('btnClrIni').addEventListener('click', function () { ini = []; turn = 0; rendIni(); });
      $('btnRollIni').addEventListener('click', function () { ini.forEach(function (c) { c.val = rnd(20); }); ini.sort(function (a, b) { return b.val - a.val; }); turn = 0; rendIni(); });

      // ===== INIMIGOS =====
      function rendEn() {
        var el = $('enList'); el.innerHTML = '';
        if (!enemies.length) { el.innerHTML = '<p style="color:var(--m)">Nenhum inimigo.</p>'; return; }
        enemies.forEach(function (e, i) {
          var d = document.createElement('div'); d.className = 'enemy';
          d.innerHTML = '<strong>👾 ' + e.nome + '</strong> <span style="color:var(--m);font-size:.8rem">(' + e.tipo + ')</span><br>' +
            'PV: <strong>' + e.pv + '</strong> / CA: ' + e.ca + ' / Poder: ' + e.pod + (e.quirk ? ' / Quirk: ' + e.quirk : '') +
            '<div class="row" style="margin-top:.3rem">' +
            '<button class="d" data-dmg="' + i + '" data-n="5">−5 PV</button>' +
            '<button class="d" data-dmg="' + i + '" data-n="10">−10 PV</button>' +
            '<button class="b" data-tgt="' + i + '">Usar como Alvo</button>' +
            '<button class="g" data-ini="' + i + '">+ Ini</button>' +
            '<button class="d" data-del="' + i + '">✕</button></div>';
          el.appendChild(d);
        });
        el.querySelectorAll('[data-dmg]').forEach(function (b) {
          b.addEventListener('click', function () { var i = +b.dataset.dmg; enemies[i].pv = Math.max(0, enemies[i].pv - Number(b.dataset.n)); if (enemies[i].pv <= 0) clog('☠️ ' + enemies[i].nome + ' derrotado!'); rendEn(); localStorage.setItem('mha5_en', JSON.stringify(enemies)); });
        });
        el.querySelectorAll('[data-tgt]').forEach(function (b) {
          b.addEventListener('click', function () { var e = enemies[+b.dataset.tgt]; set('alvoNome', e.nome); set('alvoCA', e.ca); });
        });
        el.querySelectorAll('[data-ini]').forEach(function (b) {
          b.addEventListener('click', function () { var e = enemies[+b.dataset.ini]; ini.push({ name: e.nome, val: rnd(20) }); ini.sort(function (a, b) { return b.val - a.val; }); rendIni(); });
        });
        el.querySelectorAll('[data-del]').forEach(function (b) {
          b.addEventListener('click', function () { enemies.splice(+b.dataset.del, 1); rendEn(); localStorage.setItem('mha5_en', JSON.stringify(enemies)); });
        });
      }
      function genEnemy() {
        var tipo = val('enTipo');
        var nome = val('enNome').trim() || (fn[rnd(fn.length) - 1] + ' ' + ln[rnd(ln.length) - 1]);
        var rank = tipo.indexOf('S') >= 0 ? 5 : tipo.indexOf('A') >= 0 ? 4 : tipo.indexOf('B') >= 0 ? 3 : 2;
        var q = quirks[rnd(quirks.length) - 1];
        var e = { nome: nome, tipo: tipo, pv: 15 + rank * 12 + rnd(10), ca: 10 + rank + rnd(2), pod: rank + rnd(2), quirk: q.n + ' — ' + q.d };
        enemies.unshift(e); if (enemies.length > 15) enemies.pop();
        localStorage.setItem('mha5_en', JSON.stringify(enemies));
        set('enNome', ''); rendEn();
      }
      $('btnGenEn').addEventListener('click', genEnemy);
      $('btnAddEn').addEventListener('click', function () {
        var nome = val('enNome').trim() || 'Inimigo';
        enemies.unshift({ nome: nome, tipo: val('enTipo'), pv: +val('enPV') || 25, ca: +val('enCA') || 13, pod: +val('enPod') || 3, quirk: val('enQuirk') });
        localStorage.setItem('mha5_en', JSON.stringify(enemies)); rendEn();
      });
      $('btnClrEn').addEventListener('click', function () { enemies = []; localStorage.setItem('mha5_en', '[]'); rendEn(); });

      // ===== MAP =====
      function buildMap() {
        mapSize = +val('mapSize') || 10;
        var grid = $('mapGrid'); grid.style.gridTemplateColumns = 'repeat(' + mapSize + ',44px)'; grid.innerHTML = '';
        if (mapData.length !== mapSize) { mapData = []; mapTok = {}; for (var r = 0; r < mapSize; r++) { mapData[r] = []; for (var c = 0; c < mapSize; c++)mapData[r][c] = null; } }
        for (var r = 0; r < mapSize; r++) {
          for (var c = 0; c < mapSize; c++) {
            var cell = document.createElement('div'); cell.className = 'mcell';
            var key = r + ',' + c;
            if (mapData[r][c] === 'wall') cell.classList.add('wall');
            if (mapData[r][c] === 'cover') cell.classList.add('cover');
            if (mapTok[key]) { cell.textContent = mapTok[key].e || '👤'; }
            if (r === selR && c === selC) cell.classList.add('sel');
            (function (rr, cc) { cell.addEventListener('click', function () { clickCell(rr, cc); }); })(r, c);
            grid.appendChild(cell);
          }
        }
        $('mapN').textContent = Object.keys(mapTok).length;
      }
      function clickCell(r, c) {
        selR = r; selC = c; $('selCell').textContent = r + ',' + c;
        if (mapMode === 'wall') { mapData[r][c] = mapData[r][c] === 'wall' ? null : 'wall'; delete mapTok[r + ',' + c]; }
        else if (mapMode === 'cover') { mapData[r][c] = mapData[r][c] === 'cover' ? null : 'cover'; delete mapTok[r + ',' + c]; }
        else if (mapMode === 'clear') { mapData[r][c] = null; delete mapTok[r + ',' + c]; }
        else { var name = val('codinome') || val('nome') || 'Herói'; Object.keys(mapTok).forEach(function (k) { if (mapTok[k].n === name) delete mapTok[k]; }); mapTok[r + ',' + c] = { n: name, e: '🦸' }; mapData[r][c] = null; }
        buildMap();
      }
      $('mmChar').addEventListener('click', function () { mapMode = 'char'; });
      $('mmWall').addEventListener('click', function () { mapMode = 'wall'; });
      $('mmCover').addEventListener('click', function () { mapMode = 'cover'; });
      $('mmClear').addEventListener('click', function () { mapMode = 'clear'; });
      $('mmReset').addEventListener('click', function () { mapData = []; mapTok = {}; selR = -1; selC = -1; buildMap(); });
      $('mapSize').addEventListener('change', function () { mapData = []; mapTok = {}; buildMap(); });

      // ===== AGÊNCIA =====
      function updAgRep() {
        var r = +val('agRep') || 0;
        $('agRepBar').style.width = Math.min(100, r) + '%'; $('agRepV').textContent = r;
      }
      $('agRep').addEventListener('input', updAgRep);
      $('agxp10').addEventListener('click', function () { set('agXP', (+val('agXP') || 0) + 10); });
      $('agxp25').addEventListener('click', function () { set('agXP', (+val('agXP') || 0) + 25); });
      $('btnAgRank').addEventListener('click', function () {
        var rank = val('agRank'), rep = +val('agRep') || 0, axp = +val('agXP') || 0;
        var need = { D: 0, C: 20, B: 40, A: 65, S: 85 };
        var order = ['D', 'C', 'B', 'A', 'S'];
        var i = order.indexOf(rank);
        if (i >= 4) { alert('Já é Rank S!'); return; }
        var next = order[i + 1];
        var needRep = need[next], needXP = (i + 1) * 100;
        if (rep < needRep || axp < needXP) { alert('Precisa Rep ≥ ' + needRep + ' e AXP ≥ ' + needXP + ' (tem Rep ' + rep + ', AXP ' + axp + ')'); return; }
        set('agRank', next); set('agXP', axp - needXP);
        alert('Agência subiu para Rank ' + next + '!');
      });
      $('btnAgMis').addEventListener('click', function () {
        var list = ['Patrulha no distrito comercial.', 'Apoiar combate a vilão Rank B.', 'Resgatar civis de incêndio.', 'Investigar desaparecimentos.', 'Escoltar VIP.', 'Treinar sidekicks.', 'Interceptar carga ilegal.', 'Responder emergência em shopping.'];
        var m = list[rnd(list.length) - 1];
        var rank = val('agRank') || 'B';
        var bonus = { D: 5, C: 10, B: 15, A: 25, S: 40 }[rank] || 15;
        $('agMisOut').innerHTML = '<strong>Missão:</strong> ' + m + '<br>Recompensa: +' + (50 + bonus) + ' XP personagem · +' + Math.floor(bonus / 3) + ' Rep · +' + bonus + ' AXP';
      });

      // ===== MISSÕES =====
      function rendMis() {
        var el = $('mList'); el.innerHTML = '';
        if (!mis.length) { el.innerHTML = '<p style="color:var(--m)">Nenhuma.</p>'; return; }
        mis.forEach(function (m, i) {
          var d = document.createElement('div'); d.style.cssText = 'background:#0d1b2a;border-radius:8px;padding:.6rem;margin-bottom:.4rem;border-left:4px solid ' + (m.done ? 'var(--g)' : 'var(--b)') + ';cursor:pointer';
          if (selMis === i) d.style.outline = '2px solid var(--y)';
          d.innerHTML = '<strong style="color:var(--y)">' + (m.done ? '✅ ' : '') + m.tit + '</strong><br><span style="font-size:.78rem;color:var(--m)">' + m.tipo + ' · ' + m.xp + ' XP' + (m.rew ? ' · ' + m.rew : '') + '</span><br><span style="font-size:.8rem">' + m.desc + '</span>';
          d.addEventListener('click', function () { selMis = i; rendMis(); });
          el.appendChild(d);
        });
      }
      $('btnAddMis').addEventListener('click', function () {
        var tit = val('mTit').trim(); if (!tit) { alert('Título'); return; }
        mis.push({ tit: tit, tipo: val('mTipo'), desc: val('mDesc'), xp: +val('mXP') || 50, rew: val('mRew'), done: false });
        set('mTit', ''); set('mDesc', ''); set('mRew', '');
        localStorage.setItem('mha5_mis', JSON.stringify(mis)); rendMis();
      });
      $('btnCompMis').addEventListener('click', function () {
        if (selMis === null || !mis[selMis]) { alert('Selecione'); return; }
        var m = mis[selMis]; if (m.done) { alert('Já feita'); return; }
        m.done = true; set('xp', (+val('xp') || 0) + m.xp); updXP();
        if (m.rew) set('notas', val('notas') + '\n[Missão] ' + m.tit + ': ' + m.rew);
        // also give some rank pts and agency
        set('rankPts', (+val('rankPts') || 0) + Math.floor(m.xp / 5));
        set('agRep', Math.min(100, (+val('agRep') || 0) + Math.floor(m.xp / 10))); updAgRep();
        set('agXP', (+val('agXP') || 0) + Math.floor(m.xp / 4));
        localStorage.setItem('mha5_mis', JSON.stringify(mis)); rendMis();
        alert('Missão concluída! +' + m.xp + ' XP');
      });
      $('btnClrMis').addEventListener('click', function () { mis = mis.filter(function (m) { return !m.done; }); selMis = null; localStorage.setItem('mha5_mis', JSON.stringify(mis)); rendMis(); });

      // ===== RANKING =====
      $('rp10').addEventListener('click', function () { set('rankPts', (+val('rankPts') || 0) + 10); });
      $('rp25').addEventListener('click', function () { set('rankPts', (+val('rankPts') || 0) + 25); });
      $('btnUpRank').addEventListener('click', function () {
        var r = val('rankPessoal'), pts = +val('rankPts') || 0;
        var need = { C: 0, B: 50, A: 120, S: 250 };
        var order = ['C', 'B', 'A', 'S'];
        var i = order.indexOf(r);
        if (i >= 3) { $('rankMsg').textContent = 'Já é Rank S!'; return; }
        var next = order[i + 1];
        if (pts < need[next]) { $('rankMsg').textContent = 'Precisa de ' + need[next] + ' pts (tem ' + pts + ') para Rank ' + next; return; }
        set('rankPessoal', next); set('rankPts', pts - need[next]);
        $('rankMsg').textContent = 'Parabéns! Subiu para Rank ' + next + '!';
      });

      // ===== DADOS =====
      function rollDie(sides) {
        var qty = +val('dQty') || 1, md = +val('dMod') || 0, tot = 0, rs = [];
        for (var i = 0; i < qty; i++) { var r = rnd(sides); rs.push(r); tot += r; } tot += md;
        var t = qty > 1 || md ? (qty + 'd' + sides + (md ? (md > 0 ? '+' : '') + md : '') + '=[' + rs.join(',') + ']→' + tot) : ('d' + sides + '=' + tot);
        $('dRes').textContent = tot; log('dLog', t);
      }
      document.querySelectorAll('[data-d]').forEach(function (b) { b.addEventListener('click', function () { rollDie(+b.dataset.d); }); });
      $('btnRoll20').addEventListener('click', function () { rollDie(20); });
      document.querySelectorAll('[data-t]').forEach(function (b) {
        b.addEventListener('click', function () {
          var map = { Força: 'sFor', Agilidade: 'sAgi', Resistência: 'sRes', Inteligência: 'sInt', Carisma: 'sCar', Controle: 'sCon' };
          var v = +val(map[b.dataset.t]), m = mod(v), r = rnd(20), tot = r + m;
          $('dRes').textContent = tot; log('dLog', 'Teste ' + b.dataset.t + ': d20(' + r + ') ' + (m >= 0 ? '+' : '') + m + '=' + tot);
        });
      });
      $('btnAdv').addEventListener('click', function () { var r1 = rnd(20), r2 = rnd(20), b = Math.max(r1, r2); $('dRes').textContent = b; log('dLog', 'Vantagem: [' + r1 + ',' + r2 + ']→' + b); });
      $('btnDis').addEventListener('click', function () { var r1 = rnd(20), r2 = rnd(20), w = Math.min(r1, r2); $('dRes').textContent = w; log('dLog', 'Desvantagem: [' + r1 + ',' + r2 + ']→' + w); });

      // ===== MESTRE =====
      $('btnMestre').addEventListener('click', function () {
        mestreOn = !mestreOn;
        $('tabMestre').classList.toggle('hid', !mestreOn);
        this.textContent = mestreOn ? '🎲 Mestre ON' : '🎲 Mestre';
        this.style.background = mestreOn ? 'var(--o)' : '';
      });
      function genNPC(vil) {
        var tipo = vil ? 'Vilão Rank A' : val('nTipo');
        var nome = val('nNome').trim() || (fn[rnd(fn.length) - 1] + ' ' + ln[rnd(ln.length) - 1]);
        var q = quirks[rnd(quirks.length) - 1];
        npcs.unshift({ nome: nome, tipo: tipo, quirk: q.n, desc: q.d, pv: 20 + rnd(30) });
        if (npcs.length > 12) npcs.pop();
        var el = $('nList'); el.innerHTML = '';
        npcs.forEach(function (n) {
          var d = document.createElement('div'); d.style.cssText = 'background:#0d1b2a;padding:.5rem;border-radius:8px;margin-bottom:.3rem;font-size:.85rem';
          d.innerHTML = '<strong>' + n.nome + '</strong> (' + n.tipo + ') · ' + n.quirk + ' — ' + n.desc + ' · PV ' + n.pv;
          el.appendChild(d);
        });
      }
      $('btnGenNPC').addEventListener('click', function () { genNPC(false); });
      $('btnGenVil').addEventListener('click', function () { genNPC(true); });
      var enc = ['Vilão Rank C ataca.', 'Desabamento.', 'Quirk descontrolado.', 'Emboscada.', 'Roubo a banco.', 'Portal instável.'];
      var com = ['Refém na zona.', 'Quirk evolui.', 'Reforços.', 'Terreno instável.', 'Comunicação cortada.'];
      var rew = ['+30 XP.', 'Gadget.', 'Info da Liga.', '+Ranking.', 'Item raro.'];
      $('mEnc').addEventListener('click', function () { log('mLog', 'Encontro: ' + enc[rnd(enc.length) - 1]); });
      $('mCom').addEventListener('click', function () { log('mLog', 'Complicação: ' + com[rnd(com.length) - 1]); });
      $('mRew').addEventListener('click', function () { log('mLog', 'Recompensa: ' + rew[rnd(rew.length) - 1]); });

      // ===== HEADER BTNS =====
      $('btnSave').addEventListener('click', save);
      $('btnExport').addEventListener('click', function () {
        var d = getData(), a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
        a.download = (d.codinome || d.nome || 'pers') + '_mha.json'; a.click();
      });
      $('btnNew').addEventListener('click', function () {
        if (!confirm('Novo personagem?')) return;
        abs = [];
        load({ nome: '', codinome: '', idade: 15, genero: 'Masculino', lado: 'Estudante U.A. (Herói)', ranking: '', lv: 1, xp: 0, hpA: 30, hpM: 30, stA: 20, stM: 20, qkA: 15, qkM: 15, aPod: 3, aVel: 3, aTec: 3, aInt: 3, aCoo: 3, sFor: 10, sAgi: 10, sRes: 10, sInt: 10, sCar: 10, sCon: 10, qNome: '', qTipo: 'Emitter', qComp: 'simples', qDesc: '', qMec: '', qLim: '', qCusto: 2, qLv: 1, qXP: 0, qAlc: '', qDur: '', abs: [], inv: '', notas: '', rel: '', rankP: 'C', rankPts: 0 });
        chars.push(getData()); idx = chars.length - 1; rendChips();
      });
      $('btnPreset').addEventListener('click', function () {
        var c = prompt('1=Deku  2=Bakugo  3=Shigaraki');
        var m = { '1': 'deku', '2': 'bakugo', '3': 'shigaraki' };
        if (!m[c]) return;
        if (chars[idx]) chars[idx] = getData();
        var d = JSON.parse(JSON.stringify(presets[m[c]]));
        chars.push(d); idx = chars.length - 1; load(d); rendChips(); localStorage.setItem('mha5', JSON.stringify(chars));
        alert(d.codinome + ' carregado!');
      });

      // ===== INIT =====
      if (!chars.length) chars.push(JSON.parse(JSON.stringify(presets.deku)));
      idx = 0; load(chars[0]); rendChips(); rendMis(); rendEn(); updStats(); calcMods(); updBars(); updXP(); updQXP(); updAgRep();

    })();
