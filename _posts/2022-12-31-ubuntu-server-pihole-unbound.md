---
title: Guida alla creazione di un server DNS in rete locale
description: Guida installazione e configurazione Ubuntu Server, Pi-Hole e Unbound
date: 31-12-2022
image: "https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.jpg"
---

*Guida installazione e configurazione Ubuntu Server, Pi-Hole e Unbound*

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

![Ubuntu Server 1](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_1.jpg)

### Scelta lingua

La prima scelta di configurazione riguarda la lingua di sistema. Si può selezionare `English` perché non verrà installata nessuna interfaccia grafica nel computer e quindi diventa irrilevante.

![Ubuntu Server 2](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_2.jpg)

### Aggiornamento installer

Se la versione installata in chiavetta non è l'ultima allora chiede se si vuole aggiornare (in questo caso dalla 22.04 alla 22.07) prima di effettuare l'installazione.
Non è importante perchè verrà comunque fatto l'aggiornamento da riga di comando alla fine dell'installazione del sistema operativo.
Per ignorare l'aggiornamento basta confermare la voce `Continue without updating`.

![Ubuntu Server 3](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_3.jpg)

### Configurazione tastiera

Sciegliere il layout della tastiera usata. Verificare che alle voci `Layout` e `Variant` sia scritto `Italian`, altrimenti scieglierlo dal rispettivo menù.
Confermare premendo la voce `Ok` e successivamente `Done`.

![Ubuntu Server 4](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_4.jpg)

![Ubuntu Server 5](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_5.jpg)

### Tipo di installazione

Verificare che sia presente la spunta alla voce `Ubuntu Server`, altrimenti selezionarla utilizzando il tasto `Spazio`.
Premendo invio alla voce `Done` per confermare.

![Ubuntu Server 6](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_6.jpg)

### Connessioni di rete

Verificare che in almeno una interfaccia non sia presente la scritta `not connected`, e ricordarsi l'indirizzo IP (presente dopo DHCPv4 e senza lo slash e il numero successivo) perchè servirà per collegarsi con il protocollo ssh ed eseguire i comandi da remoto.
Importante assegnare questo indirizzo come statico nelle impostazioni del router della rete in modo che non cambi.
Premere inivio alla voce `Done`.

![Ubuntu Server 7](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_7.jpg)

### Configurazione proxy

In questo caso non viene fatto uso del proxy, quindi, non va inserito nulla nello spazio bianco ma semplicemente confermiamo di nuovo la voce `Done`.

![Ubuntu Server 8](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_8.jpg)

### Mirror alternativo repository

Verificare che sia presente un mirror per ritrovare pacchetti e aggiornamenti del sistema operativo. In questo caso va bene `http://it.archive.ubuntu.com/ubuntu`.
Confermare alla voce `Done`.

![Ubuntu Server 9](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_9.jpg)

### Configurazione spazio su disco guidata

Va bene la configurazione di default dello spazio come mostrato nel seguente screen. Per confermare premere `Done`.

![Ubuntu Server 10](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_10.jpg)

### Configurazione spazio su disco

Nella seguente schermata si vede più in dettaglio la formattazione del disco. Per confermare selezionare `Done`e successivamente `Continue`.

![Ubuntu Server 11](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_11.jpg)

![Ubuntu Server 12](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_12.jpg)

### Impostazioni profilo

Importare il nome, nome server, nome utente e password.
È importante non perdere nome utente e la password altrimenti non è più possibile loggare all'interno del sistema operativo.
I campi username e password serviranno successivamente per fare il login via SSH.

![Ubuntu Server 13](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_13.jpg)

### Impostazioni SSH

Selezionare con il tasto `Spazio` la voce `Install OpenSSH server` in modo che installi e renda accessibile il server tramite il protocollo ssh (di default porta 22) per il controllo remoto.
Per confermare selezionare `Done`.

![Ubuntu Server 14](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_14.jpg)

### Componenti aggiuntivi per il server

In questa schermata è possibile abilitare l’installazione di ulteriori componenti aggiuntivi per aggiungere funzionalità al server. In questo caso non serve nessuno di essi (quelli che installeremo successivamente non sono presenti in questa lista) quindi basta selezionare `Done` per iniziare l'installazione effettiva del sistema operativo.

![Ubuntu Server 15](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_15.jpg)

## Installazione del sistema operativo

Ora il sistema operativo viene installato nel disco interno del computer.

![Ubuntu Server 16](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_16.jpg)

Alla fine della procedura compare la voce `Reboot Now`. Premere `Invio`.

![Ubuntu Server 17](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_17.jpg)

Verrà richiesto di rimuovere il drive USB che abbiamo usato per l'installazione. Dopo averlo scollegato premere il tasto `Invio` per riavviare il computer.

![Ubuntu Server 18](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_18.jpg)

Ora il computer procederà al riavvio.

![Ubuntu Server 19](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/1_Ubuntu_Server/Ubuntu_Server_19.jpg)

## SSH

Dopo l'installazione si procede ad aggiornare il sistema e i pacchetti installati alla loro ultima versione.

### Login via SSH

Per accedere aprire il terminale in un altro computer nella stessa rete (Powershell nel caso di Windows) e digitare il seguente comando:
```shell
	ssh USERNAME@IP
```

`USERNAME` è da sostituire con il nome utente inserito durante la fase di installazione di Ubuntu Server (Impostazioni profilo)
Al posto di `IP` va inserito l'indirizzo ip del computerdove è installato Ubuntu Server.
`-p 22` è opzionale dato che di default ssh si collega alla porta 22 del dispositivo.

![2FA 1](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_1.jpg)

Dopo aver premuto invio chiederà di salvare la chiave SHA256. Scrivere `y` e confermare premento il tasto `Invio`.

![2FA 2](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_2.jpg)

Ora inserire la password impostata durante la fase di installazione di Ubuntu Server (Impostazioni profilo).

![2FA 3](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_3.jpg)

Se è stato inserito tutto correttamente allora è possibile controllare Ubuntu Server da remoto da CLI.

![2FA 4](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_4.jpg)

## Aggiornamento sistema

![2FA 5](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_5.jpg)

### Aggiornare repository e sistema

Per avviare l'aggiornamento basta eseguire la riga `sudo apt update && sudo apt upgrade`. Eseguendo entrambi i comandi con `sudo` verrà chiesta la password dell'utente (la stessa usata per fare il login).

![2FA 6](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_6.jpg)

### Conferma aggiornamenti

Per confermare l'avvio degli aggiornamenti scrivere `y` e premere `Invio`.

![2FA 7](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_7.jpg)

### Riavvio servizi

È probabile che compaia una schermata come la seguente che chiede quali servizi riavviare. Selezionare `Ok` senza cambiare nulla dalla lista e successivamente premere `Invio` per confermare.

![2FA 8](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_8.jpg)

Ora si può riavviare il computer per verificare che con gli ultimi aggiornamenti il sistema funziona prima di procedere all’installazione delle applicazioni.

![2FA 9](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_9.jpg)

## Installazione 2FA

Nella seguente procedura verrà aggiunta l'autenticazione a due fattori per ridurre il rischio di accessi non autorizzati (Zero Trust).

### Installazione pacchetto

Effettuare di nuovo il login seguendo la procedura `Login via SSH` senza il paragrafo riguardante la chiave.

Eseguire il comando `sudo apt install libpam-google-authenticator` per installere il pacchetto richiesto per l'autenticazione a due fattori.

![2FA 10](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_10.jpg)

Inserire la password utente confermandola. Successivamente verrà chiesta la conferma per installare il pacchetto. Scrivere `y` e premere `Invio`.

### Configurazione 2FA

Ora si procede a configurare l'autenticazione con il codice a 6 cifre temporaneo (cambia ogni 30 secondi).

![2FA 11](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_11.jpg)

Verrà chiesto se si vuole che i token siano temporanei. Scrivere `y` e premere `Invio`.

![2FA 12](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_12.jpg)

Verrà creata la chiave segreta (`Your new secret key is:`) per la generazione dei codici a tempo.
È importante tenere un backup di questa chiave per ridurre il rischio di perderla.
Scansionare il QR-Code oppure inserire la chiave in un'applicazione (per distro Debian e derivate va bene Authenticator già presente nei repository di sistema) e salvare.
Dopo aver salvato si può vedere il codice. Inserirlo nel terminale e premere `Invio` per confermare.

![2FA 13](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_13.jpg)

Successivamente chiederà se si vuole aggiornare il file .google_authenticator. Confermare scrivendo `y` e premendo `Invio`.

![2FA 14](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_14.jpg)

Per aumentare la sicurezza aggiungiamo le restrizioni di login ogni 30 secondi (quindi un solo login con successo per ogni codice generato).
Per confermare scrivere `y` e premere `Invio`.

![2FA 15](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_15.jpg)

Verrà chiesto se si vuole estendere il login con il codice generato oltre il limite di tempo da 3 codici a 17 (8 precedenti, corrente e 8 successivi). Siccome 3 vanno già bene non va esteso ulteriormente quindi scrivere `n` e premere `Invio`.

![2FA 16](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_16.jpg)

Ora verrà confermata l'aggiunta del rate-limit, in modo tale che siano possibili solo 3 tentativi di login ogni 30 secondi. Per far ciò scrivere `y` e premere `Invio`.

![2FA 17](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_17.jpg)

### Aggiunta 2FA al login

Per aggiungere l'autenticazione a due fattori appena configurata bisogna modificare il file common-session con il comando `sudo nano /etc/pan.d/common-session`. Se viene richiesta la password inserire quella dell'utente.

![2FA 18](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_18.jpg)

Premendo `Invio` comparirà il file da editare. Dopo la riga `# end of pam-auth-update config` bisogna aggiungere una nuova riga che contiene `auth required pam_google_authenticator.so` come quella evidenziata nello screen successivo.
Per salvare le modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

![2FA 19](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_19.jpg)

Altro file da modificare è `sshd_config`. Per fare ciò basta di nuovo aprirlo con il comando `sudo nano /etc/ssh/sshd_config`. Se chiede la password, inserire quella dell'utente.

![2FA 20](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_20.jpg)

Se alla voce `KbdInteractiveAuthentication` è presente l’opzione `no`, allora sostituirla con `yes`.
Per salvare anche queste modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

![2FA 21](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_21.jpg)

Riavviare il servizio sshd.service per caricare le modifiche con il comando `sudo systemctl restart sshd.service`

![2FA 22](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/2_2FA/2FA_22.jpg)

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

## Installazione Unbound

### Installazione pacchetto

Ora di può procedere all'installazione del DNS resolver Unbound con il comando `sudo apt install unbound`.
È possibile che venga richiesta la password utente poiché viene lanciato con i privilegi di amministratore.
In caso affermativo inserirla e premere `Invio`.

![Unbound 1](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_1.jpg)

Confermare l'installazione dell'applicazione scrivendo `y` e premendo `Invio`.

![Unbound 2](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_2.jpg)

Finita l'installazione è possibile che comparirà qualche messaggio in scritto in rosso come segue. Si può ignorare dato che non influisce sul funzionamento del sistema e delle sue applicazioni.

![Unbound 3](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_3.jpg)

### Scaricamento ip risoluzione server di registrazione dei domini

Ora è possibile scaricare la lista degli IPv4 e IPv6 per risolvere i server di registrazioni dei domini. Per far ciò usare la seguente stringa: `wget -O root.hints https://www.internic.net/domain/named.root sudo mv root.hints /var/lib/unbound/`.

![Unbound 4](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_4.jpg)

Premere `Invio` per lanciare il tutto.

![Unbound 5](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_5.jpg)

### Configurazione file

È necessario modificare il file di configurazione di Unbound. Per far ciò scrivere il comando `sudo nano /etc/unbound/unbound.conf.d/pi-hole.conf` e confermare con la password utente siccome viene eseguito con privilegi di amministratore.

![Unbound 6](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_6.jpg)

All'interno del file vuoto dovrà essere inserito il seguente testo:

```apacheconf
server:
    # If no logfile is specified, syslog is used
    # logfile: "/var/log/unbound/unbound.log"
    verbosity: 0
    interface: 127.0.0.1
    port: 5353
    do-ip4: yes
    do-udp: yes
    do-tcp: yes
    # May be set to yes if you have IPv6 connectivity
    do-ip6: no
    # You want to leave this to no unless you have *native* IPv6. With 6to4 and
    # Terredo tunnels your web browser should favor IPv4 for the same reasons
    prefer-ip6: no
    # Use this only when you downloaded the list of primary root servers!
    # If you use the default dns-root-data package, unbound will find it automatically
    #root-hints: "/var/lib/unbound/root.hints"
    # Trust glue only if it is within the server's authority
    harden-glue: yes
    # Require DNSSEC data for trust-anchored zones, if such data is absent, the zone becomes BOGUS
    harden-dnssec-stripped: yes
    # Don't use Capitalization randomization as it known to cause DNSSEC issues sometimes
    # see https://discourse.pi-hole.net/t/unbound-stubby-or-dnscrypt-proxy/9378 for further details
    use-caps-for-id: no
    # Reduce EDNS reassembly buffer size.
    # Suggested by the unbound man page to reduce fragmentation reassembly problems
    edns-buffer-size: 1472
    # Perform prefetching of close to expired message cache entries
    # This only applies to domains that have been frequently queried
    prefetch: yes
    # One thread should be sufficient, can be increased on beefy machines. In reality for most users running on small networks or on a single machine, it should be unnecessary to seek performance enhancement by increasing num-threads above 1.
    num-threads: 1
    # Ensure kernel buffer is large enough to not lose messages in traffic spikes
    so-rcvbuf: 1m
    # Ensure privacy of local IP ranges
    private-address: 192.168.0.0/16
    private-address: 169.254.0.0/16
    private-address: 172.16.0.0/12
    private-address: 10.0.0.0/8
    private-address: fd00::/8
    private-address: fe80::/10
```

Link al file di riferimento: [`pi-hole.conf`](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/pi-hole.conf)

Alle righe che iniziano con `interface` e `port` (in questo caso contengono rispettivamente `127.0.0.1` e `5353`) avranno le stringhe che successivamente verrano inserite nelle impostazioni di Pi-Hole da interfaccia web.

![Unbound 7](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_7.jpg)

Per uscire premere `CTRL+X`. Chiederà se si vuole salvare e confermare scrivendo `y` e premere `Invio`.

![Unbound 8](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_8.jpg)

Confermare il nome e percorso di salvataggio del file premendo `Invio`.

![Unbound 9](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_9.jpg)

### Verifica correttezza file

Per avere la certezza che il file sia stato salvato correttamente copiare il seguente comando `sudo cat /etc/unbound/unbound.conf.d/pi-hole.conf` e premere `Invio` per eseguirlo.

![Unbound 10](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_10.jpg)

Controllare che sia uguale a quanto precedentemente copiato.

![Unbound 11](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_11.jpg)

### Riavvio servizio Unbound

Riavviare Unbound per caricare la nuova configurazione: `sudo service unbound restart` e premere `Invio`. È possibile che venga richiesta la password utente poiché viene lanciato con i privilegi di amministratore. In caso affermativo inserirla e premere `Invio`.

![Unbound 12](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_12.jpg)

### Verifica funzionamento DNSSEC

I seguenti comandi servono a verificare che DNSSEC funzioni in modo corretto.
Primo comando: `dig pi-hole.net @127.0.0.1 -p 5353`

![Unbound 14](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_14.jpg)

Il seguente comando dovrebbe ritornare SERVFAIL senza nessun indirizzo IP: `dig sigfail.verteiltesysteme.net @127.0.0.1 -p 5353`.

![Unbound 16](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_16.jpg)

Questo comando dovrebbe ritornare NOERROR con un indirizzo IP: `dig sigok.verteiltesysteme.net @127.0.0.1 -p 5353`.
Se entrambi ritornano in modo corretto allora DNSSEC funziona. 

![Unbound 18](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/doc/4_Unbound/Unbound_18.jpg)

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