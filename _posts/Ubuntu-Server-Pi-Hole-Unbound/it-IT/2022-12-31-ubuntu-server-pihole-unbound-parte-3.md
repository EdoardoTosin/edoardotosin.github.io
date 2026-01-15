---
title: Installazione e configurazione server DNS (Parte 3) - Installazione Pi-Hole (IT)
description: Imposta un robusto e sicuro server DNS utilizzando Ubuntu, Pi-Hole e Unbound, offrendo un miglioramento della privacy e un maggiore controllo sul traffico della tua rete.
short_url: pihole-guida-3
date: 2022-12-31 12:00:00 +0100
last_modified_at: 2024-08-07 16:30:08 +0200
lang: it
ogimg: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.jpg
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
keywords:
  - installazione pi-hole ubuntu
  - blocco pubblicità dns
  - pi-hole ubuntu server
  - blocco ads rete
  - dns pi-hole installazione
  - configurazione pi-hole
  - server blocco pubblicità
---

*Nella [parte precedente]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-2 %}) è stato spiegato come aggiungere l'autenticazione a due fattori (2FA) per l'accesso via SSH.*

## Installazione Pi-Hole

In questa fase verrà installato Pi-Hole, un software open source che agisce come [DNS sinkhole](https://it.wikipedia.org/wiki/DNS_sinkhole) e volendo anche come server DHCP. Questa applicazione filtrerà le richieste DNS per ridurre drasticamente la pubblicità presente nelle pagine web.

### Download repository ufficiale

Come primo passo c'è da scaricare il repository di Pi-Hole: `git clone --depth 1 https://github.com/pi-hole/pi-hole.git Pi-hole`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_2.jpg" alt="Pi-Hole 2" %}

Alla fine del download entriamo all'interno della cartella: `cd 'Pi-hole/automated install/'`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_4.jpg" alt="Pi-Hole 4" %}

### Preparazione installazione Pi-Hole

Da questa directory lanciare lo script bash: `sudo bash basic-install.sh`.
È possibile che chieda la password utente poiché viene lanciato con i privilegi di amministratore.
In caso affermativo inserirla e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_6.jpg" alt="Pi-Hole 6" %}

Si attende qualche momento per il controllo che sia tutto compatibile e non ci siano conflitti.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.jpg" alt="Pi-Hole 7" %}

Premete `Invio` per ciascuna delle due schermate per iniziare la configurazione.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_8.jpg" alt="Pi-Hole 8" %}

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_9.jpg" alt="Pi-Hole 9" %}

### Configurazione installazione Pi-Hole

Siccome da router è stato impostato come ip statico possiamo confermare, selezionando `Continue` e premendo `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_10.jpg" alt="Pi-Hole 10" %}

Selezionare la stessa interfaccia a cui era stato assegnato l'ip usato durante tutta la procedura. In questo caso la prima. Premere `Invio` per confermare.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_11.jpg" alt="Pi-Hole 11" %}

Selezionare un provider DNS provvisorio. Successivamente verrà tolto siccome il computer con Ubuntu Server diventerà un DNS resolver lui stesso alla porta `5353` e indirizzo `127.0.0.1`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_12.jpg" alt="Pi-Hole 12" %}

Selezionare `Yes` per includere liste di terzi per filtrare i contenuti e confermare premendo `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_13.jpg" alt="Pi-Hole 13" %}

Confermare l'installazione dell'interfaccia web per dove fare ulteriori modifiche alle impostazioni. Selezionare `Yes` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_14.jpg" alt="Pi-Hole 14" %}

Confermare l'installazione del server web lighttpd per rendere l'interfaccia web funzionante. Selezionare `Yes` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_15.jpg" alt="Pi-Hole 15" %}

Abilitare il logging delle query per eventuali debug di problemi. Selezionare `Yes` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_16.jpg" alt="Pi-Hole 16" %}

In questa schermata si può scegliere  quanti contenuti sono visualizzabili da interfaccia web dell'admin. Lasciare a default `Show everything`. Selezionare `Continue` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_17.jpg" alt="Pi-Hole 17" %}

Qui verrà visualizzata la password autogenerata per loggare nell'interfaccia web tramite l'ip del computer. Non è importante ricordarla siccome verrà successivamente cambiare con una più lunga per sicurezza. Premere `Invio` per continuare.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_18.jpg" alt="Pi-Hole 18" %}

Terminata la procedura di configurazione di Pi-Hole, si può procedere a cambiare la password dell'interfaccia admin (da non confondere con la password utente).

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_19.jpg" alt="Pi-Hole 19" %}

Per cambiare la password dell'interfaccia web di Pi-Hole usare il comando `pihole -a -p`.


{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_20.jpg" alt="Pi-Hole 20" %}

Dopo aver premuto `Invio` inserire la password, premere di nuovo `Invio`, reinserire la password e confermare infine sempre con il tasto `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_21.jpg" alt="Pi-Hole 21" %}

Se la procedura ha avuto successo comparirà la scritta `New password set`

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_22.jpg" alt="Pi-Hole 22" %}

**[Parte successiva]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-4 %})**
