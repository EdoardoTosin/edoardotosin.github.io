---
title: Installazione e configurazione server DNS (Parte 5) - Configurazione Pi-Hole
description: Guida installazione e configurazione Ubuntu Server, Pi-Hole e Unbound
date: 2022-12-31 10:00:00 +0100
ogimg: "https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_1.jpg"
---

*Nella [parte precedente]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-4 %}) è stato spiegato come installare Unbound.*

## Configurazione Pi-Hole da interfaccia web

Aprire il browser e inserire l'IP del computer dove è installato Ubuntu Server. Dovrebbe comparire una schermata come la seguente. Cliccare dove c'è scritto `Did you mean to go to the admin panel?` per entrare nella pagina di login.

![Pi-Hole Web Interface 1](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_1.jpg)

Dovrebbe comparire una schermata simile. Dal menù a destra cliccare la voce `Login`.

![Pi-Hole Web Interface 2](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.jpg)

Verrà chiesta la password di Pi-Hole per l'interfaccia web. Inserirla e cliccare `Login` per confermare ed entrare.

![Pi-Hole Web Interface 3](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_3.jpg)

La seguente schermata è quella prima di fare il login. La differenza è che ora c’è la possibilità di configurare Pi-Hole.

![Pi-Hole Web Interface 4](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_4.jpg)

Cliccare nel menù a sinistra alla voce `Settings`. 

![Pi-Hole Web Interface 5](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_5.jpg)

Cliccare `DNS` dalle voci presenti in alto.

![Pi-Hole Web Interface 6](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_6.jpg)

Dal blocco intitolato `Upstream DNS Servers` a sinistra deselezionare qualsiasi spunta presente. In quello omonimo di destra, invece, selezionare `Custom 1 (IPv4)` e inserire `127.0.0.1#5353` che sono l'interfaccia e la porta che erano state precedentemente inserite nel file di configurazione di Unbound. Questo farà di che Pi-Hole chiede ad Unbound la risoluzione dns al posto di utilizzare un server esterno alla rete.

![Pi-Hole Web Interface 7](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_7.jpg)

Nel blocco intitolato `Interface settings`, cliccare la voce `Bind only to interface ...`.

![Pi-Hole Web Interface 8](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_8.jpg)

Per salvare tutto ciò scrollare in giù con il mouse e cliccare `Save` presente in basso a destra nella schermata.

![Pi-Hole Web Interface 9](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_9.jpg)

### Backup impostazioni Pi-Hole

Per sicurezza scaricare l'attuale configurazione di Pi-Hole in modo tale che in caso di bisogno di ripristino delle impostazioni sia più veloce farlo da file.
Per fare ciò premere cliccare dal menù orizzontale presente in alto la voce `Teleporter`. Infine cliccare `Backup` e confermare il salvataggio del file.

![Pi-Hole Web Interface 10](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_10.jpg)

## Configurazione router

Ora dalle impostazioni del router (consultare il manuale del router per capire dove trovare l'impostazione) si può cambiare il DNS all'IP del computer dove è stato installato Ubuntu Server. Questo farà si che ogni dispositivo collegato in rete con DNS automatico farà richiesta di risoluzione al router che a sua volte replicherà i pacchetti al sistema filtrando gran parte della pubblicità dai siti web e anche contenuti pericolosi.
