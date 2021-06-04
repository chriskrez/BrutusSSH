<p align="center">
  <img src="./brutus_app/public/logo-mini.png">
</p>

# Brutus SSH

Brutus SSH is a tool which analyzes SSH log files. It consists of 3 subtools.

- The electron application
- The attack notifier via email
- A bash script

## Electron Application

The first tool, which analyzes SSH log files, has a graphical interface, too. It visualizes statistical information, that is extracted from the access log, such as usernames, IPs and countries of origin.

### Installation

Prerequisites:

- npm v6.14.11
- node v15.8.0

Step 1:
Cd to the file of the project

```
cd brutus_app/
```

Step 2:
Install the required dependencies

```sh
$ npm install
```

Step 3:
Launch the app using the following command

```sh
$ npm start
```

### Build

Create the executables for your platform

```sh
$ npm run release
```

Run the program in `./dist` (**exe** for windows, **AppImage** for linux)

<hr />

## Attack Notifier via Email

This python script can be placed on a server and used periodically (using a cron job) to notify the owner of the server when failed attempts of login surpass a _threshold_.

The script draws the information needed from the **emailDefaults.json** file which is generated the first time the script runs and needs to be filled by the owner of the server. A template of this file is stated below.

```
{
  "log_path":"/var/log/auth.log",
  "time_window":"5",
  "threshold": "50",
  "email_sender": "example@example.com",
  "email_receiver": "example@example.com",
  "gmail_token: "example"
}
```

### Use

**Step 1**: Download the files (python script, logo) from the `email_attack` folder and upload them into your server.

**Step 2**: Run the python script to generate the `emailDefaults.json` file or create it on your own as mentioned above.

- **log_path**: the path where the script will find the SSH logs file which is usually stored under `/var/log/auth.log`
- **time_window**: the time period in which every execution of the script will search for failed login attempts on the log file. Example: if time window equals "5" the script will search the last 5 minutes of the logs. This should match the time that the cron job will be repeated.
- **threshold**: the number of failed login attempts which if
  exceeded the email will be send
- **email_sender**: the sender of the email (an email you have access to)
- **email_reciever**: the reciever of the email (should be the administrator of the server, can be the same as **email_sender**)
- **gmail_token**: this gmail token should be generated through your Google Account in order to actually send the email from the provided sender's account. Click [here](https://support.google.com/mail/answer/185833/sign-in-using-app-passwords?hl=en-GB) to learn how to generate your gmail token

The command to run the script should be:

```
python3 emailAttack.py
```

**Step 3**: Create a cron job that will execute the python script. Make sure to repeat the cron job at the same time period stated as _time_window_ on the emailDefaults.json.

&#x2611; You should use **Python 3** to run the script!

&#x2611; You might need to add **sudo** before the command to run the script as it needs access to the file **/var/log/auth.log**. To run the cron job you should designate this command to be passwordless through **/etc/sudoers** since the cron job cannot prompt for the password.

<hr />

## Brutus SSH Bash Script

Prerequisites:

- sed
- awk
- geoip
- figlet

There is also a simple bash script which takes as arguement the log file and prints to the console the most used usernames, the most common ips and countries.
