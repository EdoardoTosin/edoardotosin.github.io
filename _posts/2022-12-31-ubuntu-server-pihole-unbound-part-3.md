---
title: Installazione e configurazione server DNS (Parte 3) - Installazione Pi-Hole
description: Guida installazione e configurazione Ubuntu Server, Pi-Hole e Unbound
date: 2022-12-31
ogimg: "https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_7.jpg"
---

*Nella [parte precedente]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-2 %}) è stato spiegato come aggiungere l'autenticazione a due fattori (2FA) per l'accesso via SSH.*

## Installazione Pi-Hole

In questa fase verrà installato Pi-Hole, un software open source che agisce come [DNS sinkhole](https://it.wikipedia.org/wiki/DNS_sinkhole) e volendo anche come server DHCP. Questa applicazione filtrerà le richieste DNS per ridurre drasticamente la pubblicità presente nelle pagine web.

### Download repository ufficiale

Come primo passo c'è da scaricare il repository di Pi-Hole: `git clone --depth 1 https://github.com/pi-hole/pi-hole.git Pi-hole`.

![Pi-Hole 2](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_2.jpg)

Alla fine del download entriamo all'interno della cartella: `cd 'Pi-hole/automated install/'`.

![Pi-Hole 4](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_4.jpg)

### Preparazione installazione Pi-Hole

Da questa directory lanciare lo script bash: `sudo bash basic-install.sh`.
È possibile che chieda la password utente poiché viene lanciato con i privilegi di amministratore.
In caso affermativo inserirla e premere `Invio`.

![Pi-Hole 6](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_6.jpg)

Si attende qualche momento per il controllo che sia tutto compatibile e non ci siano conflitti.

![Pi-Hole 7](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_7.jpg)

Premete `Invio` per ciascuna delle due schermate per iniziare la configurazione.

![Pi-Hole 8](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_8.jpg)

![Pi-Hole 9](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_9.jpg)

### Configurazione installazione Pi-Hole

Siccome da router è stato impostato come ip statico possiamo confermare, selezionando `Continue` e premendo `Invio`.

![Pi-Hole 10](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_10.jpg)

Selezionare la stessa interfaccia a cui era stato assegnato l'ip usato durante tutta la procedura. In questo caso la prima. Premere `Invio` per confermare.

![Pi-Hole 11](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_11.jpg)

Selezionare un provider DNS provvisorio. Successivamente verrà tolto siccome il computer con Ubuntu Server diventerà un DNS resolver lui stesso alla porta `5353` e indirizzo `127.0.0.1`.

![Pi-Hole 12](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_12.jpg)

Selezionare `Yes` per includere liste di terzi per filtrare i contenuti e confermare premendo `Invio`.

![Pi-Hole 13](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_13.jpg)

Confermare l'installazione dell'interfaccia web per dove fare ulteriori modifiche alle impostazioni. Selezionare `Yes` e premere `Invio`.

![Pi-Hole 14](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_14.jpg)

Confermare l'installazione del server web lighttpd per rendere l'interfaccia web funzionante. Selezionare `Yes` e premere `Invio`.

![Pi-Hole 15](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_15.jpg)

Abilitare il logging delle query per eventuali debug di problemi. Selezionare `Yes` e premere `Invio`.

![Pi-Hole 16](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_16.jpg)

In questa schermata si può scegliere  quanti contenuti sono visualizzabili da interfaccia web dell'admin. Lasciare a default `Show everything`. Selezionare `Continue` e premere `Invio`.

![Pi-Hole 17](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_17.jpg)

Qui verrà visualizzata la password autogenerata per loggare nell'interfaccia web tramite l'ip del computer. Non è importante ricordarla siccome verrà successivamente cambiare con una più lunga per sicurezza. Premere `Invio` per continuare.

![Pi-Hole 18](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_18.jpg)

Terminata la procedura di configurazione di Pi-Hole, si può procedere a cambiare la password dell'interfaccia admin (da non confondere con la password utente).

![Pi-Hole 19](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_19.jpg)

Per cambiare la password dell'interfaccia web di Pi-Hole usare il comando `pihole -a -p`.


![Pi-Hole 20](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_20.jpg)

Dopo aver premuto `Invio` inserire la password, premere di nuovo `Invio`, reinserire la password e confermare infine sempre con il tasto `Invio`.

![Pi-Hole 21](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_21.jpg)

Se la procedura ha avuto successo comparirà la scritta `New password set`

![Pi-Hole 22](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/3_Pi-Hole/Pi-Hole_22.jpg)

**[Parte successiva]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-4 %})**
