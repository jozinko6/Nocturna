# Obsahová príručka — Nocturna

## 1. Prehľad

Táto príručka definuje štandardy pre písanie obsahu v Nocturne: názvoslovie, lore texty, šablóny, item texty, frakčné a regionálne popisy.

---

## 2. Názvoslovie

### 2.1 Herné termíny

| Anglický termín | Slovenský ekvivalent | Použitie |
|---|---|---|
| HP | Životy / HP | Zdravie postavy |
| XP | Skúsenosti / XP | Skúsenostné body |
| Gold | Zlato / Gold | Základná mena |
| Crystals | Nočné kryštály | Premium mena |
| Level | Úroveň | Level postavy |
| Strength | Sila | Atribút |
| Dexterity | Obratnosť | Atribút |
| Endurance | Vytrvalosť | Atribút |
| Perception | Vnímanie | Atribút |
| Willpower | Vôľa | Atribút |
| Luck | Šťastie | Atribút |
| Equipment | Vybavenie | Predmety na postave |
| Inventory | Inventár | Zoznam predmetov |
| Expedition | Výprava | PvE misia |
| Arena | Aréna | PvP súboj |
| Hideout | Úkryt | Osobný priestor hráča |
| Merchant | Obchodník | NPC predajca |
| Quest | Úloha | Denná misia |
| Cooldown | Čakanie | Časové obmedzenie |
| Damage | Poškodenie | Úder |
| Critical | Kritický zásah | Silný úder |
| Dodge | Úhyb | Vyhnutie sa úderu |
| Block | Blok | Obrana pred úderom |
| Loot | Korisť | Odmena za boj |

### 2.2 Frakcie

| Názov | Titul | Príslušník |
|---|---|---|
| Sangvari | Krvavý kmeň | Sangvari bojovník |
| Lunari | Mesáčni strážcovia | Lunari strážca |

### 2.3 Rarity

| Rarity | Slovenský popis | Farba |
|---|---|---|
| Common | Bežný | Sivá |
| Uncommon | Neobvyklý | Zelená |
| Rare | Vzácny | Modrá |
| Epic | Epický | Fialová |
| Legendary | Legendárny | Oranžová |

---

## 3. Lore texty

### 3.1 Svet Nocturny

> Nocturna je svet večnej noci. Slnko zmizlo pred stovkami rokov a zostali len tiene, krv a mesačné svetlo. Dve frakcie bojujú o prežitie: Sangvari, ktorí veria v silu krvi, a Lunari, ktorí hľadajú odpovede v mesačných tieňoch.

### 3.2 Tone of voice

- **Temný** — ale nie depresívny
- **Atmosférický** — ale nie prehnane poetický
- **Stručný** — krátky, výstižný text
- **Immersívny** — hráč sa cíti súčasťou sveta

### 3.3 Pravidlá

| Pravidlo | Príklad |
|---|---|
| Používaj slovenské názvy | "Sila" nie "Strength" |
| Aktívny čas | "Porazíš nepriateľa" nie "Nepriateľ je porazený" |
| Žiadne emojí | Text je čistý |
| Max 2 vety per popis | Krátke, výstižné |
| Žiadne moderné výrazy | Žiadne "OMG", "EPIC" |

---

## 4. Event textové šablóny

### 4.1 Výprava — Víťazstvo

```
V regióne {region} si porazil {enemyName} ({enemyLevel}).
Získal si {xp} skúseností, {gold} zlatých{items}.
```

**Príklad:**
> V regióne Čierny les si porazil Krvavého elementára (18). Získal si 85 skúseností, 62 zlatých a Železný meč.

### 4.2 Výprava — Prehra

```
V regióne {region} ťa porazil {enemyName} ({enemyLevel}).
Stratil si {energyLost} energie.
```

**Príklad:**
> V regióne Krypty Prvých ťa porazil Prvý strážca (28). Stratil si 20 energie.

### 4.3 PvP — Výhra

```
V aréne si porazil {opponentName} ({opponentLevel}).
Tvoj rating: {oldRating} → {newRating} (+{change}).
Získal si {xp} skúseností a {gold} zlatých.
```

### 4.4 PvP — Prehra

```
V aréne ťa porazil {opponentName} ({opponentLevel}).
Tvoj rating: {oldRating} → {newRating} ({change}).
Získal si {xp} skúseností.
```

### 4.5 Training

```
Natrénoval si atribút {attribute}.
{attribute}: {oldLevel} → {newLevel}.
Stálo ťa to {cost} zlatých a {energy} energie.
```

### 4.6 Level up

```
Dosiahol si {newLevel} úroveň!
Tvoje životy sa zvýšili o 5.
Všetky atribúty sa zvýšili o 1.
```

### 4.7 Denná odmena

```
Denná odmena (deň {day}):
{rewards}
```

### 4.8 Quest completion

```
Dokončil si úlohu "{questName}"!
Získal si {xp} skúseností a {gold} zlatých.
```

### 4.9 Item získaný

```
Získal si {itemName} ({rarity}).
{itemDescription}
```

---

## 5. Item texty

### 5.1 Zbraň

```
{WeaponName}
{Rarity} zbraň
Poškodenie: {damage}
Požadovaná úroveň: {levelReq}
{loreText}
```

**Príklad:**
```
Železný meč
Bežná zbraň
Poškodenie: 10
Požadovaná úroveň: 1
Jednoduchý, ale spoľahlivý meč. Sangvari ho používajú na tréning.
```

### 5.2 Brnenie

```
{ArmorName}
{Rarity} brnenie
Obrana: {defense}
Požadovaná úroveň: {levelReq}
{loreText}
```

### 5.3 Accessory

```
{AccessoryName}
{Rarity} doplnok
Bonus: {statBonus}
Požadovaná úroveň: {levelReq}
{loreText}
```

### 5.4 Consumable

```
{ConsumableName}
{Rarity} spotrebiteľný
Efekt: {effect}
{loreText}
```

### 5.5 Lore texty itemov

| Item | Lore |
|---|---|
| Železný meč | "Jednoduchý, ale spoľahlivý. Sangvari ho používajú na tréning." |
| Krvavá sekerа | "Jej čepeľ je navždy zafarbená krvou. Hovorí sa, že pila z tisícov nepriateľov." |
| Mesačný amulet | "Lunari ho nosia ako symbol svojej oddanosti mesačnému svetlu." |
| Tieňový plášť | "Umožňuje nositeľovi splynúť s tieňmi. Kto ho nosí, zmizne v tme." |
| Prastarý prsteň | "Patril prvému obyvateľovi Nocturny. Jeho moc je stále živá." |

---

## 6. Frakčné popisy

### 6.1 Sangvari

```
Sangvari — Krvavý kmeň

Sangvari sú bojovníci, ktorí veria, že krv je zdrojom všetkej moci. Ich rituály 
sú brutálne, ale účinné. Nosia červené runy a bojujú zblízka s sekerami a mečmi.

V regióne Čierny les získavajú +10 % poškodenia.

Štartovné bonusy: +2 Sila, +1 Vytrvalosť.
```

### 6.2 Lunari

```
Lunari — Mesáčni strážcovia

Lunari sú tajomný rád, ktorý čerpá silu z mesačného svetla. Sú to vizionári 
a stratégovia, ktorí preferujú taktický prístup pred hrubou silou.

V regióne Mesačné vrchy získavajú +10 % skúseností.

Štartovné bonusy: +2 Vnímanie, +1 Vôľa.
```

---

## 7. Regionálne popisy

### 7.1 Mesto bez svitania

```
Mesto bez svitania

Zničené mesto, kde sa potulujú tieňové stvorenía. Prvá línia obrany 
pred temnotou. Sangvari sem vysielajú svojich nováčikov, aby si otestovali 
svoje sily.

Level: 1–15
Nepriateľia: Tieňový potulník, Krvavý vlk, Prízrak minulosti
```

### 7.2 Čierny les

```
Čierny les

Staroveký les, kde svetlo nikdy neprenikne. Sangvari tu kedysi viedli 
svoje krvavé rituály. Teraz ho obývajú nebezpečné lesné duchy a elementáre.

Level: 10–30
Nepriateľia: Lesný duch, Krvavý elementár, Čierny lovec
Frakčný bonus: Sangvari +10 % damage
```

### 7.3 Krypty Prvých

```
Krypty Prvých

Hrobky prvých obyvateľov tohto sveta. Ich moc je stále živá a nebezpečná. 
V tmavých chodbách sa skrývajú prastaré stvorenia, ktoré chránia tajomstvá 
minulosti.

Level: 25–45
Nepriateľia: Prvý strážca, Kostný mág, Prastarý drak
```

### 7.4 Mesačné vrchy

```
Mesačné vrchy

Vrchy osvietené mesačným svetlom, kde Lunari kedysi budovali svoje 
observatóriá. Vrcholky sú domovom mesačných golemov a démonov, 
ktorí bránia prístup k prastarým tajomstvám.

Level: 40–50
Nepriateľia: Mesačný golem, Strážca vrchov, Mesáčny démon
Frakčný bonus: Lunari +10 % XP
```

---

## 8. Enemy popisy

| Nepriateľ | Popis |
|---|---|
| Tieňový potulník | Tmavá silueta, ktorá sa plíži v tieni. Slabý, ale nebezpečný v húfoch. |
| Krvavý vlk | Vlk zmenený krvavými rituálmi. Rýchly a obratný. |
| Prízrak minulosti | Duch dávno mŕtveho bojovníka. Jeho magický úder preniká brnením. |
| Lesný duch | Duch stromu, ktorý stratil svoju podobu. Môže tišať kúzla. |
| Krvavý elementár | Elementár z krvavej many. Regeneruje sa počas boja. |
| Čierny lovec | Temný lovec, ktorý stráži les. Jeho údery sú smrteľne presné. |
| Prvý strážca | Prastarý rytier, ktorý bráni krypty. Tvrdý ako kameň. |
| Kostný mág | Mŕtvy mág, ktorý ovláda kosti. Útočí z diaľky a oslabuje nepriateľov. |
| Prastarý drak | Drak, ktorý spí v hlbinách krypt. Jeho prebudenie znamená skazu. |
| Mesačný golem | Golem z mesačného kameňa. Odolný voči magii. |
| Strážca vrchov | Obor, ktorý stráži prístup na vrcholy. Silný a vytrvalý. |
| Mesáčny démon | Démon z mesačných tieňov. Mení fázy a vysáva život. |

---

## 9. UI texty

### 9.1 Tlačidlá

| Akcia | Text |
|---|---|
| Start expedition | Začať výpravu |
| Attack | Útočiť |
| Defend | Brániť sa |
| Flee | Ujsť |
| Buy | Kúpiť |
| Sell | Predať |
| Equip | Vybaviť |
| Unequip | Zložiť |
| Train | Natrénuj |
| Upgrade | Vylepšiť |
| Claim | Vybrať odmenu |
| PvP | Aréna |
| Back | Späť |

### 9.2 Chybové hlášky

| Chyba | Text |
|---|---|
| Insufficient gold | Nemáš dostatok zlatých. |
| Insufficient energy | Nemáš dostatok energie. |
| Level too low | Nemáš požadovanú úroveň. |
| Inventory full | Inventár je plný. |
| Already equipped | Tento slot je už obsadený. |
| Daily limit | Denný limit dosiahnutý. |
| Cooldown active | Musíš počkať {time}. |

### 9.3 Success hlášky

| Akcia | Text |
|---|---|
| Level up | Dosiahol si {level} úroveň! |
| Item equipped | {item} bol vybavený. |
| Training complete | Tréning dokončený! {attribute} +1. |
| Quest complete | Úloha "{quest}" dokončená! |
| Daily reward | Denná odmena vybraná! |
