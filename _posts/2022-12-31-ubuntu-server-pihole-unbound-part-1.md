---
title: Installazione e configurazione server DNS (Parte 1) - Installazione Ubuntu Server
description: Guida installazione e configurazione Ubuntu Server, Pi-Hole e Unbound
date: 2022-12-31 10:00:00 +0100
ogimg: "https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_19.jpg"
---

In questa guida verrà illustrato come installare Ubuntu Server (sistema operativo) insieme ai tool FOSS [Pi-Hole](https://it.wikipedia.org/wiki/Pi-hole) (dns ad-blocker) e [Unbound](https://it.wikipedia.org/wiki/Unbound) (dns resolver).
Inoltre viene fatto uso dell'autenticazione a due fattori (2FA) come ulteriore protezione da accessi non autorizzati.

## Requisiti

Pi-Hole e Unbound posso essere installati in un sistema operativo diverso da Ubuntu Server. Nel caso si utilizzi un Raspberry Pi (Model B o Zero) o simili, è possibile installare un sistema operativo diverso (quindi saltando l'installazione di Ubuntu Server) e seguire il resto della guida.
Se installato su un computer con OS Linux vanno bene anche 2GB di RAM.

## Preparazione installazione Ubuntu Server

Per prima cosa si procede all'installazione della distro Ubuntu Server 22.04 scaricabile dal [sito ufficiale](https://ubuntu.com/download/server).

### Installazione nel drive USB

Dopo aver scaricato il file iso della distro bisogna montarlo in un drive USB. Come programmi per montare l’immagine, si può utilizzare Balena Etcher, UNetbootin oppure Rufus (tutti FOSS).

### Boot da USB

Durante la fase di P.O.S.T. del computer bisogna selezionare il tasto per visualizzare il menu di boot, in modo da avviare il sistema operativo da drive USB.
Selezionare con i tasti freccia la voce `Try or Install Ubuntu Server` e premere il tasto Invio.

![Ubuntu Server 1](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_1.jpg)

### Scelta lingua

La prima scelta di configurazione riguarda la lingua di sistema. Si può selezionare `English` perché non verrà installata nessuna interfaccia grafica nel computer e quindi diventa irrilevante.

![Ubuntu Server 2](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_2.jpg)

### Aggiornamento installer

Se la versione installata in chiavetta non è l'ultima allora chiede se si vuole aggiornare (in questo caso dalla 22.04 alla 22.07) prima di effettuare l'installazione.
Non è importante perchè verrà comunque fatto l'aggiornamento da riga di comando alla fine dell'installazione del sistema operativo.
Per ignorare l'aggiornamento basta confermare la voce `Continue without updating`.

![Ubuntu Server 3](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_3.jpg)

### Configurazione tastiera

Sciegliere il layout della tastiera usata. Verificare che alle voci `Layout` e `Variant` sia scritto `Italian`, altrimenti scieglierlo dal rispettivo menù.
Confermare premendo la voce `Ok` e successivamente `Done`.

![Ubuntu Server 4](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_4.jpg)

![Ubuntu Server 5](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_5.jpg)

### Tipo di installazione

Verificare che sia presente la spunta alla voce `Ubuntu Server`, altrimenti selezionarla utilizzando il tasto `Spazio`.
Premendo invio alla voce `Done` per confermare.

![Ubuntu Server 6](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_6.jpg)

### Connessioni di rete

Verificare che in almeno una interfaccia non sia presente la scritta `not connected`, e ricordarsi l'indirizzo IP (presente dopo DHCPv4 e senza lo slash e il numero successivo) perchè servirà per collegarsi con il protocollo ssh ed eseguire i comandi da remoto.
Importante assegnare questo indirizzo come statico nelle impostazioni del router della rete in modo che non cambi.
Premere inivio alla voce `Done`.

![Ubuntu Server 7](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_7.jpg)

### Configurazione proxy

In questo caso non viene fatto uso del proxy, quindi, non va inserito nulla nello spazio bianco ma semplicemente confermiamo di nuovo la voce `Done`.

![Ubuntu Server 8](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_8.jpg)

### Mirror alternativo repository

Verificare che sia presente un mirror per ritrovare pacchetti e aggiornamenti del sistema operativo. In questo caso va bene `http://it.archive.ubuntu.com/ubuntu`.
Confermare alla voce `Done`.

![Ubuntu Server 9](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_9.jpg)

### Configurazione spazio su disco guidata

Va bene la configurazione di default dello spazio come mostrato nel seguente screen. Per confermare premere `Done`.

![Ubuntu Server 10](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_10.jpg)

### Configurazione spazio su disco

Nella seguente schermata si vede più in dettaglio la formattazione del disco. Per confermare selezionare `Done`e successivamente `Continue`.

![Ubuntu Server 11](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_11.jpg)

![Ubuntu Server 12](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_12.jpg)

### Impostazioni profilo

Importare il nome, nome server, nome utente e password.
È importante non perdere nome utente e la password altrimenti non è più possibile loggare all'interno del sistema operativo.
I campi username e password serviranno successivamente per fare il login via SSH.

![Ubuntu Server 13](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_13.jpg)

### Impostazioni SSH

Selezionare con il tasto `Spazio` la voce `Install OpenSSH server` in modo che installi e renda accessibile il server tramite il protocollo ssh (di default porta 22) per il controllo remoto.
Per confermare selezionare `Done`.

![Ubuntu Server 14](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_14.jpg)

### Componenti aggiuntivi per il server

In questa schermata è possibile abilitare l’installazione di ulteriori componenti aggiuntivi per aggiungere funzionalità al server. In questo caso non serve nessuno di essi (quelli che installeremo successivamente non sono presenti in questa lista) quindi basta selezionare `Done` per iniziare l'installazione effettiva del sistema operativo.

![Ubuntu Server 15](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_15.jpg)

## Installazione del sistema operativo

Ora il sistema operativo viene installato nel disco interno del computer.

![Ubuntu Server 16](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_16.jpg)

Alla fine della procedura compare la voce `Reboot Now`. Premere `Invio`.

![Ubuntu Server 17](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_17.jpg)

Verrà richiesto di rimuovere il drive USB che abbiamo usato per l'installazione. Dopo averlo scollegato premere il tasto `Invio` per riavviare il computer.

![Ubuntu Server 18](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_18.jpg)

Ora il computer procederà al riavvio.

![Ubuntu Server 19](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/1_Ubuntu_Server/Ubuntu_Server_19.jpg)

**[Parte successiva]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-2 %})**
