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
      let mapSize = 8;
      let mapData = [];
      let mapTok = {};
      let selR = -1, selC = -1;
      let mapAtkKey = null; // key "r,c" do atacante / ator
      let mapTgtKey = null; // key do alvo
      let mapCombatMode = true;
      let mapMoveFrom = null;
      let mapIniOrder = []; // [{key, ini, name}]
      let mapIniIdx = 0;
      let mapActionsLeft = 2;
      let mapMoveModeActive = false; // movimento do turno de combate
      let mapMoveBudget = 0;

      const presets = {
        deku: { nome: 'Izuku Midoriya', codinome: 'Deku', idade: 15, genero: 'Masculino', lado: 'Estudante U.A. (Herói)', ranking: 'Classe 1-A', lv: 3, xp: 180, apar: 'Cabelo verde', hist: 'OFA', hpA: 52, hpM: 52, stA: 28, stM: 28, qkA: 24, qkM: 24, aPod: 5, aVel: 3, aTec: 4, aInt: 5, aCoo: 5, sFor: 15, sAgi: 13, sRes: 14, sInt: 16, sCar: 13, sCon: 12, qNome: 'One For All', qTipo: 'Emitter', qComp: 'moderada', qDesc: 'Poder acumulado de gerações anteriores', qMec: 'Pode usar percentuais diferentes de poder (5% a 100%). Quanto maior o %, maior o dano e o risco de lesão.', qLim: 'Quebra ossos se usar acima do controle atual', qCusto: 3, qLv: 2, qXP: 30, qAlc: 'Corpo / Toque / Projétil', qDur: 'Instantâneo / Sustentado', qDmg: '2d6+Poder', qAlcanceNum: 1, abs: [{ n: 'Delaware Smash', d: 'Soco concentrado de One For All', tipo: 'combate', dmg: '2d6+Poder', custo: 3, alcance: 1 }, { n: 'Full Cowling', d: 'Mantém One For All ativo (passiva de controle)', tipo: 'passiva', dmg: '', custo: 0, alcance: 0 }, { n: 'Smash em área', d: 'Golpe devastador', tipo: 'completa', dmg: '3d6+Poder', custo: 5, alcance: 2 }], inv: 'Traje', notas: '', rel: 'All Might, Bakugo', rankP: 'B', rankPts: 40 },
        bakugo: { nome: 'Katsuki Bakugo', codinome: 'Dynamight', idade: 15, genero: 'Masculino', lado: 'Estudante U.A. (Herói)', ranking: 'Classe 1-A', lv: 3, xp: 210, apar: 'Loiro', hist: 'Nº1', hpA: 48, hpM: 48, stA: 30, stM: 30, qkA: 22, qkM: 22, aPod: 5, aVel: 4, aTec: 5, aInt: 4, aCoo: 2, sFor: 14, sAgi: 15, sRes: 13, sInt: 14, sCar: 11, sCon: 15, qNome: 'Explosion', qTipo: 'Emitter', qComp: 'simples', qDesc: 'Cria explosões a partir do suor nitroglicerina das mãos', qMec: 'Dano e área aumentam com o Nível do Quirk e suor acumulado.', qLim: 'Fadiga e necessidade de suor', qCusto: 2, qLv: 2, qXP: 40, qAlc: 'Mãos / Projétil curto-médio', qDur: 'Instantâneo', qDmg: '1d8+Poder', qAlcanceNum: 3, abs: [{ n: 'AP Shot', d: 'Feixe de explosão perfurante', tipo: 'combate', dmg: '1d8+Poder', custo: 2, alcance: 4 }, { n: 'Explosão Curta', d: 'Explosão em área próxima', tipo: 'combate', dmg: '2d6+Poder', custo: 3, alcance: 1 }, { n: 'Howitzer Impact', d: 'Golpe aéreo completo', tipo: 'completa', dmg: '3d6+Poder', custo: 5, alcance: 2 }], inv: 'Granadas', notas: '', rel: 'Deku', rankP: 'B', rankPts: 55 },
        shigaraki: { nome: 'Tomura Shigaraki', codinome: 'Shigaraki', idade: 20, genero: 'Masculino', lado: 'Vilão', ranking: 'Líder', lv: 5, xp: 50, apar: 'Cabelo azul', hist: 'Destruir', hpA: 55, hpM: 55, stA: 25, stM: 25, qkA: 30, qkM: 30, aPod: 5, aVel: 3, aTec: 4, aInt: 4, aCoo: 1, sFor: 13, sAgi: 12, sRes: 14, sInt: 15, sCar: 12, sCon: 16, qNome: 'Decay', qTipo: 'Emitter', qComp: 'moderada', qDesc: 'Desintegra qualquer coisa que tocar com os cinco dedos', qMec: 'Pode expandir a área de efeito com prática. Em níveis altos, pode iniciar o Decay à distância em superfícies conectadas.', qLim: 'Precisa de contato com cinco dedos; resiste a materiais especiais', qCusto: 2, qLv: 3, qXP: 20, qAlc: 'Toque (pode escalar)', qDur: 'Instantâneo / Propagação', qDmg: '2d8+Controle', qAlcanceNum: 1, abs: [{ n: 'Decay', d: 'Toque desintegrador', tipo: 'combate', dmg: '2d8+Controle', custo: 2, alcance: 1 }, { n: 'Decay Wave', d: 'Onda de desintegração', tipo: 'completa', dmg: '3d6+Controle', custo: 4, alcance: 2 }], inv: '', notas: '', rel: 'AFO', orgV: 'Liga', objV: 'Destruir heróis', perigo: 'S', rankP: 'S', rankPts: 200 }
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
          if (tab.dataset.p === 'mapa') { fillHeroSelect(); buildMap(); }
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
          qDmg: val('qDmg'), qAlcanceNum: +val('qAlcanceNum') || 1,
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
        set('qDmg', d.qDmg || ''); set('qAlcanceNum', d.qAlcanceNum != null ? d.qAlcanceNum : 1);
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
        var el = $('abList'); if (!el) return; el.innerHTML = '';
        var tipoLabel = { combate: 'Combate (1)', movimento: 'Movimento (1)', completa: 'Completa (2)', passiva: 'Passiva' };
        abs.forEach(function (a, i) {
          var d = document.createElement('div'); d.className = 'ab';
          var t = a.tipo || 'combate';
          d.innerHTML = '<strong>' + a.n + '</strong> <span style="color:var(--y);font-size:.72rem">[' + (tipoLabel[t] || t) + ']</span>' +
            (a.dmg ? ' <span style="color:var(--o);font-size:.75rem">⚔ ' + a.dmg + '</span>' : '') +
            (a.custo ? ' <span style="color:var(--p);font-size:.75rem">⚡' + a.custo + '</span>' : '') +
            (a.alcance != null ? ' <span style="font-size:.72rem;color:var(--m)">alc ' + a.alcance + '</span>' : '') +
            '<br><span style="font-size:.78rem;color:var(--m)">' + (a.d || '') + '</span>' +
            ' <button class="d" data-i="' + i + '" style="float:right;padding:.1rem .4rem;font-size:.7rem">✕</button>';
          el.appendChild(d);
        });
        el.querySelectorAll('button[data-i]').forEach(function (b) {
          b.addEventListener('click', function () { abs.splice(+b.dataset.i, 1); rendAb(); });
        });
      }
      if ($('btnAddAb')) $('btnAddAb').addEventListener('click', function () {
        var n = val('abN').trim(), d = val('abD').trim();
        if (!n) { alert('Nome da habilidade'); return; }
        abs.push({
          n: n, d: d,
          tipo: val('abTipo') || 'combate',
          dmg: (val('abDmg') || '').trim(),
          custo: +val('abCusto') || 0,
          alcance: +val('abAlcance') || 1
        });
        set('abN', ''); set('abD', ''); set('abDmg', ''); set('abCusto', 0); set('abAlcance', 1);
        rendAb();
      });

      // ===== COMBAT =====
      function clog(m) { log('cLog', m); }
      function doAtk(tipo) {
        var tec = mod(+val('sAgi')); // use tecnica via aTec mapped roughly
        var forca = mod(+val('sFor'));
        var con = mod(+val('sCon'));
        var poder = +val('aPod') || 3;
        var qLv = +val('qLv') || 1;
        var custo = 0, modAtk = Math.max(tec, forca), nome = 'Básico', vant = false;
        // Novo balanceamento:
        // Básico: 1d6 + Poder
        // Especial: 2d6 + Poder (custo 3)
        // Quirk: 1d8 + Controle + Poder/2  + bônus de Nível do Quirk no ataque
        // Plus Ultra: 2d8 + Poder + vantagem (custo 5)
        var dmgDice = 1, dmgSides = 6, dmgBonus = poder;
        if (tipo === 'esp') {
          custo = 3; dmgDice = 2; dmgSides = 6; dmgBonus = poder; nome = 'Especial';
        } else if (tipo === 'quirk') {
          custo = +val('qCusto') || 2;
          modAtk = con + Math.floor(qLv / 2); // +1 a cada 2 níveis de Quirk
          dmgDice = 1; dmgSides = 8; dmgBonus = con + Math.floor(poder / 2);
          nome = val('qNome') || 'Quirk';
        } else if (tipo === 'plus') {
          custo = 5; vant = true; dmgDice = 2; dmgSides = 8; dmgBonus = poder; nome = 'PLUS ULTRA';
        }
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
          for (var i = 0; i < dmgDice; i++) dmg += rnd(dmgSides);
          dmg += dmgBonus;
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
      if ($('atkBas')) $('atkBas').addEventListener('click', function () { doAtk('bas'); });
      if ($('atkEsp')) $('atkEsp').addEventListener('click', function () { doAtk('esp'); });
      if ($('atkQuirk')) $('atkQuirk').addEventListener('click', function () { doAtk('quirk'); });
      if ($('atkPlus')) $('atkPlus').addEventListener('click', function () { doAtk('plus'); });
      if ($('actEsq')) $('actEsq').addEventListener('click', function () { clog('➤ Esquiva'); });
      if ($('actDef')) $('actDef').addEventListener('click', function () { clog('➤ Defesa Total (+2 CA)'); });
      if ($('clrLog')) $('clrLog').addEventListener('click', function () { $('cLog').innerHTML = ''; });

      function rendIni() {
        var el = $('iList'); if (!el) return; el.innerHTML = '';
        ini.forEach(function (c, i) {
          var li = document.createElement('li'); if (i === turn) li.classList.add('cur');
          li.innerHTML = '<span>' + c.name + '</span><span>' + c.val + '</span>'; el.appendChild(li);
        });
      }
      if ($('btnAddIni')) $('btnAddIni').addEventListener('click', function () {
        var n = val('iName').trim(); if (!n) return;
        var v = +val('iVal') || (rnd(20) + mod(+val('sAgi')));
        ini.push({ name: n, val: v }); ini.sort(function (a, b) { return b.val - a.val; });
        set('iName', ''); set('iVal', ''); rendIni();
      });
      if ($('btnNext')) $('btnNext').addEventListener('click', function () { if (!ini.length) return; turn = (turn + 1) % ini.length; rendIni(); clog('Turno: ' + ini[turn].name); });
      if ($('btnClrIni')) $('btnClrIni').addEventListener('click', function () { ini = []; turn = 0; rendIni(); });
      if ($('btnRollIni')) $('btnRollIni').addEventListener('click', function () { ini.forEach(function (c) { c.val = rnd(20); }); ini.sort(function (a, b) { return b.val - a.val; }); turn = 0; rendIni(); });

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
        // Novo balanceamento: Rank C mais fraco, progressão mais suave
        var e = { nome: nome, tipo: tipo, pv: 12 + rank * 10 + rnd(8), ca: 10 + rank + rnd(2), pod: rank + rnd(2), quirk: q.n + ' — ' + q.d };
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

      // ===== MAP + COMBATE TÁTICO =====
      function setMapMode(mode, label) {
        mapMode = mode;
        mapCombatMode = (mode === 'combat');
        if (mode !== 'move') mapMoveFrom = null;
        if ($('mapModeLabel')) $('mapModeLabel').textContent = label || mode;
        ['mmChar', 'mmNpc', 'mmVil', 'mmMove', 'mmWall', 'mmCover', 'mmClear'].forEach(function (id) {
          var b = $(id);
          if (b) b.classList.remove('map-on');
        });
        var mapBtn = {
          char: 'mmChar', npc: 'mmNpc', vilao: 'mmVil', move: 'mmMove',
          wall: 'mmWall', cover: 'mmCover', clear: 'mmClear'
        };
        var active = mapBtn[mode] ? $(mapBtn[mode]) : null;
        if (active) active.classList.add('map-on');
      }

      function fillHeroSelect() {
        var sel = $('mapHeroSelect');
        if (!sel) return;
        var cur = sel.value;
        sel.innerHTML = '<option value="">— ficha salva —</option>';
        chars.forEach(function (c, i) {
          var opt = document.createElement('option');
          opt.value = String(i);
          opt.textContent = (c.codinome || c.nome || ('P' + (i + 1))) + ' Nv.' + (c.lv || 1);
          sel.appendChild(opt);
        });
        if (cur) sel.value = cur;
      }

      function hasCoverAt(r, c) {
        // cobertura na própria célula ou adjacente (N/S/L/O)
        if (mapData[r] && mapData[r][c] === 'cover') return true;
        var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        for (var i = 0; i < dirs.length; i++) {
          var rr = r + dirs[i][0], cc = c + dirs[i][1];
          if (mapData[rr] && mapData[rr][cc] === 'cover') return true;
        }
        return false;
      }

      function cellPx() {
        if (mapSize >= 28) return 22;
        if (mapSize >= 20) return 26;
        if (mapSize >= 16) return 30;
        return 44;
      }

      function mlog(msg) {
        log('mapLog', msg);
      }

      // Resolve fórmula de dano da ficha: "2d6+Poder", "1d8+Controle", "3d6", "1d6+2"
      function rollFormula(formula, stats) {
        if (!formula || !String(formula).trim()) return 0;
        stats = stats || {};
        var f = String(formula).replace(/\s/g, '');
        f = f.replace(/Poder/gi, String(stats.poder || 0));
        f = f.replace(/Controle/gi, String(stats.controle || 0));
        f = f.replace(/Força|Forca/gi, String(stats.forca || 0));
        f = f.replace(/Agilidade/gi, String(stats.agi || 0));
        f = f.replace(/Nível|Nivel|Nv/gi, String(stats.lv || 1));
        var total = 0;
        // tokens like 2d6, d8, +3, -1
        var re = /([+-]?)(\d*)d(\d+)|([+-]\d+)/gi;
        var m, found = false;
        while ((m = re.exec(f)) !== null) {
          found = true;
          if (m[3]) {
            var sign = m[1] === '-' ? -1 : 1;
            var qty = m[2] ? parseInt(m[2], 10) : 1;
            var sides = parseInt(m[3], 10);
            for (var i = 0; i < qty; i++) total += sign * rnd(sides);
          } else if (m[4]) {
            total += parseInt(m[4], 10);
          }
        }
        if (!found && /^-?\d+$/.test(f)) total = parseInt(f, 10);
        return total;
      }

      function actionCostOf(tipo) {
        if (tipo === 'completa') return 2;
        if (tipo === 'passiva') return 0;
        return 1; // combate ou movimento
      }

      function getTokenStats(t) {
        return {
          poder: t.aPod || t.pod || 3,
          controle: mod(t.sCon || 12),
          forca: mod(t.sFor || 12),
          agi: mod(t.sAgi || 12),
          lv: t.lv || 1
        };
      }

      function getTokenAbs(t) {
        var list = [];
        var ch = (t.charIdx != null && chars[t.charIdx]) ? chars[t.charIdx] : null;
        var qNome = (ch && ch.qNome) || t.qNome || '';
        var qDmg = (ch && ch.qDmg) || t.qDmg || '';
        var qCusto = (ch && ch.qCusto != null) ? ch.qCusto : (t.qCusto != null ? t.qCusto : 0);
        var qAlc = (ch && ch.qAlcanceNum != null) ? ch.qAlcanceNum : (t.qAlcanceNum != null ? t.qAlcanceNum : 1);
        if (qNome && qDmg) {
          list.push({
            n: qNome,
            d: (ch && ch.qDesc) || 'Ataque padrão do Quirk',
            tipo: 'combate',
            dmg: qDmg,
            custo: qCusto || 0,
            alcance: qAlc,
            isQuirk: true
          });
        }
        var extra = (ch && ch.abs) ? ch.abs : (t.abs || []);
        extra.forEach(function (a) { list.push(a); });
        return list;
      }

      function getMoveSpeed(t) {
        if (t.charIdx != null && chars[t.charIdx]) return Math.max(1, chars[t.charIdx].aVel || 3);
        return Math.max(1, t.vel || t.aVel || 3);
      }

      function showPokeMenu(which) {
        ['pokeMenuMain', 'pokeMenuFight', 'pokeMenuItem', 'pokeMenuRun'].forEach(function (id) {
          var el = $(id);
          if (!el) return;
          if (id === which) el.classList.remove('hid');
          else el.classList.add('hid');
        });
      }

      function updateMapCombatUI() {
        var atk = mapAtkKey && mapTok[mapAtkKey] ? mapTok[mapAtkKey] : null;
        var tgt = mapTgtKey && mapTok[mapTgtKey] ? mapTok[mapTgtKey] : null;
        if ($('mapAtkName')) $('mapAtkName').textContent = atk ? atk.n : '—';
        if ($('mapTgtName')) $('mapTgtName').textContent = tgt ? tgt.n : '—';
        if ($('mapAtkInfo')) $('mapAtkInfo').textContent = atk ? (atk.e + ' ' + atk.n + ' · PV ' + atk.hp + '/' + atk.hpM + ' · CA ' + atk.ca) : 'nenhum';
        if ($('mapTgtInfo')) {
          $('mapTgtInfo').textContent = tgt
            ? (tgt.e + ' ' + tgt.n + ' · PV ' + tgt.hp + '/' + tgt.hpM)
            : 'nenhum (clique no mapa)';
        }
        if ($('mapActionsLeft')) $('mapActionsLeft').textContent = String(mapActionsLeft);
        var turnTok = null;
        if (mapIniOrder.length && mapIniOrder[mapIniIdx]) turnTok = mapTok[mapIniOrder[mapIniIdx].key];
        if ($('mapTurnName')) $('mapTurnName').textContent = turnTok ? turnTok.n : '—';
        renderMapAbilities();
        renderMapIniList();
        showPokeMenu('pokeMenuMain');
      }

      function renderMapIniList() {
        var el = $('mapIniList');
        if (!el) return;
        if (!mapIniOrder.length) { el.innerHTML = ''; return; }
        el.innerHTML = mapIniOrder.map(function (o, i) {
          var cur = i === mapIniIdx ? ' style="color:var(--y);font-weight:700"' : '';
          return '<span' + cur + '>' + (i === mapIniIdx ? '▶ ' : '') + o.name + ' (' + o.ini + ')</span>';
        }).join(' · ');
      }

      function renderMapAbilities() {
        var el = $('mapAbilities');
        if (!el) return;
        el.innerHTML = '';
        var key = mapIniOrder.length ? mapIniOrder[mapIniIdx].key : mapAtkKey;
        var t = key && mapTok[key] ? mapTok[key] : null;
        if (!t) {
          el.innerHTML = '<span style="color:var(--m);font-size:.8rem">Sem personagem no turno.</span>';
          return;
        }
        var list = getTokenAbs(t);
        var passives = list.filter(function (a) { return (a.tipo || '') === 'passiva'; });
        var actives = list.filter(function (a) { return (a.tipo || 'combate') !== 'passiva'; });
        if (passives.length) {
          var p = document.createElement('div');
          p.style.cssText = 'font-size:.75rem;color:var(--p);margin-bottom:.25rem';
          p.textContent = 'Passivas: ' + passives.map(function (a) { return a.n; }).join(', ');
          el.appendChild(p);
        }
        if (!actives.length) {
          var s = document.createElement('div');
          s.style.cssText = 'font-size:.8rem;color:var(--m)';
          s.textContent = 'Nenhuma habilidade ativa na ficha. Crie em Personagem → Habilidades.';
          el.appendChild(s);
          return;
        }
        actives.forEach(function (a, i) {
          var cost = actionCostOf(a.tipo || 'combate');
          var btn = document.createElement('button');
          btn.className = (a.tipo === 'completa') ? 'o' : (a.tipo === 'movimento' ? 'b' : 'p');
          btn.style.width = '100%';
          btn.textContent = a.n + ' (' + cost + ' ação' + (cost > 1 ? 'ões' : '') + ')' +
            (a.dmg ? ' · ' + a.dmg : '') + (a.custo ? ' · ⚡' + a.custo : '');
          btn.title = a.d || '';
          btn.addEventListener('click', function () { useMapAbility(a); });
          el.appendChild(btn);
        });
      }

      function spendActions(n) {
        if (mapActionsLeft < n) { mlog('⚠️ Ações insuficientes (tem ' + mapActionsLeft + ', precisa ' + n + ')'); return false; }
        mapActionsLeft -= n;
        if ($('mapActionsLeft')) $('mapActionsLeft').textContent = String(mapActionsLeft);
        if (mapActionsLeft <= 0) {
          mlog('— Sem ações restantes — passando o turno —');
          setTimeout(function () { nextMapTurn(); }, 350);
        }
        return true;
      }

      function startMapTurn() {
        mapActionsLeft = 2;
        mapMoveModeActive = false;
        mapMoveBudget = 0;
        mapTgtKey = null;
        if (mapIniOrder.length) {
          // sincroniza keys se tokens se moveram
          mapIniOrder = mapIniOrder.filter(function (o) { return mapTok[o.key]; });
          if (!mapIniOrder.length) { updateMapCombatUI(); return; }
          if (mapIniIdx >= mapIniOrder.length) mapIniIdx = 0;
          var k = mapIniOrder[mapIniIdx].key;
          mapAtkKey = k;
          var t = mapTok[k];
          var side = t ? (t.side === 'vilao' ? '👾' : t.side === 'heroi' ? '🦸' : '📌') : '';
          mlog('▶ Turno de ' + side + ' ' + (t ? t.n : '?') + ' — 2 ações');
        }
        updateMapCombatUI();
        buildMap();
      }

      function rollMapInitiative() {
        // Iniciativa fixa da cena: rola uma vez para todos (heróis, NPCs e vilões)
        mapIniOrder = [];
        Object.keys(mapTok).forEach(function (k) {
          var t = mapTok[k];
          if (t.hp !== undefined && t.hp <= 0) return;
          if (t.side === 'outro' && !t.combat) return;
          var agi = mod(t.sAgi || 12);
          // bônus leve por Velocidade
          var vel = getMoveSpeed(t);
          var ini = rnd(20) + agi + Math.floor(vel / 3);
          t.ini = ini; // guarda no token
          mapIniOrder.push({ key: k, ini: ini, name: t.n, side: t.side });
        });
        mapIniOrder.sort(function (a, b) { return b.ini - a.ini; });
        mapIniIdx = 0;
        if (!mapIniOrder.length) { mlog('⚠️ Nenhum combatente no mapa'); return; }
        mlog('🎲 Iniciativa da cena (fixa): ' + mapIniOrder.map(function (o) {
          return o.name + ' ' + o.ini;
        }).join(' → '));
        mlog('Ordem permanece até o fim da cena. Turnos: player e NPC/vilão alternam pela lista.');
        startMapTurn();
      }

      function nextMapTurn() {
        if (!mapIniOrder.length) { mlog('⚠️ Role a iniciativa primeiro'); return; }
        // remove derrotados, mantém ordem relativa da iniciativa da cena
        var prevName = mapIniOrder[mapIniIdx] ? mapIniOrder[mapIniIdx].name : '';
        mapIniOrder = mapIniOrder.filter(function (o) {
          return mapTok[o.key] && mapTok[o.key].hp > 0;
        });
        if (!mapIniOrder.length) { mlog('Combate encerrado'); updateMapCombatUI(); return; }
        // avança para a próxima entidade viva
        if (prevName) {
          var found = -1;
          for (var i = 0; i < mapIniOrder.length; i++) {
            if (mapIniOrder[i].name === prevName) { found = i; break; }
          }
          mapIniIdx = found >= 0 ? (found + 1) % mapIniOrder.length : 0;
        } else {
          mapIniIdx = (mapIniIdx + 1) % mapIniOrder.length;
        }
        startMapTurn();
      }

      function useMapAbility(ab) {
        if (!mapIniOrder.length) { mlog('⚠️ Role iniciativa'); return; }
        var actorKey = mapIniOrder[mapIniIdx].key;
        var actor = mapTok[actorKey];
        if (!actor || actor.hp <= 0) { mlog('⚠️ Ator inválido'); return; }
        var cost = actionCostOf(ab.tipo || 'combate');
        if (mapActionsLeft < cost) { mlog('⚠️ Precisa de ' + cost + ' ação(ões)'); return; }

        if ((ab.tipo || 'combate') === 'movimento') {
          if (!spendActions(cost)) return;
          mapMoveModeActive = true;
          mapMoveBudget = getMoveSpeed(actor);
          mapAtkKey = actorKey;
          mlog('🚶 ' + actor.n + ' pode mover até ' + mapMoveBudget + ' célula(s). Clique no destino.');
          buildMap();
          return;
        }

        // combate / completa — precisa de alvo se tiver dano
        if (ab.dmg) {
          if (!mapTgtKey || !mapTok[mapTgtKey]) { mlog('⚠️ Selecione um alvo'); return; }
          var tgt = mapTok[mapTgtKey];
          if (tgt.hp <= 0) { mlog('⚠️ Alvo derrotado'); return; }
          // alcance
          var ap = actorKey.split(',').map(Number);
          var tp = mapTgtKey.split(',').map(Number);
          var dist = Math.abs(ap[0] - tp[0]) + Math.abs(ap[1] - tp[1]);
          var alc = ab.alcance != null ? ab.alcance : 1;
          if (dist > alc) { mlog('⚠️ Fora de alcance (dist ' + dist + ', alc ' + alc + ')'); return; }

          if (!spendActions(cost)) return;

          // energia
          if (ab.custo > 0) {
            // só desconta da ficha ativa se for o mesmo personagem
            var cn = val('codinome') || val('nome');
            if (actor.n === cn || actor.n === val('nome')) {
              var qk = +txt('qkA');
              if (qk < ab.custo) { mapActionsLeft += cost; mlog('⚠️ Energia insuficiente'); updateMapCombatUI(); return; }
              $('qkA').textContent = qk - ab.custo;
              updBars();
            }
          }

          var stats = getTokenStats(actor);
          var cn2 = val('codinome') || val('nome');
          if (actor.n === cn2 || actor.n === val('nome')) {
            stats.poder = +val('aPod') || stats.poder;
            stats.controle = mod(+val('sCon') || 10);
            stats.forca = mod(+val('sFor') || 10);
            stats.agi = mod(+val('sAgi') || 10);
          }

          var modAtk = Math.max(stats.forca, stats.agi, stats.controle);
          var cover = hasCoverAt(tp[0], tp[1]);
          var ca = (tgt.ca || 12) + (cover ? 2 : 0);
          var roll = rnd(20);
          var total = roll + modAtk;
          var crit = roll === 20, falha = roll === 1;
          var res = $('mapAtkRes');
          if (res) res.classList.remove('hid', 'hit', 'miss', 'crit');

          if (falha) {
            if (res) { res.classList.add('miss'); res.textContent = '❌ Falha crítica com ' + ab.n; }
            mlog('❌ ' + actor.n + ' falhou com ' + ab.n);
          } else if (total >= ca || crit) {
            var dmg = rollFormula(ab.dmg, stats);
            if (crit) dmg *= 2;
            if (cover) dmg = Math.max(0, dmg - 2);
            tgt.hp = Math.max(0, tgt.hp - dmg);
            if (res) {
              res.classList.add(crit ? 'crit' : 'hit');
              res.textContent = (crit ? '💥 ' : '✅ ') + ab.n + ' → ' + tgt.n + ' | ' + total + ' vs CA ' + ca + ' | Dano ' + dmg;
            }
            mlog((crit ? '💥 ' : '✅ ') + actor.n + ' usou ' + ab.n + ' em ' + tgt.n + ' → ' + dmg + ' dano' +
              (cover ? ' (cob.)' : '') + ' | PV ' + tgt.hp + '/' + tgt.hpM + (ab.custo ? ' (−' + ab.custo + '⚡)' : ''));
            if (tgt.hp <= 0) mlog('☠️ ' + tgt.n + ' derrotado!');
            syncHeroToSheet(tgt);
          } else {
            if (res) { res.classList.add('miss'); res.textContent = '❌ ' + ab.n + ' errou | ' + total + ' vs CA ' + ca; }
            mlog('❌ ' + actor.n + ' errou ' + ab.n + ' em ' + tgt.n + ' (' + total + ' vs ' + ca + ')');
          }
          showPokeMenu('pokeMenuMain');
          buildMap();
          return;
        }

        // habilidade sem dano (buff etc.)
        if (!spendActions(cost)) return;
        mlog('✨ ' + actor.n + ' usou ' + ab.n + (ab.d ? ': ' + ab.d : ''));
        showPokeMenu('pokeMenuMain');
        buildMap();
      }

      function renderMapCombatants() {
        var el = $('mapCombatants');
        if (!el) return;
        el.innerHTML = '';
        var keys = Object.keys(mapTok);
        if (!keys.length) {
          el.innerHTML = '<p style="color:var(--m);font-size:.82rem">Coloque heróis e vilões no mapa para combater.</p>';
          return;
        }
        keys.forEach(function (k) {
          var t = mapTok[k];
          if (t.side === 'outro' && !t.hp) return;
          var d = document.createElement('div');
          d.style.cssText = 'background:#0d1b2a;border-radius:8px;padding:.45rem .55rem;margin-bottom:.3rem;border-left:4px solid ' +
            (t.side === 'vilao' ? 'var(--r)' : t.side === 'heroi' ? 'var(--g)' : 'var(--y)') +
            (k === mapAtkKey ? ';outline:2px solid var(--g)' : '') +
            (k === mapTgtKey ? ';outline:2px solid var(--r)' : '');
          var pct = t.hpM ? Math.max(0, Math.min(100, (t.hp / t.hpM) * 100)) : 0;
          var dead = t.hp <= 0;
          d.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<strong style="' + (dead ? 'text-decoration:line-through;opacity:.6' : '') + '">' + (t.e || '') + ' ' + t.n + '</strong>' +
            '<span style="font-size:.75rem;color:var(--m)">' + k + '</span></div>' +
            '<div style="font-size:.78rem;margin-top:.15rem">PV <strong>' + t.hp + '</strong>/' + t.hpM + ' · CA ' + t.ca + ' · Pod ' + (t.pod || 0) +
            (dead ? ' <span style="color:var(--r)">DERROTADO</span>' : '') + '</div>' +
            '<div class="bar" style="margin-top:.25rem;height:8px"><div class="fill hp" style="width:' + pct + '%"></div></div>' +
            '<div class="row" style="margin-top:.3rem;gap:.25rem">' +
            '<button class="b" data-matk="' + k + '" style="padding:.15rem .4rem;font-size:.7rem">Atacante</button>' +
            '<button class="d" data-mtgt="' + k + '" style="padding:.15rem .4rem;font-size:.7rem">Alvo</button>' +
            '<button class="g" data-mhp="' + k + '" data-n="5" style="padding:.15rem .4rem;font-size:.7rem">+5 PV</button>' +
            '<button class="d" data-mhp="' + k + '" data-n="-5" style="padding:.15rem .4rem;font-size:.7rem">−5 PV</button>' +
            '</div>';
          el.appendChild(d);
        });
        el.querySelectorAll('[data-matk]').forEach(function (b) {
          b.addEventListener('click', function () {
            mapAtkKey = b.dataset.matk;
            updateMapCombatUI();
            buildMap();
          });
        });
        el.querySelectorAll('[data-mtgt]').forEach(function (b) {
          b.addEventListener('click', function () {
            mapTgtKey = b.dataset.mtgt;
            updateMapCombatUI();
            buildMap();
          });
        });
        el.querySelectorAll('[data-mhp]').forEach(function (b) {
          b.addEventListener('click', function () {
            var t = mapTok[b.dataset.mhp];
            if (!t) return;
            t.hp = Math.max(0, Math.min(t.hpM, t.hp + Number(b.dataset.n)));
            if (t.hp <= 0) mlog('☠️ ' + t.n + ' derrotado!');
            // sync hero HP to character sheet if matching
            syncHeroToSheet(t);
            buildMap();
          });
        });
      }

      function syncHeroToSheet(t) {
        if (t.side !== 'heroi') return;
        var cn = val('codinome') || val('nome');
        if (t.n === cn || t.n === val('nome') || t.n === val('codinome')) {
          $('hpA').textContent = t.hp;
          updBars();
        }
      }

      function buildMap() {
        mapSize = +val('mapSize') || 8;
        var px = cellPx();
        var grid = $('mapGrid');
        if (!grid) return;
        grid.style.gridTemplateColumns = 'repeat(' + mapSize + ',' + px + 'px)';
        grid.innerHTML = '';
        if (mapData.length !== mapSize) {
          mapData = [];
          for (var r = 0; r < mapSize; r++) {
            mapData[r] = [];
            for (var c = 0; c < mapSize; c++) mapData[r][c] = null;
          }
        }
        var useLg = mapSize <= 12;
        for (var r = 0; r < mapSize; r++) {
          for (var c = 0; c < mapSize; c++) {
            var cell = document.createElement('div');
            cell.className = 'mcell' + (useLg ? ' lg' : '');
            cell.style.width = px + 'px';
            cell.style.height = px + 'px';
            var key = r + ',' + c;
            if (mapData[r] && mapData[r][c] === 'wall') cell.classList.add('wall');
            if (mapData[r] && mapData[r][c] === 'cover') cell.classList.add('cover');
            if (mapTok[key]) {
              var t = mapTok[key];
              var dead = t.hp !== undefined && t.hp <= 0;
              cell.innerHTML = (dead ? '💀' : (t.e || '👤')) +
                (px >= 28 ? '<span class="tok-label">' + (t.n || '').slice(0, 4) + '</span>' : '');
              cell.title = t.n + ' | PV ' + (t.hp !== undefined ? t.hp + '/' + t.hpM : '—') + ' | CA ' + (t.ca || '—');
              if (key === mapAtkKey) cell.style.outline = '2px solid #2ecc71';
              if (key === mapTgtKey) cell.style.outline = '2px solid #e74c3c';
              if (dead) cell.style.opacity = '0.55';
            }
            if (r === selR && c === selC) cell.classList.add('sel');
            (function (rr, cc) {
              cell.addEventListener('click', function () { clickCell(rr, cc); });
            })(r, c);
            grid.appendChild(cell);
          }
        }
        if ($('mapN')) $('mapN').textContent = Object.keys(mapTok).length;
        renderMapCombatants();
        updateMapCombatUI();
      }

      function placeToken(r, c, name, emoji, side, hp, ca, pod, extra) {
        Object.keys(mapTok).forEach(function (k) {
          if (mapTok[k].n === name) delete mapTok[k];
        });
        var hpM = hp || 25;
        mapTok[r + ',' + c] = Object.assign({
          n: name,
          e: emoji,
          side: side || 'outro',
          hp: hpM,
          hpM: hpM,
          ca: ca || 12,
          pod: pod || 3
        }, extra || {});
        if (mapData[r]) mapData[r][c] = null;
      }

      function clickCell(r, c) {
        selR = r; selC = c;
        if ($('selCell')) $('selCell').textContent = r + ',' + c;
        var key = r + ',' + c;
        var custom = (val('mapTokenName') || '').trim();

        // —— Movimento durante o turno de combate ——
        if (mapMoveModeActive && mapIniOrder.length) {
          var actorKey = mapIniOrder[mapIniIdx].key;
          var actor = mapTok[actorKey];
          if (!actor) { mapMoveModeActive = false; buildMap(); return; }
          if (mapTok[key] || (mapData[r] && mapData[r][c] === 'wall')) {
            mlog('⚠️ Célula bloqueada');
            buildMap();
            return;
          }
          var ap = actorKey.split(',').map(Number);
          var dist = Math.abs(ap[0] - r) + Math.abs(ap[1] - c);
          if (dist === 0) { buildMap(); return; }
          if (dist > mapMoveBudget) {
            mlog('⚠️ Longe demais (máx ' + mapMoveBudget + ', tentou ' + dist + ')');
            buildMap();
            return;
          }
          delete mapTok[actorKey];
          mapTok[key] = actor;
          if (mapAtkKey === actorKey) mapAtkKey = key;
          if (mapTgtKey === actorKey) mapTgtKey = key;
          mapIniOrder[mapIniIdx].key = key;
          mapMoveModeActive = false;
          mapMoveBudget = 0;
          mlog('🚶 ' + actor.n + ' moveu ' + dist + ' célula(s) para ' + key);
          buildMap();
          return;
        }

        // —— MOVER token ou obstáculo (modo edição) ——
        if (mapMode === 'move') {
          if (!mapMoveFrom) {
            // pegar token ou cobertura/parede
            if (mapTok[key]) {
              mapMoveFrom = { type: 'token', key: key };
              mlog('🚶 Segurando ' + mapTok[key].n + ' — clique na célula de destino');
            } else if (mapData[r] && mapData[r][c]) {
              mapMoveFrom = { type: 'tile', r: r, c: c, tile: mapData[r][c] };
              mlog('🚶 Segurando ' + mapData[r][c] + ' — clique na célula de destino');
            } else {
              mlog('⚠️ Clique em um token ou obstáculo para mover');
            }
          } else {
            // soltar
            if (mapMoveFrom.type === 'token') {
              var tok = mapTok[mapMoveFrom.key];
              if (tok && !mapTok[key] && !(mapData[r] && mapData[r][c] === 'wall')) {
                delete mapTok[mapMoveFrom.key];
                mapTok[key] = tok;
                // atualiza refs de combate
                if (mapAtkKey === mapMoveFrom.key) mapAtkKey = key;
                if (mapTgtKey === mapMoveFrom.key) mapTgtKey = key;
                mlog('✅ ' + tok.n + ' movido para ' + key);
              } else {
                mlog('⚠️ Célula ocupada ou inválida');
              }
            } else if (mapMoveFrom.type === 'tile') {
              if (!(mapData[r] && mapData[r][c]) && !mapTok[key]) {
                mapData[mapMoveFrom.r][mapMoveFrom.c] = null;
                mapData[r][c] = mapMoveFrom.tile;
                mlog('✅ Obstáculo movido para ' + key);
              } else {
                mlog('⚠️ Célula ocupada');
              }
            }
            mapMoveFrom = null;
          }
          buildMap();
          return;
        }

        if (mapMode === 'wall') {
          if (mapTok[key]) { mlog('⚠️ Remova o token antes'); buildMap(); return; }
          mapData[r][c] = mapData[r][c] === 'wall' ? null : 'wall';
        } else if (mapMode === 'cover') {
          if (mapTok[key]) { mlog('⚠️ Remova o token antes'); buildMap(); return; }
          mapData[r][c] = mapData[r][c] === 'cover' ? null : 'cover';
        } else if (mapMode === 'clear') {
          mapData[r][c] = null;
          delete mapTok[key];
          if (mapAtkKey === key) mapAtkKey = null;
          if (mapTgtKey === key) mapTgtKey = null;
        } else if (mapMode === 'char') {
          if (mapTok[key]) {
            if (!mapAtkKey || mapAtkKey === key) mapAtkKey = key;
            else mapTgtKey = key;
          } else {
            if (mapData[r] && mapData[r][c] === 'wall') { mlog('⚠️ Parede bloqueia'); buildMap(); return; }
            var hi = val('mapHeroSelect');
            if (hi === '' || hi === null) {
              mlog('⚠️ Escolha uma ficha salva no seletor');
              buildMap();
              return;
            }
            var ch = chars[+hi];
            if (!ch) { mlog('⚠️ Ficha inválida'); buildMap(); return; }
            var name = ch.codinome || ch.nome || 'Herói';
            var hp = ch.hpA || ch.hpM || 30;
            var ca = 10 + mod(ch.sAgi || 10) + Math.floor((ch.aTec || 3) / 2);
            placeToken(r, c, name, '🦸', 'heroi', hp, Math.max(10, ca), ch.aPod || 3, {
              charIdx: +hi, qNome: ch.qNome, qCusto: ch.qCusto, qLv: ch.qLv,
              sFor: ch.sFor, sAgi: ch.sAgi, sCon: ch.sCon, aPod: ch.aPod,
              aVel: ch.aVel || 3, abs: ch.abs || [], lv: ch.lv || 1,
              qDmg: ch.qDmg || '', qAlcanceNum: ch.qAlcanceNum || 1
            });
            mlog('🦸 ' + name + ' entrou no mapa (PV ' + hp + ')');
          }
        } else if (mapMode === 'npc') {
          if (mapTok[key]) {
            if (!mapAtkKey || mapAtkKey === key) mapAtkKey = key;
            else mapTgtKey = key;
          } else {
            if (mapData[r] && mapData[r][c] === 'wall') { mlog('⚠️ Parede bloqueia'); buildMap(); return; }
            var name = custom || ('Herói NPC ' + (Object.keys(mapTok).filter(function (k) { return mapTok[k].side === 'heroi'; }).length + 1));
            var hp = +val('mapTokenHP') || 35;
            var ca = +val('mapTokenCA') || 14;
            var pod = +val('mapTokenPod') || 4;
            placeToken(r, c, name, '🛡️', 'heroi', hp, ca, pod, { isNpc: true });
            mlog('🛡️ NPC Herói ' + name + ' colocado');
          }
        } else if (mapMode === 'vilao') {
          if (mapTok[key]) {
            if (!mapAtkKey || mapAtkKey === key) mapAtkKey = key;
            else mapTgtKey = key;
          } else {
            if (mapData[r] && mapData[r][c] === 'wall') { mlog('⚠️ Parede bloqueia'); buildMap(); return; }
            var name = custom || ('Vilão ' + (Object.keys(mapTok).filter(function (k) { return mapTok[k].side === 'vilao'; }).length + 1));
            var hp = +val('mapTokenHP') || 25;
            var ca = +val('mapTokenCA') || 13;
            var pod = +val('mapTokenPod') || 3;
            placeToken(r, c, name, '👾', 'vilao', hp, ca, pod);
            mlog('👾 ' + name + ' colocado');
          }
        } else {
          // seleção de combate
          if (mapTok[key]) {
            if (!mapAtkKey) mapAtkKey = key;
            else if (mapAtkKey === key) mapAtkKey = null;
            else mapTgtKey = key;
          }
        }
        buildMap();
      }

      function mapDoAtk(tipo) {
        if (!mapAtkKey || !mapTok[mapAtkKey]) { mlog('⚠️ Selecione um atacante no mapa'); return; }
        if (!mapTgtKey || !mapTok[mapTgtKey]) { mlog('⚠️ Selecione um alvo no mapa'); return; }
        var atk = mapTok[mapAtkKey];
        var tgt = mapTok[mapTgtKey];
        if (atk.hp <= 0) { mlog('⚠️ Atacante já está derrotado'); return; }
        if (tgt.hp <= 0) { mlog('⚠️ Alvo já está derrotado'); return; }

        // stats do atacante (ficha salva / token)
        var poder = atk.aPod || atk.pod || 3;
        var con = mod(atk.sCon || 12);
        var forca = mod(atk.sFor || 12);
        var agi = mod(atk.sAgi || 12);
        var qLv = atk.qLv || 1;
        var qCusto = atk.qCusto || 2;
        // se for a ficha ativa na tela, usa valores ao vivo
        var cn = val('codinome') || val('nome');
        var isActiveSheet = (atk.n === cn || atk.n === val('nome') || atk.n === val('codinome'));
        if (isActiveSheet) {
          poder = +val('aPod') || poder;
          con = mod(+val('sCon') || 10);
          forca = mod(+val('sFor') || 10);
          agi = mod(+val('sAgi') || 10);
          qLv = +val('qLv') || 1;
          qCusto = +val('qCusto') || 2;
        }

        var modAtk = Math.max(forca, agi);
        var dmgDice = 1, dmgSides = 6, dmgBonus = poder, custo = 0, nome = 'Básico', vant = false;

        if (tipo === 'esp') {
          custo = 3; dmgDice = 2; dmgSides = 6; dmgBonus = poder; nome = 'Especial';
        } else if (tipo === 'quirk') {
          custo = qCusto;
          modAtk = con + Math.floor(qLv / 2);
          dmgDice = 1; dmgSides = 8; dmgBonus = con + Math.floor(poder / 2);
          nome = atk.qNome || (isActiveSheet ? (val('qNome') || 'Quirk') : 'Quirk');
        } else if (tipo === 'plus') {
          custo = 5; vant = true; dmgDice = 2; dmgSides = 8; dmgBonus = poder; nome = 'PLUS ULTRA';
        }

        if (custo > 0 && isActiveSheet) {
          var qkA = +txt('qkA');
          if (qkA < custo) { mlog('⚠️ Energia de Quirk insuficiente!'); return; }
          $('qkA').textContent = qkA - custo;
          updBars();
        }

        // Cobertura do alvo: +2 CA e −2 dano
        var tp = mapTgtKey.split(',');
        var tr = +tp[0], tc = +tp[1];
        var cover = hasCoverAt(tr, tc);
        var ca = (tgt.ca || 12) + (cover ? 2 : 0);

        var r1 = rnd(20), r2 = vant ? rnd(20) : 0;
        var roll = vant ? Math.max(r1, r2) : r1;
        var total = roll + modAtk;
        var crit = roll === 20, falha = roll === 1;
        var res = $('mapAtkRes');
        if (res) res.classList.remove('hid', 'hit', 'miss', 'crit');

        var msg = '', dmg = 0;
        if (falha) {
          if (res) res.classList.add('miss');
          msg = '❌ FALHA CRÍTICA: ' + atk.n + ' errou ' + tgt.n;
          mlog(msg);
        } else if (total >= ca || crit) {
          for (var i = 0; i < dmgDice; i++) dmg += rnd(dmgSides);
          dmg += dmgBonus;
          if (crit) dmg *= 2;
          if (cover) dmg = Math.max(0, dmg - 2);
          tgt.hp = Math.max(0, tgt.hp - dmg);
          if (res) res.classList.add(crit ? 'crit' : 'hit');
          msg = (crit ? '💥 CRÍTICO! ' : '✅ ') + atk.n + ' → ' + tgt.n + ' | ' + total + ' vs CA ' + ca +
            (cover ? ' (cobertura +2)' : '') + ' | Dano ' + dmg + (cover ? ' (−2 cob.)' : '') +
            ' | PV alvo: ' + tgt.hp + '/' + tgt.hpM;
          mlog(msg + (custo ? ' (−' + custo + ' energia)' : ''));
          if (tgt.hp <= 0) mlog('☠️ ' + tgt.n + ' derrotado!');
          syncHeroToSheet(tgt);
          enemies.forEach(function (e) {
            if (e.nome.toLowerCase() === tgt.n.toLowerCase()) e.pv = tgt.hp;
          });
          if (typeof rendEn === 'function') rendEn();
        } else {
          if (res) res.classList.add('miss');
          msg = '❌ ' + atk.n + ' errou ' + tgt.n + ' | ' + total + ' vs CA ' + ca + (cover ? ' (cobertura)' : '');
          mlog(msg);
        }
        if (res) res.textContent = msg;
        buildMap();
      }

      if ($('mmChar')) {
        $('mmChar').addEventListener('click', function () { fillHeroSelect(); setMapMode('char', 'Herói (ficha)'); });
        if ($('mmNpc')) $('mmNpc').addEventListener('click', function () { setMapMode('npc', 'NPC Herói'); });
        if ($('mmVil')) $('mmVil').addEventListener('click', function () { setMapMode('vilao', 'Vilão'); });
        if ($('mmMove')) $('mmMove').addEventListener('click', function () { mapMoveFrom = null; setMapMode('move', 'Mover'); });
        $('mmWall').addEventListener('click', function () { setMapMode('wall', 'Parede'); });
        $('mmCover').addEventListener('click', function () { setMapMode('cover', 'Cobertura'); });
        $('mmClear').addEventListener('click', function () { setMapMode('clear', 'Limpar'); });
        $('mmReset').addEventListener('click', function () {
          mapData = []; mapTok = {}; selR = -1; selC = -1;
          mapAtkKey = null; mapTgtKey = null; mapMoveFrom = null;
          buildMap();
        });
        $('mapSize').addEventListener('change', function () {
          mapData = [];
          var ns = +val('mapSize') || 8;
          Object.keys(mapTok).forEach(function (k) {
            var p = k.split(',');
            if (+p[0] >= ns || +p[1] >= ns) delete mapTok[k];
          });
          buildMap();
        });
        if ($('mapClrLog')) $('mapClrLog').addEventListener('click', function () { if ($('mapLog')) $('mapLog').innerHTML = ''; });
        if ($('mapNextTurn')) $('mapNextTurn').addEventListener('click', function () { nextMapTurn(); });
        if ($('mapRollIni')) $('mapRollIni').addEventListener('click', function () { rollMapInitiative(); });
        if ($('mapActEnd')) $('mapActEnd').addEventListener('click', function () {
          mlog('✓ ' + (mapIniOrder[mapIniIdx] ? mapIniOrder[mapIniIdx].name : '?') + ' encerrou o turno');
          nextMapTurn();
        });

        // Menu estilo Pokémon
        function needTurn() {
          if (!mapIniOrder.length) { mlog('⚠️ Role a iniciativa primeiro'); return false; }
          return true;
        }
        if ($('pokeFight')) $('pokeFight').addEventListener('click', function () {
          if (!needTurn()) return;
          renderMapAbilities();
          showPokeMenu('pokeMenuFight');
        });
        if ($('pokeMove')) $('pokeMove').addEventListener('click', function () {
          if (!needTurn()) return;
          var actor = mapTok[mapIniOrder[mapIniIdx].key];
          if (!actor) return;
          if (!spendActions(1)) return;
          mapMoveModeActive = true;
          mapMoveBudget = getMoveSpeed(actor);
          mlog('🚶 ' + actor.n + ' — clique no destino (até ' + mapMoveBudget + ' células)');
          showPokeMenu('pokeMenuMain');
        });
        if ($('pokeItem')) $('pokeItem').addEventListener('click', function () {
          if (!needTurn()) return;
          showPokeMenu('pokeMenuItem');
        });
        if ($('pokeRun')) $('pokeRun').addEventListener('click', function () {
          if (!needTurn()) return;
          showPokeMenu('pokeMenuRun');
        });
        ['pokeBack1', 'pokeBack2', 'pokeBack3'].forEach(function (id) {
          if ($(id)) $(id).addEventListener('click', function () { showPokeMenu('pokeMenuMain'); });
        });
        if ($('pokeRunYes')) $('pokeRunYes').addEventListener('click', function () {
          if (!mapIniOrder.length) return;
          var k = mapIniOrder[mapIniIdx].key;
          var t = mapTok[k];
          if (t) {
            mlog('🏳️ ' + t.n + ' desistiu do combate');
            t.hp = 0;
          }
          showPokeMenu('pokeMenuMain');
          nextMapTurn();
        });
        if ($('itemHeal')) $('itemHeal').addEventListener('click', function () {
          if (!needTurn()) return;
          var k = mapIniOrder[mapIniIdx].key;
          var t = mapTok[k];
          if (!t) return;
          if (!spendActions(1)) return;
          t.hp = Math.min(t.hpM, t.hp + 15);
          mlog('🧪 ' + t.n + ' usou kit médico (+15 PV → ' + t.hp + '/' + t.hpM + ')');
          syncHeroToSheet(t);
          showPokeMenu('pokeMenuMain');
          buildMap();
        });
        if ($('itemEnergy')) $('itemEnergy').addEventListener('click', function () {
          if (!needTurn()) return;
          if (!spendActions(1)) return;
          var qk = +txt('qkA') || 0;
          var qkM = +txt('qkM') || 15;
          $('qkA').textContent = Math.min(qkM, qk + 5);
          updBars();
          mlog('⚡ Estimulante: +5 Energia de Quirk');
          showPokeMenu('pokeMenuMain');
        });
        if ($('itemSmoke')) $('itemSmoke').addEventListener('click', function () {
          if (!needTurn()) return;
          var k = mapIniOrder[mapIniIdx].key;
          var t = mapTok[k];
          if (!t) return;
          if (!spendActions(1)) return;
          t.ca = (t.ca || 12) + 2;
          t._smoke = true;
          mlog('💨 ' + t.n + ' usou cortina de fumaça (CA agora ' + t.ca + ')');
          showPokeMenu('pokeMenuMain');
          buildMap();
        });
      }

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

      // ===== CALENDÁRIO =====
      let events = JSON.parse(localStorage.getItem('mha5_ev') || '[]');
      let calYear = new Date().getFullYear();
      let calMonth = new Date().getMonth(); // 0-11
      let selDate = null; // YYYY-MM-DD
      let selEvId = null;
      const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

      function saveEvents() {
        localStorage.setItem('mha5_ev', JSON.stringify(events));
      }
      function pad(n) { return n < 10 ? '0' + n : '' + n; }
      function dateKey(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

      function renderCal() {
        var title = $('calTitle');
        if (!title) return;
        title.textContent = meses[calMonth] + ' ' + calYear;
        var grid = $('calGrid');
        grid.innerHTML = '';
        var first = new Date(calYear, calMonth, 1);
        var startDay = first.getDay();
        var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        var prevDays = new Date(calYear, calMonth, 0).getDate();
        var today = new Date();
        var todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

        for (var i = startDay - 1; i >= 0; i--) {
          var d = prevDays - i;
          var cell = document.createElement('div');
          cell.className = 'cal-day other';
          cell.innerHTML = '<div class="num">' + d + '</div>';
          grid.appendChild(cell);
        }
        for (var d = 1; d <= daysInMonth; d++) {
          var key = dateKey(calYear, calMonth, d);
          var cell = document.createElement('div');
          cell.className = 'cal-day';
          if (key === todayKey) cell.classList.add('today');
          if (key === selDate) cell.classList.add('sel');
          var html = '<div class="num">' + d + '</div><div class="dots">';
          var dayEvs = events.filter(function (e) { return e.date === key; });
          var seen = {};
          dayEvs.forEach(function (e) {
            if (!seen[e.tipo]) {
              html += '<span class="cal-dot ' + e.tipo + '"></span>';
              seen[e.tipo] = true;
            }
          });
          html += '</div>';
          cell.innerHTML = html;
          (function (k) {
            cell.addEventListener('click', function () { selectDay(k); });
          })(key);
          grid.appendChild(cell);
        }
        var totalCells = startDay + daysInMonth;
        var remaining = (7 - (totalCells % 7)) % 7;
        for (var i = 1; i <= remaining; i++) {
          var cell = document.createElement('div');
          cell.className = 'cal-day other';
          cell.innerHTML = '<div class="num">' + i + '</div>';
          grid.appendChild(cell);
        }
        renderEvList();
      }

      function selectDay(key) {
        selDate = key;
        selEvId = null;
        set('evDate', key);
        set('evTit', '');
        set('evDesc', '');
        set('evTipo', 'missao');
        if ($('calSelDay')) $('calSelDay').textContent = 'Dia selecionado: ' + key;
        renderCal();
      }

      function renderEvList() {
        var el = $('evList');
        if (!el) return;
        el.innerHTML = '';
        var sorted = events.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
        if (!sorted.length) {
          el.innerHTML = '<p style="color:var(--m);font-size:.84rem">Nenhum evento cadastrado.</p>';
          return;
        }
        var today = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        var upcoming = sorted.filter(function (e) { return e.date >= today; });
        var past = sorted.filter(function (e) { return e.date < today; }).reverse();
        function addItems(list, label) {
          if (!list.length) return;
          var h = document.createElement('div');
          h.style.cssText = 'font-size:.75rem;color:var(--m);margin:.4rem 0 .2rem;font-weight:700';
          h.textContent = label;
          el.appendChild(h);
          list.forEach(function (e) {
            var d = document.createElement('div');
            d.className = 'ev-item ' + e.tipo;
            d.innerHTML = '<strong>' + e.tit + '</strong><div class="ev-date">' + e.date + ' · ' + e.tipo + '</div>' +
              (e.desc ? '<div style="font-size:.78rem;color:var(--m);margin-top:.15rem">' + e.desc + '</div>' : '');
            d.addEventListener('click', function () {
              selEvId = e.id;
              selDate = e.date;
              set('evTit', e.tit);
              set('evDate', e.date);
              set('evTipo', e.tipo);
              set('evDesc', e.desc || '');
              if ($('calSelDay')) $('calSelDay').textContent = 'Editando: ' + e.tit;
              var parts = e.date.split('-');
              calYear = +parts[0];
              calMonth = +parts[1] - 1;
              renderCal();
            });
            el.appendChild(d);
          });
        }
        addItems(upcoming, 'Próximos');
        addItems(past, 'Passados');
      }

      if ($('calPrev')) {
        $('calPrev').addEventListener('click', function () {
          calMonth--;
          if (calMonth < 0) { calMonth = 11; calYear--; }
          renderCal();
        });
        $('calNext').addEventListener('click', function () {
          calMonth++;
          if (calMonth > 11) { calMonth = 0; calYear++; }
          renderCal();
        });
        $('btnAddEv').addEventListener('click', function () {
          var tit = val('evTit').trim();
          var date = val('evDate');
          if (!tit) { alert('Digite um título'); return; }
          if (!date) { alert('Escolha uma data'); return; }
          if (selEvId) {
            var ev = events.find(function (e) { return e.id === selEvId; });
            if (ev) {
              ev.tit = tit; ev.date = date; ev.tipo = val('evTipo'); ev.desc = val('evDesc');
            }
          } else {
            events.push({ id: Date.now(), tit: tit, date: date, tipo: val('evTipo'), desc: val('evDesc') });
          }
          saveEvents();
          selEvId = null;
          set('evTit', ''); set('evDesc', '');
          var parts = date.split('-');
          calYear = +parts[0];
          calMonth = +parts[1] - 1;
          selDate = date;
          renderCal();
          alert('Evento salvo!');
        });
        $('btnDelEv').addEventListener('click', function () {
          if (!selEvId) { alert('Selecione um evento na lista para excluir'); return; }
          if (!confirm('Excluir este evento?')) return;
          events = events.filter(function (e) { return e.id !== selEvId; });
          saveEvents();
          selEvId = null;
          set('evTit', ''); set('evDesc', '');
          renderCal();
        });
      }

      document.querySelectorAll('.tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          if (tab.dataset.p === 'calendario') renderCal();
        });
      });

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
        load({ nome: '', codinome: '', idade: 15, genero: 'Masculino', lado: 'Estudante U.A. (Herói)', ranking: '', lv: 1, xp: 0, hpA: 30, hpM: 30, stA: 20, stM: 20, qkA: 15, qkM: 15, aPod: 3, aVel: 3, aTec: 3, aInt: 3, aCoo: 3, sFor: 10, sAgi: 10, sRes: 10, sInt: 10, sCar: 10, sCon: 10, qNome: '', qTipo: 'Emitter', qComp: 'simples', qDesc: '', qMec: '', qLim: '', qCusto: 2, qLv: 1, qXP: 0, qAlc: '', qDur: '', qDmg: '', qAlcanceNum: 1, abs: [], inv: '', notas: '', rel: '', rankP: 'C', rankPts: 0 });
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
      // calendário renderiza ao abrir a aba

    })();
