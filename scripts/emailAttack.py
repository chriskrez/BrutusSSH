from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import json
import os.path
import re
import requests
import smtplib

MONTHS = {"Jan":"01", "Feb":"02", "Mar":"03", "Apr":"04", "May":"05", "Jun":"06", "Jul":"07", "Aug":"08", "Sep":"09", "Oct": "10", "Nov": "11", "Dec": "12"}

def readDefaults():
    if os.path.isfile("./emailDefaults.json"):
        with open("emailDefaults.json") as defFile:
            data = json.load(defFile)
            global LOG_PATH, TIME_WINDOW, THRESHOLD, EMAIL_RECEIVER
            LOG_PATH = data["log_path"]
            TIME_WINDOW = int(data["time_window"])
            THRESHOLD = int(data["threshold"])
            EMAIL_RECEIVER = data["email_receiver"]
    else:
        content = {
            "log_path":"/var/log/auth.log",
            "time_window":"5",
            "threshold": "50",
            "email_sender": "example@example.com"
        }

        print("Please fill the default values in emailDefaults.json")
        with open('emailDefaults.json', 'w') as defaults:
            json.dump(content, defaults)

def checkAttack():
    with open(LOG_PATH, "r") as logs:
        now = datetime.now() - timedelta(minutes=TIME_WINDOW)
        flag = False
        ips = []
        while True:
            line = logs.readline()
            if not line:
                break

            if not flag:
                time = re.split('\s+',line)[:3]
                time = f"{now.year} {MONTHS[time[0]]} {' '.join(time[1:])}"
                date = datetime.strptime(time, "%Y %m %d %H:%M:%S")
                if date >= now:
                    flag = True
                else:
                    continue
            if "Invalid user" in line:
                reg = re.compile("from (.*) port")
                ips.append(reg.search(line).group(1))

        if len(ips) >= THRESHOLD:
            post = []
            for ip in set(ips):
                post.append({"query": ip, "fields": "country,query"})
            res = requests.post("http://ip-api.com/batch", json=post)
            sendMail()

def sendMail():
    smtpObj = smtplib.SMTP('localhost')
    msg = MIMEMultipart()
    message = """
    <b> Brutus SSH </b>    
    """

    msg['From'] = "info@brutus.ml"
    msg['To'] = EMAIL_RECEIVER
    msg['Subject'] = "BrutusSSH Attack Notification"
    msg.attach(MIMEText(message, 'html'))
    smtpObj.send_message(msg)

if __name__ == "__main__":
    readDefaults()
    checkAttack()
