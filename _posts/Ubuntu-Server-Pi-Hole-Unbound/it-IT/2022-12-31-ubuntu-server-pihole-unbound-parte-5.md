---
title: Installazione e configurazione server DNS (Parte 5) - Configurazione Pi-Hole (IT)
description: "Come configurare l'interfaccia web di Pi-Hole, gestire le blocklist e collegarlo a Unbound per completare il server DNS self-hosted orientato alla privacy."
short_url: pihole-guida-5
date: 2022-12-31 14:00:00 +0100
last_modified_at: 2026-02-03 19:00:00 +0100
lang: it
image: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.webp
topic: selfhosting
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
keywords:
  - interfaccia web pi-hole
  - configurazione pi-hole
  - configurazione server dns
  - configurazione pi-hole unbound
  - impostazioni dns router
  - configurazione dns rete
  - pannello admin pi-hole
---

*Nella [parte precedente]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-4 %}) è stato spiegato come installare Unbound.*

## Configurazione Pi-Hole da interfaccia web

Aprire il browser e inserire l'IP del computer dove è installato Ubuntu Server seguito da `/admin` come nella seguente figura. Quando ha caricato la pagina cliccare la voce `Login` presente nel menù verticale a sinistra.

![Interfaccia web Pi-Hole - pagina di login accessibile dal browser all'indirizzo IP del server seguito da /admin](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.webp)

Verrà chiesta la password di Pi-Hole per l'interfaccia web. Inserirla e cliccare `Login` per confermare ed entrare.

![Interfaccia web Pi-Hole - schermata di inserimento della password per il login di amministrazione](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_3.webp)

La seguente schermata è quella prima di fare il login. La differenza è che ora c’è la possibilità di configurare Pi-Hole.

![Interfaccia web Pi-Hole - dashboard dopo il login con le opzioni di configurazione disponibili](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_4.webp)

Cliccare nel menù a sinistra alla voce `Settings`. 

![Interfaccia web Pi-Hole - voce Settings evidenziata nel pannello di navigazione laterale sinistro](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_5.webp)

Cliccare `DNS` dalle voci presenti in alto.

![Interfaccia web Pi-Hole - scheda DNS selezionata nella pagina delle Impostazioni](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_6.webp)

Dal blocco intitolato `Upstream DNS Servers` a sinistra deselezionare qualsiasi spunta presente. In quello omonimo di destra, invece, selezionare `Custom 1 (IPv4)` e inserire `127.0.0.1#5353` che sono l'interfaccia e la porta che erano state precedentemente inserite nel file di configurazione di Unbound. Questo farà di che Pi-Hole chiede ad Unbound la risoluzione dns al posto di utilizzare un server esterno alla rete.

![Interfaccia web Pi-Hole - impostazioni DNS con Custom 1 (IPv4) configurato su 127.0.0.1#5353 (Unbound) come DNS upstream](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_7.webp)

Nel blocco intitolato `Interface settings`, cliccare la voce `Bind only to interface ...`.

![Interfaccia web Pi-Hole - impostazioni interfaccia con l'opzione "Bind only to interface" selezionata](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_8.webp)

Per salvare tutto ciò scrollare in giù con il mouse e cliccare `Save` presente in basso a destra nella schermata.

![Interfaccia web Pi-Hole - pulsante Save in basso a destra per confermare le modifiche alle impostazioni DNS](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_9.webp)

### Backup impostazioni Pi-Hole

Per sicurezza scaricare l'attuale configurazione di Pi-Hole in modo tale che in caso di bisogno di ripristino delle impostazioni sia più veloce farlo da file.
Per fare ciò premere cliccare dal menù orizzontale presente in alto la voce `Teleporter`. Infine cliccare `Backup` e confermare il salvataggio del file.

![Interfaccia web Pi-Hole - pagina Teleporter per il backup della configurazione corrente di Pi-Hole](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_10.webp)

## Configurazione router

Ora dalle impostazioni del router (consultare il manuale del router per capire dove trovare l'impostazione) si può cambiare il DNS all'IP del computer dove è stato installato Ubuntu Server. Questo farà si che ogni dispositivo collegato in rete con DNS automatico farà richiesta di risoluzione al router che a sua volte replicherà i pacchetti al sistema filtrando gran parte della pubblicità dai siti web e anche contenuti pericolosi.
