---
title: Installazione e configurazione server DNS (Parte 5) - Configurazione Pi-Hole (IT)
description: Imposta un robusto e sicuro server DNS utilizzando Ubuntu, Pi-Hole e Unbound, offrendo un miglioramento della privacy e un maggiore controllo sul traffico della tua rete.
date: 2022-12-31 14:00:00 +0100
last_modified_at: 2024-08-07 16:30:09 +0200
lang: it
ogimg: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_1.jpg
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

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.jpg" title="Pi-Hole Web Interface 2" %}

Verrà chiesta la password di Pi-Hole per l'interfaccia web. Inserirla e cliccare `Login` per confermare ed entrare.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_3.jpg" title="Pi-Hole Web Interface 3" %}

La seguente schermata è quella prima di fare il login. La differenza è che ora c’è la possibilità di configurare Pi-Hole.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_4.jpg" title="Pi-Hole Web Interface 4" %}

Cliccare nel menù a sinistra alla voce `Settings`. 

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_5.jpg" title="Pi-Hole Web Interface 5" %}

Cliccare `DNS` dalle voci presenti in alto.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_6.jpg" title="Pi-Hole Web Interface 6" %}

Dal blocco intitolato `Upstream DNS Servers` a sinistra deselezionare qualsiasi spunta presente. In quello omonimo di destra, invece, selezionare `Custom 1 (IPv4)` e inserire `127.0.0.1#5353` che sono l'interfaccia e la porta che erano state precedentemente inserite nel file di configurazione di Unbound. Questo farà di che Pi-Hole chiede ad Unbound la risoluzione dns al posto di utilizzare un server esterno alla rete.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_7.jpg" title="Pi-Hole Web Interface 7" %}

Nel blocco intitolato `Interface settings`, cliccare la voce `Bind only to interface ...`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_8.jpg" title="Pi-Hole Web Interface 8" %}

Per salvare tutto ciò scrollare in giù con il mouse e cliccare `Save` presente in basso a destra nella schermata.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_9.jpg" title="Pi-Hole Web Interface 9" %}

### Backup impostazioni Pi-Hole

Per sicurezza scaricare l'attuale configurazione di Pi-Hole in modo tale che in caso di bisogno di ripristino delle impostazioni sia più veloce farlo da file.
Per fare ciò premere cliccare dal menù orizzontale presente in alto la voce `Teleporter`. Infine cliccare `Backup` e confermare il salvataggio del file.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_10.jpg" title="Pi-Hole Web Interface 10" %}

## Configurazione router

Ora dalle impostazioni del router (consultare il manuale del router per capire dove trovare l'impostazione) si può cambiare il DNS all'IP del computer dove è stato installato Ubuntu Server. Questo farà si che ogni dispositivo collegato in rete con DNS automatico farà richiesta di risoluzione al router che a sua volte replicherà i pacchetti al sistema filtrando gran parte della pubblicità dai siti web e anche contenuti pericolosi.
